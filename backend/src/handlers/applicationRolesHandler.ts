import db from "../db/db.js";
import { eq, and, inArray } from "drizzle-orm";
import { 
  applicationsTable, 
  applicationUserRolesTable, 
  usersTable,
  userRolesTable
} from "../db/schema.js";
import { validateSessionToken } from "../lib/session.js";
import type { SessionValidationResult } from "../lib/session.js";
import type { Response } from "express";
import { hasPermission, getUserPermissions } from "../lib/permissions.js";

// Check if user is system admin (can access all RBAC)
async function isSystemAdmin(userId: string): Promise<boolean> {
  return await hasPermission(userId, "admin");
}

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

// Parse permissions definition from database (handles both old "roles" and new "permissions" format)
function parsePermissionsDefinition(data: any): PermissionsDefinition {
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (e) {
      return { permissions: [], categories: [] };
    }
  }
  
  // Support both old "roles" format and new "permissions" format
  const categories = Array.isArray(data?.categories) ? data.categories : [];
  
  if (data?.permissions) {
    return { permissions: data.permissions, categories };
  }
  if (data?.roles) {
    return { permissions: data.roles, categories };
  }
  return { permissions: [], categories: [] };
}

// Check if user is admin of an application (via main user permissions)
async function isApplicationAdmin(userId: string, applicationId: string): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId);
  // Check for app-specific admin permission (app.{appId}.admin)
  return userPermissions.includes(`app.${applicationId}.admin`);
}

// Check if user has any role in an application
async function hasApplicationAccess(userId: string, applicationId: string): Promise<boolean> {
  // First check main user permissions for app.{appId}.admin
  const userPermissions = await getUserPermissions(userId);
  const appAdminPermission = `app.${applicationId}.admin`;
  if (userPermissions.includes(appAdminPermission)) {
    return true;
  }

  // Then check application_user_roles table for any app-specific roles
  const userRole = await db
    .select()
    .from(applicationUserRolesTable)
    .where(
      and(
        eq(applicationUserRolesTable.userId, userId),
        eq(applicationUserRolesTable.applicationId, applicationId)
      )
    )
    .limit(1);

  return userRole.length > 0;
}

