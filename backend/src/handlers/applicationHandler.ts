import db from "../db/db.js";
import { eq, and } from "drizzle-orm";
import { applicationsTable, applicationUserRolesTable, usersTable, userRolesTable } from "../db/schema.js";
import {
  validateSessionToken,
} from "../lib/session.js";
import type { SessionValidationResult } from "../lib/session.js";
import type { Response } from "express";
import { hasPermission, getUserPermissions } from "../lib/permissions.js";
import { randomBytes } from "crypto";

// Types for permission definitions
interface PermissionConstraints {
  exclusive?: boolean;           // User can only have this permission (no others)
  onlyOneInCategory?: boolean;   // User can only have one permission from this category
  prerequisites?: string[];      // Permission codes required before this one can be assigned
}

interface PermissionDefinition {
  code: string;
  name: string;
  description?: string;
  category?: string;
  constraints?: PermissionConstraints;
}

interface CategoryDefinition {
  code: string;
  name: string;
}

interface PermissionsDefinition {
  permissions: PermissionDefinition[];
  categories?: CategoryDefinition[];
}

// Validate permissions definition structure (supports both old "roles" and new "permissions" format)
function validatePermissionsDefinition(data: any): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: "Permissions definition must be an object" };
  }

  // Support both old "roles" format and new "permissions" format
  const permissions = data.permissions || data.roles;
  
  if (!Array.isArray(permissions)) {
    return { valid: false, error: "Permissions definition must have a 'permissions' array" };
  }

  // Validate categories if provided
  const categoryCodes = new Set<string>();
  if (data.categories) {
    if (!Array.isArray(data.categories)) {
      return { valid: false, error: "Categories must be an array" };
    }
    for (const cat of data.categories) {
      if (!cat.code || typeof cat.code !== 'string') {
        return { valid: false, error: "Each category must have a 'code' string" };
      }
      if (!cat.name || typeof cat.name !== 'string') {
        return { valid: false, error: "Each category must have a 'name' string" };
      }
      if (cat.code.length < 1) {
        return { valid: false, error: "Category code cannot be empty" };
      }
      if (!/^[a-z0-9_]+$/.test(cat.code)) {
        return { valid: false, error: `Category code '${cat.code}' contains invalid characters. Use only lowercase letters, numbers, and underscores.` };
      }
      if (categoryCodes.has(cat.code)) {
        return { valid: false, error: `Duplicate category code: ${cat.code}` };
      }
      categoryCodes.add(cat.code);
    }
  }

  const codes = new Set<string>();
  for (const perm of permissions) {
    if (!perm.code || typeof perm.code !== 'string') {
      return { valid: false, error: "Each permission must have a 'code' string" };
    }
    if (!perm.name || typeof perm.name !== 'string') {
      return { valid: false, error: "Each permission must have a 'name' string" };
    }
    // Check if code ends with "admin" (could be "appname.admin")
    const codeOnly = perm.code.split('.').pop();
    if (codeOnly === 'admin') {
      return { valid: false, error: "Cannot define 'admin' permission - it is auto-created for Application Admins" };
    }
    if (perm.code.length < 2) {
      return { valid: false, error: `Permission code '${perm.code}' must be at least 2 characters` };
    }
    if (perm.name.length < 2) {
      return { valid: false, error: `Permission name for '${perm.code}' must be at least 2 characters` };
    }
    if (codes.has(perm.code)) {
      return { valid: false, error: `Duplicate permission code: ${perm.code}` };
    }
    codes.add(perm.code);
    
    // Validate category reference if provided
    if (perm.category && perm.category !== '' && categoryCodes.size > 0) {
      if (!categoryCodes.has(perm.category)) {
        return { valid: false, error: `Permission '${perm.code}' references unknown category '${perm.category}'` };
      }
    }
    
    // Validate onlyOneInCategory requires a category
    if (perm.constraints?.onlyOneInCategory && !perm.category) {
      return { valid: false, error: `Permission '${perm.code}' has 'onlyOneInCategory' constraint but no category specified` };
    }
    
    // Validate prerequisites reference existing permissions
    if (perm.constraints?.prerequisites) {
      for (const prereq of perm.constraints.prerequisites) {
        if (prereq === perm.code) {
          return { valid: false, error: `Permission '${perm.code}' cannot have itself as a prerequisite` };
        }
      }
    }
  }
  
  // Second pass: validate all prerequisites reference valid permission codes
  for (const perm of permissions) {
    if (perm.constraints?.prerequisites) {
      for (const prereq of perm.constraints.prerequisites) {
        if (!codes.has(prereq)) {
          return { valid: false, error: `Permission '${perm.code}' has invalid prerequisite '${prereq}'` };
        }
      }
    }
  }

  return { valid: true };
}

