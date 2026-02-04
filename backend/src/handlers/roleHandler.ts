import db from "../db/db.js";
import { eq, and, inArray } from "drizzle-orm";
import { userRolesTable, usersTable } from "../db/schema.js";
import {
  validateSessionToken,
  invalidateAllUserSessions,
} from "../lib/session.js";
import type { SessionValidationResult } from "../lib/session.js";
import type { Response } from "express";
import {
  hasPermission,
  isAdmin,
  validatePermissionSet,
  getPermissionPrerequisites,
} from "../lib/permissions.js";

// No exclusive permissions - all permissions can be combined

// Get all unique role titles and their permissions from user_roles
// Note: "Roles" are just user_roles entries (permission sets with a roleTitle)
// They are managed through user assignments, not as separate entities
export async function getAllRoles(token: string, res: Response) {
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

    // Check if user has admin or users.read permission
    const canView = await hasPermission(userId, "admin") ||
      await hasPermission(userId, "users.read");

    if (!canView) {
      res.status(403).json({ message: "Insufficient permissions" });
      return;
    }

    // Get all unique role combinations from user_roles
    // This is just for viewing existing permission sets, not managing separate roles
    const allUserRoles = await db.select().from(userRolesTable);
    
    // Group by roleTitle and get unique permission sets
    const parsePermissions = (perms: any): string[] => {
      if (Array.isArray(perms)) return perms;
      if (typeof perms === 'string') {
        try {
          const parsed = JSON.parse(perms);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          return [];
        }
      }
      return [];
    };
    
    const roleMap = new Map<string, string[]>();
    for (const userRole of allUserRoles) {
      const existing = roleMap.get(userRole.roleTitle);
      const permissions = parsePermissions(userRole.permissions);
      if (!existing) {
        roleMap.set(userRole.roleTitle, permissions);
      } else {
        // Merge permissions (take union)
        const combined = [...new Set([...existing, ...permissions])];
        roleMap.set(userRole.roleTitle, combined);
      }
    }

    // Convert to array format
    const roles = Array.from(roleMap.entries()).map(([roleTitle, permissions]) => ({
      id: roleTitle, // Use roleTitle as ID for now
      roleTitle,
      permissions,
      isProtected: permissions.includes("users.protected"),
    }));

    res.status(200).json({
      message: roles,
    });
  } catch (error) {
    res.status(400).json({ message: "An error occurred" });
    console.error(error);
  }
}

// Get roles for a specific user
export async function getUserRoles(token: string, userId: string, res: Response) {
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

    const currentUserId = sessionValidationResult.user.id;

    // Check if user has users.read permission
    if (!(await hasPermission(currentUserId, "users.read"))) {
      res.status(403).json({ message: "Insufficient permissions" });
      return;
    }

    const userRoles = await db
      .select()
      .from(userRolesTable)
      .where(eq(userRolesTable.userId, userId));

    // Parse permissions from JSON strings
    const parsePermissions = (perms: any): string[] => {
      if (Array.isArray(perms)) return perms;
      if (typeof perms === 'string') {
        try {
          const parsed = JSON.parse(perms);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          console.error('Error parsing permissions in getUserRoles:', e, perms);
          return [];
        }
      }
      return [];
    };

    res.status(200).json({
      message: userRoles.map(ur => ({
        id: ur.id,
        roleTitle: ur.roleTitle,
        permissions: parsePermissions(ur.permissions),
      })),
    });
  } catch (error) {
    res.status(400).json({ message: "An error occurred" });
    console.error(error);
  }
}

// Assign roles to a user (simplified - works with roleTitle and permissions)
export async function assignRolesToUser(
  token: string,
  userId: string,
  roles: Array<{ roleTitle: string; permissions: string[] }>,
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

    const currentUserId = sessionValidationResult.user.id;

    // Check if user has users.roles permission
    if (!(await hasPermission(currentUserId, "users.roles"))) {
      res.status(403).json({ message: "Insufficient permissions" });
      return;
    }

    // Check if target user is admin (cannot edit admin users)
    if (await isAdmin(userId)) {
      res.status(403).json({ message: "Cannot modify roles of admin users" });
      return;
    }

    // Validate permissions
    for (const role of roles) {
      const validation = validatePermissionSet(role.permissions);
      if (!validation.valid) {
        res.status(400).json({
          message: `Invalid permissions for role ${role.roleTitle}: missing prerequisites: ${validation.missing.join(", ")}`,
        });
        return;
      }
      
      // Validate: applicant and disabled clear other permissions
      const permissions = role.permissions || [];
      if (permissions.includes("applicant") || permissions.includes("disabled")) {
        // These should be the only permission
        if (permissions.length > 1) {
          res.status(400).json({
            message: `Permission "${permissions.includes("applicant") ? "applicant" : "disabled"}" cannot be combined with other permissions.`,
          });
          return;
        }
      }
      
      // Validate: only admins can set protected users
      if (permissions.includes("users.protected") && !(await hasPermission(currentUserId, "admin"))) {
        res.status(403).json({
          message: "Only admins can set users.protected permission.",
        });
        return;
      }
    }

    // Check if any role has disabled permission (revoke sessions if so)
    let hasDisabled = false;
    for (const role of roles) {
      const permissions = role.permissions || [];
      if (permissions.includes("disabled")) {
        hasDisabled = true;
        break;
      }
    }

    // Remove all existing roles
    await db.delete(userRolesTable).where(eq(userRolesTable.userId, userId));

    // Assign new roles
    for (const role of roles) {
      // Validate permissions are an array
      const validatedPermissions = Array.isArray(role.permissions) 
        ? role.permissions 
        : [];
      
      await db.insert(userRolesTable).values({
        userId,
        roleTitle: role.roleTitle,
        permissions: validatedPermissions,
      } as any);
    }

    // If assigning Disabled permission, revoke all sessions
    if (hasDisabled) {
      await invalidateAllUserSessions(userId);
    }

    res.status(200).json({
      message: "Roles assigned successfully",
    });
  } catch (error) {
    res.status(400).json({ message: "An error occurred" });
    console.error(error);
  }
}

// Placeholder functions for compatibility (roles are now managed through user_roles directly)
export async function createRole(token: string, roleData: any, res: Response) {
  res.status(400).json({ 
    message: "Roles are now managed directly through user assignments. Use assignRolesToUser instead." 
  });
}

export async function updateRole(token: string, roleId: string, roleData: any, res: Response) {
  res.status(400).json({ 
    message: "Roles are now managed directly through user assignments. Use assignRolesToUser instead." 
  });
}

export async function deleteRole(token: string, roleId: string, res: Response) {
  res.status(400).json({ 
    message: "Roles are now managed directly through user assignments. Remove roles from users instead." 
  });
}