// Get all users with roles in an application
export async function getApplicationUsers(token: string, applicationId: string, res: Response) {
  try {
    const sessionValidationResult: SessionValidationResult =
      await validateSessionToken(token);

    if (!sessionValidationResult.session || !sessionValidationResult.user) {
      res.status(401).json({ message: "Token is Invalid Or Expired" });
      return;
    }

    const userId = sessionValidationResult.user.id;

    // Check if user is system admin or app-specific admin
    const isSysAdmin = await isSystemAdmin(userId);
    const isAppAdmin = await isApplicationAdmin(userId, applicationId);

    if (!isSysAdmin && !isAppAdmin) {
      res.status(403).json({ message: "Insufficient permissions. Only system admins or application admins can access RBAC." });
      return;
    }

    // Get application details including roles definition
    const application = await db
      .select()
      .from(applicationsTable)
      .where(eq(applicationsTable.id, applicationId))
      .limit(1);

    if (!application[0]) {
      res.status(404).json({ message: "Application not found" });
      return;
    }

    // Get all users with roles in this application from application_user_roles table
    const userRoles = await db
      .select({
        id: applicationUserRolesTable.id,
        userId: applicationUserRolesTable.userId,
        roleCode: applicationUserRolesTable.roleCode,
        title: applicationUserRolesTable.title,
        createdAt: applicationUserRolesTable.createdAt,
        userFirstname: usersTable.firstname,
        userLastname: usersTable.lastname,
        userEmail: usersTable.email,
      })
      .from(applicationUserRolesTable)
      .leftJoin(usersTable, eq(applicationUserRolesTable.userId, usersTable.id))
      .where(eq(applicationUserRolesTable.applicationId, applicationId));

    // Group by user
    const usersMap = new Map<string, any>();
    for (const ur of userRoles) {
      if (!usersMap.has(ur.userId)) {
        usersMap.set(ur.userId, {
          userId: ur.userId,
          firstname: ur.userFirstname,
          lastname: ur.userLastname,
          email: ur.userEmail,
          roles: [],
        });
      }
      usersMap.get(ur.userId).roles.push({
        id: ur.id,
        roleCode: ur.roleCode,
        title: ur.title,
        createdAt: ur.createdAt,
      });
    }

    // Also get users who have app.{appId}.admin in their main user_roles
    // These users were granted admin via the Users tab, not the RBAC portal
    const appAdminPermission = `app.${applicationId}.admin`;
    
    // Get all user roles from the main user_roles table
    const allUserRolesWithAppAdmin = await db
      .select({
        userId: userRolesTable.userId,
        permissions: userRolesTable.permissions,
        userFirstname: usersTable.firstname,
        userLastname: usersTable.lastname,
        userEmail: usersTable.email,
      })
      .from(userRolesTable)
      .leftJoin(usersTable, eq(userRolesTable.userId, usersTable.id));

    // Filter for users with app.{appId}.admin permission
    for (const userRole of allUserRolesWithAppAdmin) {
      let permissions = userRole.permissions;
      
      // Parse permissions if it's a JSON string
      if (typeof permissions === 'string') {
        try {
          permissions = JSON.parse(permissions);
        } catch (e) {
          continue;
        }
      }
      
      // Check if this user has the app admin permission
      if (Array.isArray(permissions) && permissions.includes(appAdminPermission)) {
        if (!usersMap.has(userRole.userId)) {
          usersMap.set(userRole.userId, {
            userId: userRole.userId,
            firstname: userRole.userFirstname,
            lastname: userRole.userLastname,
            email: userRole.userEmail,
            roles: [],
          });
        }
        
        // Add the admin role if not already present
        const existingRoles = usersMap.get(userRole.userId).roles;
        const hasAdminRole = existingRoles.some((r: any) => r.roleCode === 'admin');
        if (!hasAdminRole) {
          existingRoles.push({
            id: `main-role-admin-${userRole.userId}`,
            roleCode: 'admin',
            title: null,
            createdAt: null,
          });
        }
      }
    }

    const permissionsDefinition = parsePermissionsDefinition(application[0].rolesDefinition);

    res.status(200).json({
      message: {
        application: {
          id: application[0].id,
          name: application[0].name,
          permissionsDefinition: permissionsDefinition,
        },
        users: Array.from(usersMap.values()),
      },
    });
  } catch (error) {
    res.status(400).json({ message: "An error occurred" });
    console.error(error);
  }
}