// Generate a secure API key
function generateApiKey(): string {
  return `app_${randomBytes(32).toString('hex')}`;
}

// Get all applications
export async function getAllApplications(token: string, res: Response) {
  try {
    const sessionValidationResult: SessionValidationResult =
      await validateSessionToken(token);

    if (
      !sessionValidationResult.session ||
      !sessionValidationResult.user
    ) {
      res.status(401).json({ message: "Token is Invalid Or Expired" });
      return;
    }

    const userId = sessionValidationResult.user.id;

    // Check if user has dev or applications.read permission
    const canView = await hasPermission(userId, "dev") ||
      await hasPermission(userId, "applications.read");

    if (!canView) {
      res.status(403).json({ message: "Insufficient permissions" });
      return;
    }

    // Get all applications with creator info
    const applications = await db
      .select({
        id: applicationsTable.id,
        name: applicationsTable.name,
        description: applicationsTable.description,
        url: applicationsTable.url,
        apiKey: applicationsTable.apiKey,
        status: applicationsTable.status,
        rolesDefinition: applicationsTable.rolesDefinition,
        createdBy: applicationsTable.createdBy,
        createdAt: applicationsTable.createdAt,
        updatedAt: applicationsTable.updatedAt,
        creatorFirstname: usersTable.firstname,
        creatorLastname: usersTable.lastname,
        creatorEmail: usersTable.email,
      })
      .from(applicationsTable)
      .leftJoin(usersTable, eq(applicationsTable.createdBy, usersTable.id));

    // Get user's permissions to check for app admin
    const userPermissions = await getUserPermissions(userId);
    const isSysAdmin = userPermissions.includes("admin");
    
    // Extract app IDs where user is admin from permissions (app.{appId}.admin)
    const adminAppIds = new Set<string>();
    for (const perm of userPermissions) {
      const match = perm.match(/^app\.(.+)\.admin$/);
      if (match) {
        adminAppIds.add(match[1]);
      }
    }

    // Add isCurrentUserAdmin flag to each application
    const applicationsWithAdminFlag = applications.map(app => ({
      ...app,
      isCurrentUserAdmin: isSysAdmin || adminAppIds.has(app.id),
    }));

    res.status(200).json({
      message: applicationsWithAdminFlag,
    });
  } catch (error) {
    res.status(400).json({ message: "An error occurred" });
    console.error(error);
  }
}

// Get a single application by ID
export async function getApplication(token: string, applicationId: string, res: Response) {
  try {
    const sessionValidationResult: SessionValidationResult =
      await validateSessionToken(token);

    if (
      !sessionValidationResult.session ||
      !sessionValidationResult.user
    ) {
      res.status(401).json({ message: "Token is Invalid Or Expired" });
      return;
    }

    const userId = sessionValidationResult.user.id;

    // Check if user has dev or applications.read permission
    const canView = await hasPermission(userId, "dev") ||
      await hasPermission(userId, "applications.read");

    if (!canView) {
      res.status(403).json({ message: "Insufficient permissions" });
      return;
    }

    const application = await db
      .select({
        id: applicationsTable.id,
        name: applicationsTable.name,
        description: applicationsTable.description,
        url: applicationsTable.url,
        apiKey: applicationsTable.apiKey,
        status: applicationsTable.status,
        rolesDefinition: applicationsTable.rolesDefinition,
        createdBy: applicationsTable.createdBy,
        createdAt: applicationsTable.createdAt,
        updatedAt: applicationsTable.updatedAt,
        creatorFirstname: usersTable.firstname,
        creatorLastname: usersTable.lastname,
        creatorEmail: usersTable.email,
      })
      .from(applicationsTable)
      .leftJoin(usersTable, eq(applicationsTable.createdBy, usersTable.id))
      .where(eq(applicationsTable.id, applicationId))
      .limit(1);

    if (!application[0]) {
      res.status(404).json({ message: "Application not found" });
      return;
    }

    res.status(200).json({
      message: application[0],
    });
  } catch (error) {
    res.status(400).json({ message: "An error occurred" });
    console.error(error);
  }
}