// Assign a role to a user in an application
export async function assignApplicationRole(
  token: string,
  applicationId: string,
  targetUserId: string,
  roleCode: string,
  title: string | null,
  res: Response
) {
  try {
    const sessionValidationResult: SessionValidationResult =
      await validateSessionToken(token);

    if (!sessionValidationResult.session || !sessionValidationResult.user) {
      res.status(401).json({ message: "Token is Invalid Or Expired" });
      return;
    }

    const userId = sessionValidationResult.user.id;

    // Check if user is system admin or app-specific admin
    const isSysAdmin = await isSystemAdmin(userId);
    const isAppAdmin = await isApplicationAdmin(userId, applicationId);

    if (!isSysAdmin && !isAppAdmin) {
      res.status(403).json({ message: "Insufficient permissions. Only system admins or application admins can access RBAC." });
      return;
    }

    // Only system admins can assign app admin role - app admins can only assign lower roles
    if (roleCode === "admin" && !isSysAdmin) {
      res.status(403).json({ message: "Only system admins can assign the Application Admin role" });
      return;
    }

    // Get application details
    const application = await db
      .select()
      .from(applicationsTable)
      .where(eq(applicationsTable.id, applicationId))
      .limit(1);

    if (!application[0]) {
      res.status(404).json({ message: "Application not found" });
      return;
    }

    // Validate target user exists
    const targetUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, targetUserId))
      .limit(1);

    if (!targetUser[0]) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const permissionsDefinition = parsePermissionsDefinition(application[0].rolesDefinition);

    // Validate permission code (admin is always valid, title permissions are always valid, others must be in permissionsDefinition)
    const isTitlePermission = roleCode.includes(".title.");
    if (roleCode !== "admin" && !isTitlePermission) {
      const permissionExists = permissionsDefinition.permissions.some(p => p.code === roleCode);
      if (!permissionExists) {
        res.status(400).json({ message: `Permission '${roleCode}' is not defined for this application` });
        return;
      }
    }

    // Get user's current permissions in this application
    const existingPermissions = await db
      .select()
      .from(applicationUserRolesTable)
      .where(
        and(
          eq(applicationUserRolesTable.userId, targetUserId),
          eq(applicationUserRolesTable.applicationId, applicationId)
        )
      );

    const existingPermissionCodes = existingPermissions.map(ep => ep.roleCode);

    // Check constraints
    const permissionDefinition = permissionsDefinition.permissions.find(p => p.code === roleCode);
    
    if (permissionDefinition?.constraints) {
      // Check prerequisites - user must have all prerequisite permissions first
      if (permissionDefinition.constraints.prerequisites?.length) {
        const missingPrereqs = permissionDefinition.constraints.prerequisites.filter(
          prereq => !existingPermissionCodes.includes(prereq)
        );
        if (missingPrereqs.length > 0) {
          const missingNames = missingPrereqs.map(code => {
            const prereqDef = permissionsDefinition.permissions.find(p => p.code === code);
            return prereqDef ? `${prereqDef.name} (${code})` : code;
          });
          res.status(400).json({ 
            message: `Missing prerequisites: ${missingNames.join(', ')}` 
          });
          return;
        }
      }

      // Check exclusive constraint - permission cannot be combined with others
      if (permissionDefinition.constraints.exclusive && existingPermissions.length > 0) {
        res.status(400).json({ 
          message: `Permission '${roleCode}' is exclusive and cannot be combined with other permissions.` 
        });
        return;
      }

      // Check onlyOneInCategory constraint
      if (permissionDefinition.constraints.onlyOneInCategory && permissionDefinition.category) {
        const categoryPermissions = permissionsDefinition.permissions
          .filter(p => p.category === permissionDefinition.category)
          .map(p => p.code);
        
        const hasPermissionInCategory = existingPermissions.some(ep => categoryPermissions.includes(ep.roleCode));
        if (hasPermissionInCategory) {
          res.status(400).json({ 
            message: `User already has a permission in the '${permissionDefinition.category}' category.` 
          });
          return;
        }
      }
    }

    // Check if user has an exclusive permission that blocks adding more
    const existingExclusivePermission = existingPermissions.find(ep => {
      const def = permissionsDefinition.permissions.find(p => p.code === ep.roleCode);
      return def?.constraints?.exclusive;
    });
    if (existingExclusivePermission) {
      res.status(400).json({ 
        message: `User has exclusive permission '${existingExclusivePermission.roleCode}'. Cannot assign additional permissions.` 
      });
      return;
    }

    // Check if user already has this role
    const existingAssignment = await db
      .select()
      .from(applicationUserRolesTable)
      .where(
        and(
          eq(applicationUserRolesTable.userId, targetUserId),
          eq(applicationUserRolesTable.applicationId, applicationId),
          eq(applicationUserRolesTable.roleCode, roleCode)
        )
      )
      .limit(1);

    if (existingAssignment.length > 0) {
      // Update title if provided, or if roleCode is "admin", set to "Admin"
      const finalTitle = roleCode === "admin" ? "Admin" : title;
      if (finalTitle !== null) {
        await db
          .update(applicationUserRolesTable)
          .set({ title: finalTitle } as any)
          .where(eq(applicationUserRolesTable.id, existingAssignment[0].id));
      }
      res.status(200).json({ message: "Role already assigned, title updated if provided" });
      return;
    }

    // Assign the role
    // If roleCode is "admin", automatically set title to "Admin"
    const finalTitle = roleCode === "admin" ? "Admin" : title;
    
    await db.insert(applicationUserRolesTable).values({
      userId: targetUserId,
      applicationId: applicationId,
      roleCode: roleCode,
      title: finalTitle,
    } as any);

    // If assigning admin role, also add to main user_roles table
    if (roleCode === "admin") {
      const appAdminPermission = `app.${applicationId}.admin`;
      
      // Check if user already has roles
      const existingRoles = await db
        .select()
        .from(userRolesTable)
        .where(eq(userRolesTable.userId, targetUserId));

      if (existingRoles.length > 0) {
        // Add to their first role
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
          userId: targetUserId,
          roleTitle: "Application Admin",
          permissions: [appAdminPermission],
        } as any);
      }
    }

    res.status(201).json({ message: "Role assigned successfully" });
  } catch (error) {
    res.status(400).json({ message: "An error occurred" });
    console.error(error);
  }
}