// Create a new application
export async function createApplication(
  token: string,
  applicationData: {
    name: string;
    description?: string;
    url?: string;
    status?: "active" | "inactive" | "pending";
    permissionsDefinition?: PermissionsDefinition;
  },
  res: Response
) {
  try {
    const sessionValidationResult: SessionValidationResult =
      await validateSessionToken(token);

    if (
      !sessionValidationResult.session ||
      !sessionValidationResult.user
    ) {
      res.status(401).json({ message: "Token is Invalid Or Expired" });
      return;
    }

    const userId = sessionValidationResult.user.id;

    // Check if user has dev or applications.create permission
    const canCreate = await hasPermission(userId, "dev") ||
      await hasPermission(userId, "applications.create");

    if (!canCreate) {
      res.status(403).json({ message: "Insufficient permissions" });
      return;
    }

    // Validate required fields
    if (!applicationData.name || applicationData.name.trim() === "") {
      res.status(400).json({ message: "Application name is required" });
      return;
    }

    // Validate permissions definition if provided (supports both old "roles" and new "permissions" format)
    const permissionsDefinition = applicationData.permissionsDefinition || { permissions: [] };
    const validation = validatePermissionsDefinition(permissionsDefinition);
    if (!validation.valid) {
      res.status(400).json({ message: validation.error });
      return;
    }

    // Generate API key
    const apiKey = generateApiKey();

    // Insert the application (store as rolesDefinition for DB compatibility)
    const result = await db.insert(applicationsTable).values({
      name: applicationData.name.trim(),
      description: applicationData.description?.trim() || null,
      url: applicationData.url?.trim() || null,
      apiKey,
      status: applicationData.status || "pending",
      rolesDefinition: permissionsDefinition,
      createdBy: userId,
    } as any);

    // Get the inserted application ID
    const insertedApp = await db
      .select({ id: applicationsTable.id })
      .from(applicationsTable)
      .where(eq(applicationsTable.apiKey, apiKey))
      .limit(1);

    if (insertedApp[0]) {
      const appId = insertedApp[0].id;
      const appAdminPermission = `app.${appId}.admin`;
      
      // Auto-assign creator as admin in application_user_roles table
      await db.insert(applicationUserRolesTable).values({
        userId: userId,
        applicationId: appId,
        roleCode: "admin",
        title: "Admin",
      } as any);

      // Also add app admin permission to user's main roles table
      // Check if user already has roles
      const existingRoles = await db
        .select()
        .from(userRolesTable)
        .where(eq(userRolesTable.userId, userId));

      if (existingRoles.length > 0) {
        // Add the app admin permission to their first role (or create a new role if none exist)
        const firstRole = existingRoles[0];
        
        // Parse existing permissions
        let permissions = Array.isArray(firstRole.permissions) 
          ? firstRole.permissions 
          : JSON.parse(firstRole.permissions as any);
        
        // Add app admin permission if not already present
        if (!permissions.includes(appAdminPermission)) {
          permissions.push(appAdminPermission);
          
          await db
            .update(userRolesTable)
            .set({ permissions: permissions } as any)
            .where(eq(userRolesTable.id, firstRole.id));
        }
      } else {
        // User has no roles, create a new role with app admin permission
        await db.insert(userRolesTable).values({
          userId: userId,
          roleTitle: "Application Admin",
          permissions: [appAdminPermission],
        } as any);
      }
    }

    res.status(201).json({
      message: "Application created successfully. You have been automatically assigned as the application admin.",
      apiKey, // Return the API key only on creation
      applicationId: insertedApp[0]?.id,
      note: "The 'admin' role is automatically created for every application. Do not add it to the roles definition.",
    });
  } catch (error) {
    res.status(400).json({ message: "An error occurred" });
    console.error(error);
  }
}

// Update an application
export async function updateApplication(
  token: string,
  applicationId: string,
  applicationData: {
    name?: string;
    description?: string;
    url?: string;
    status?: "active" | "inactive" | "pending";
    permissionsDefinition?: PermissionsDefinition;
  },
  res: Response
) {
  try {
    const sessionValidationResult: SessionValidationResult =
      await validateSessionToken(token);

    if (
      !sessionValidationResult.session ||
      !sessionValidationResult.user
    ) {
      res.status(401).json({ message: "Token is Invalid Or Expired" });
      return;
    }

    const userId = sessionValidationResult.user.id;

    // Check if user has dev or applications.update permission
    const canUpdate = await hasPermission(userId, "dev") ||
      await hasPermission(userId, "applications.update");

    if (!canUpdate) {
      res.status(403).json({ message: "Insufficient permissions" });
      return;
    }

    // Check if application exists
    const existingApp = await db
      .select()
      .from(applicationsTable)
      .where(eq(applicationsTable.id, applicationId))
      .limit(1);

    if (!existingApp[0]) {
      res.status(404).json({ message: "Application not found" });
      return;
    }

    // Validate permissions definition if provided
    if (applicationData.permissionsDefinition !== undefined) {
      const validation = validatePermissionsDefinition(applicationData.permissionsDefinition);
      if (!validation.valid) {
        res.status(400).json({ message: validation.error });
        return;
      }
    }

    // Build update object
    const updateData: any = {};
    if (applicationData.name !== undefined) {
      updateData.name = applicationData.name.trim();
    }
    if (applicationData.description !== undefined) {
      updateData.description = applicationData.description?.trim() || null;
    }
    if (applicationData.url !== undefined) {
      updateData.url = applicationData.url?.trim() || null;
    }
    if (applicationData.status !== undefined) {
      updateData.status = applicationData.status;
    }
    if (applicationData.permissionsDefinition !== undefined) {
      updateData.rolesDefinition = applicationData.permissionsDefinition;
    }

    // Update the application
    await db
      .update(applicationsTable)
      .set(updateData)
      .where(eq(applicationsTable.id, applicationId));

    res.status(200).json({
      message: "Application updated successfully",
    });
  } catch (error) {
    res.status(400).json({ message: "An error occurred" });
    console.error(error);
  }
}

// Delete an application
export async function deleteApplication(token: string, applicationId: string, res: Response) {
  try {
    const sessionValidationResult: SessionValidationResult =
      await validateSessionToken(token);

    if (
      !sessionValidationResult.session ||
      !sessionValidationResult.user
    ) {
      res.status(401).json({ message: "Token is Invalid Or Expired" });
      return;
    }

    const userId = sessionValidationResult.user.id;

    // Check if user has dev or applications.delete permission
    const canDelete = await hasPermission(userId, "dev") ||
      await hasPermission(userId, "applications.delete");

    if (!canDelete) {
      res.status(403).json({ message: "Insufficient permissions" });
      return;
    }

    // Check if application exists
    const existingApp = await db
      .select()
      .from(applicationsTable)
      .where(eq(applicationsTable.id, applicationId))
      .limit(1);

    if (!existingApp[0]) {
      res.status(404).json({ message: "Application not found" });
      return;
    }

    // Delete the application
    await db
      .delete(applicationsTable)
      .where(eq(applicationsTable.id, applicationId));

    res.status(200).json({
      message: "Application deleted successfully",
    });
  } catch (error) {
    res.status(400).json({ message: "An error occurred" });
    console.error(error);
  }
}

// Regenerate API key for an application
export async function regenerateApiKey(token: string, applicationId: string, res: Response) {
  try {
    const sessionValidationResult: SessionValidationResult =
      await validateSessionToken(token);

    if (
      !sessionValidationResult.session ||
      !sessionValidationResult.user
    ) {
      res.status(401).json({ message: "Token is Invalid Or Expired" });
      return;
    }

    const userId = sessionValidationResult.user.id;

    // Check if user has dev or applications.update permission
    const canUpdate = await hasPermission(userId, "dev") ||
      await hasPermission(userId, "applications.update");

    if (!canUpdate) {
      res.status(403).json({ message: "Insufficient permissions" });
      return;
    }

    // Check if application exists
    const existingApp = await db
      .select()
      .from(applicationsTable)
      .where(eq(applicationsTable.id, applicationId))
      .limit(1);

    if (!existingApp[0]) {
      res.status(404).json({ message: "Application not found" });
      return;
    }

    // Generate new API key
    const newApiKey = generateApiKey();

    // Update the application
    await db
      .update(applicationsTable)
      .set({ apiKey: newApiKey } as any)
      .where(eq(applicationsTable.id, applicationId));

    res.status(200).json({
      message: "API key regenerated successfully",
      apiKey: newApiKey,
    });
  } catch (error) {
    res.status(400).json({ message: "An error occurred" });
    console.error(error);
  }
}