// Remove a role from a user in an application
export async function removeApplicationRole(
  token: string,
  applicationId: string,
  targetUserId: string,
  roleCode: string,
  res: Response
) {
  try {
    const sessionValidationResult: SessionValidationResult =
      await validateSessionToken(token);

    if (!sessionValidationResult.session || !sessionValidationResult.user) {
      res.status(401).json({ message: "Token is Invalid Or Expired" });
      return;
    }

    const userId = sessionValidationResult.user.id;

    // Check if user is system admin or app-specific admin
    const isSysAdmin = await isSystemAdmin(userId);
    const isAppAdmin = await isApplicationAdmin(userId, applicationId);

    if (!isSysAdmin && !isAppAdmin) {
      res.status(403).json({ message: "Insufficient permissions. Only system admins or application admins can access RBAC." });
      return;
    }

    // Only system admins can remove app admin role - app admins can only manage lower roles
    if (roleCode === "admin" && !isSysAdmin) {
      res.status(403).json({ message: "Only system admins can remove the Application Admin role" });
      return;
    }

    // Prevent removing own admin role
    if (targetUserId === userId && roleCode === "admin") {
      res.status(400).json({ message: "Cannot remove your own admin role" });
      return;
    }

    // Delete the role assignment
    const result = await db
      .delete(applicationUserRolesTable)
      .where(
        and(
          eq(applicationUserRolesTable.userId, targetUserId),
          eq(applicationUserRolesTable.applicationId, applicationId),
          eq(applicationUserRolesTable.roleCode, roleCode)
        )
      );

    // If removing admin role, also remove from main user_roles table
    if (roleCode === "admin") {
      const appAdminPermission = `app.${applicationId}.admin`;
      
      // Get all user roles
      const userRoles = await db
        .select()
        .from(userRolesTable)
        .where(eq(userRolesTable.userId, targetUserId));

      // Remove the app admin permission from each role
      for (const role of userRoles) {
        let permissions = Array.isArray(role.permissions) 
          ? role.permissions 
          : JSON.parse(role.permissions as any);
        
        // Remove the app admin permission
        permissions = permissions.filter((p: string) => p !== appAdminPermission);
        
        // Update the role with filtered permissions
        await db
          .update(userRolesTable)
          .set({ permissions: permissions } as any)
          .where(eq(userRolesTable.id, role.id));
      }
    }

    res.status(200).json({ message: "Role removed successfully" });
  } catch (error) {
    res.status(400).json({ message: "An error occurred" });
    console.error(error);
  }
}

// Get applications where current user is admin
export async function getMyApplications(token: string, res: Response) {
  try {
    const sessionValidationResult: SessionValidationResult =
      await validateSessionToken(token);

    if (!sessionValidationResult.session || !sessionValidationResult.user) {
      res.status(401).json({ message: "Token is Invalid Or Expired" });
      return;
    }

    const userId = sessionValidationResult.user.id;

    // Get user's permissions to check for app admin
    const userPermissions = await getUserPermissions(userId);
    const isSysAdmin = userPermissions.includes("admin");
    
    // Extract app IDs where user is admin from permissions (app.{appId}.admin)
    const adminAppIds: string[] = [];
    for (const perm of userPermissions) {
      const match = perm.match(/^app\.(.+)\.admin$/);
      if (match) {
        adminAppIds.push(match[1]);
      }
    }

    // If system admin, get all applications
    let applications;
    if (isSysAdmin) {
      applications = await db
        .select({
          id: applicationsTable.id,
          name: applicationsTable.name,
          description: applicationsTable.description,
          status: applicationsTable.status,
          url: applicationsTable.url,
        })
        .from(applicationsTable);
    } else if (adminAppIds.length > 0) {
      // Get applications where user has app admin permission
      applications = await db
        .select({
          id: applicationsTable.id,
          name: applicationsTable.name,
          description: applicationsTable.description,
          status: applicationsTable.status,
          url: applicationsTable.url,
        })
        .from(applicationsTable)
        .where(inArray(applicationsTable.id, adminAppIds));
    } else {
      applications = [];
    }

    res.status(200).json({
      message: applications.map(app => ({
        id: app.id,
        name: app.name,
        description: app.description,
        status: app.status,
        url: app.url,
      })),
    });
  } catch (error) {
    res.status(400).json({ message: "An error occurred" });
    console.error(error);
  }
}

// Get all application roles for a user (for displaying in user profile)
export async function getUserApplicationRoles(token: string, targetUserId: string, res: Response) {
  try {
    const sessionValidationResult: SessionValidationResult =
      await validateSessionToken(token);

    if (!sessionValidationResult.session || !sessionValidationResult.user) {
      res.status(401).json({ message: "Token is Invalid Or Expired" });
      return;
    }

    const userId = sessionValidationResult.user.id;

    // User can view their own roles, or needs users.read permission
    if (userId !== targetUserId) {
      const canRead = await hasPermission(userId, "users.read");
      if (!canRead) {
        res.status(403).json({ message: "Insufficient permissions" });
        return;
      }
    }

    // Get all application roles for the user
    const userAppRoles = await db
      .select({
        id: applicationUserRolesTable.id,
        applicationId: applicationUserRolesTable.applicationId,
        roleCode: applicationUserRolesTable.roleCode,
        title: applicationUserRolesTable.title,
        appName: applicationsTable.name,
        appStatus: applicationsTable.status,
      })
      .from(applicationUserRolesTable)
      .innerJoin(applicationsTable, eq(applicationUserRolesTable.applicationId, applicationsTable.id))
      .where(eq(applicationUserRolesTable.userId, targetUserId));

    res.status(200).json({
      message: userAppRoles.map(uar => ({
        id: uar.id,
        applicationId: uar.applicationId,
        applicationName: uar.appName,
        applicationStatus: uar.appStatus,
        roleCode: uar.roleCode,
        title: uar.title,
        displayName: `[${uar.appName}] ${uar.roleCode.charAt(0).toUpperCase() + uar.roleCode.slice(1)}`,
      })),
    });
  } catch (error) {
    res.status(400).json({ message: "An error occurred" });
    console.error(error);
  }
}

// Get applications user has access to (for launch)
export async function getAccessibleApplications(token: string, res: Response) {
  try {
    const sessionValidationResult: SessionValidationResult =
      await validateSessionToken(token);

    if (!sessionValidationResult.session || !sessionValidationResult.user) {
      res.status(401).json({ message: "Token is Invalid Or Expired" });
      return;
    }

    const userId = sessionValidationResult.user.id;

    // Get user's main permissions to check for app.{appId}.admin permissions
    const userPermissions = await getUserPermissions(userId);
    
    // Get all applications
    const allApplications = await db.select().from(applicationsTable);

    // Group by application
    const appsMap = new Map<string, any>();

    // First, check main permissions for app admin roles (app.{appId}.admin)
    for (const app of allApplications) {
      const appAdminPermission = `app.${app.id}.admin`;
      if (userPermissions.includes(appAdminPermission)) {
        appsMap.set(app.id, {
          id: app.id,
          name: app.name,
          description: app.description,
          status: app.status,
          url: app.url,
          roles: [appAdminPermission],
          isAdmin: true, // This user is an app admin via main permissions
        });
      }
    }

    // Second, check application_user_roles table for app-specific roles
    const userAppRoles = await db
      .select({
        applicationId: applicationUserRolesTable.applicationId,
        roleCode: applicationUserRolesTable.roleCode,
        appName: applicationsTable.name,
        appDescription: applicationsTable.description,
        appStatus: applicationsTable.status,
        appUrl: applicationsTable.url,
      })
      .from(applicationUserRolesTable)
      .innerJoin(applicationsTable, eq(applicationUserRolesTable.applicationId, applicationsTable.id))
      .where(eq(applicationUserRolesTable.userId, userId));

    for (const uar of userAppRoles) {
      if (!appsMap.has(uar.applicationId)) {
        appsMap.set(uar.applicationId, {
          id: uar.applicationId,
          name: uar.appName,
          description: uar.appDescription,
          status: uar.appStatus,
          url: uar.appUrl,
          roles: [],
          isAdmin: false,
        });
      }
      appsMap.get(uar.applicationId).roles.push(uar.roleCode);
    }

    res.status(200).json({
      message: Array.from(appsMap.values()),
    });
  } catch (error) {
    res.status(400).json({ message: "An error occurred" });
    console.error(error);
  }
}

// Update user's title in an application
export async function updateUserTitle(
  token: string,
  applicationId: string,
  targetUserId: string,
  title: string | null,
  res: Response
) {
  try {
    const sessionValidationResult: SessionValidationResult =
      await validateSessionToken(token);

    if (!sessionValidationResult.session || !sessionValidationResult.user) {
      res.status(401).json({ message: "Token is Invalid Or Expired" });
      return;
    }

    const userId = sessionValidationResult.user.id;

    // Check if user is system admin or app-specific admin
    const isSysAdmin = await isSystemAdmin(userId);
    const isAppAdmin = await isApplicationAdmin(userId, applicationId);

    if (!isSysAdmin && !isAppAdmin) {
      res.status(403).json({ message: "Insufficient permissions. Only system admins or application admins can access RBAC." });
      return;
    }

    // Get application details
    const application = await db
      .select()
      .from(applicationsTable)
      .where(eq(applicationsTable.id, applicationId))
      .limit(1);

    if (!application[0]) {
      res.status(404).json({ message: "Application not found" });
      return;
    }

    // Validate target user exists
    const targetUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, targetUserId))
      .limit(1);

    if (!targetUser[0]) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Check if user has any role in this application
    const existingRoles = await db
      .select()
      .from(applicationUserRolesTable)
      .where(
        and(
          eq(applicationUserRolesTable.userId, targetUserId),
          eq(applicationUserRolesTable.applicationId, applicationId)
        )
      )
      .limit(1);

    if (existingRoles.length === 0) {
      res.status(400).json({ message: "User must have at least one role in the application to set a title" });
      return;
    }

    // Update the title on all of the user's roles in this application
    await db
      .update(applicationUserRolesTable)
      .set({ title: title || null } as any)
      .where(
        and(
          eq(applicationUserRolesTable.userId, targetUserId),
          eq(applicationUserRolesTable.applicationId, applicationId)
        )
      );

    res.status(200).json({
      message: "Title updated successfully",
      title: title || null,
    });
  } catch (error) {
    res.status(400).json({ message: "An error occurred" });
    console.error(error);
  }
}

// Search users for adding to application
export async function searchUsersForApplication(token: string, applicationId: string, query: string, res: Response) {
  try {
    const sessionValidationResult: SessionValidationResult =
      await validateSessionToken(token);

    if (!sessionValidationResult.session || !sessionValidationResult.user) {
      res.status(401).json({ message: "Token is Invalid Or Expired" });
      return;
    }

    const userId = sessionValidationResult.user.id;

    // Check if user is system admin or app-specific admin
    const isSysAdmin = await isSystemAdmin(userId);
    const isAppAdmin = await isApplicationAdmin(userId, applicationId);

    if (!isSysAdmin && !isAppAdmin) {
      res.status(403).json({ message: "Insufficient permissions. Only system admins or application admins can access RBAC." });
      return;
    }

    // Search for users by email or name
    const users = await db
      .select({
        id: usersTable.id,
        firstname: usersTable.firstname,
        lastname: usersTable.lastname,
        email: usersTable.email,
      })
      .from(usersTable)
      .limit(20);

    // Filter manually (since LIKE might not work well with drizzle)
    const filteredUsers = users.filter(u => {
      const searchQuery = query.toLowerCase();
      return (
        u.email?.toLowerCase().includes(searchQuery) ||
        u.firstname?.toLowerCase().includes(searchQuery) ||
        u.lastname?.toLowerCase().includes(searchQuery)
      );
    });

    res.status(200).json({
      message: filteredUsers,
    });
  } catch (error) {
    res.status(400).json({ message: "An error occurred" });
    console.error(error);
  }
}

export { isApplicationAdmin, hasApplicationAccess };
