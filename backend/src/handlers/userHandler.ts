import db from "../db/db.js";
import { eq, and, or, inArray } from "drizzle-orm";

import { usersTable, userRolesTable } from "../db/schema.js";
import type { User } from "../db/schema.js";
import { validateSessionToken, invalidateSession, invalidateAllUserSessions } from "../lib/session.js";
import type { SessionValidationResult } from "../lib/session.js";
import type { Response } from "express";
import { hasPermission, isAdmin, getUserPermissions, validatePermissionSet } from "../lib/permissions.js";

// Define the update data type
type UserUpdateData = {
  firstname?: string;
  lastname?: string;
  phone?: string;
  email?: string;
  location?: any;
  addr?: string;
  city?: string;
  zip?: string;
  interest?: any;
  type?: "admin" | "user" | "applicant" | "disabled" | "adminviewer";
  roles?: Array<{ roleTitle: string; permissions: string[] }>;
};

export async function getUser(token: string, res: Response) {
  try {
    const sessionValidationResult: SessionValidationResult = await validateSessionToken(token);
    if (!sessionValidationResult.session || !sessionValidationResult.user) {
      res.status(401).json({
        message: "Token is Invalid Or Expired",
      });
      return;
    }
    
    const userId = sessionValidationResult.user.id;
    
    // Get user's roles (simplified structure)
    const userRoles = await db
      .select()
      .from(userRolesTable)
      .where(eq(userRolesTable.userId, userId));
    
    // Get user's permissions
    const permissions = await getUserPermissions(userId);
    
    // Return user data with roles and permissions
    // Ensure permissions are properly parsed from JSON
    const formattedRoles = userRoles.map(ur => {
      let rolePermissions = ur.permissions;
      // If permissions is a string, parse it
      if (typeof rolePermissions === 'string') {
        try {
          rolePermissions = JSON.parse(rolePermissions);
        } catch (e) {
          rolePermissions = [];
        }
      }
      // If it's not an array, make it an array
      if (!Array.isArray(rolePermissions)) {
        rolePermissions = [];
      }
      
      return {
        id: ur.id,
        roleTitle: ur.roleTitle,
        permissions: rolePermissions,
      };
    });
    
    console.log('getUser - Returning user data:', {
      userId: sessionValidationResult.user.id,
      email: sessionValidationResult.user.email,
      rolesCount: formattedRoles.length,
      roles: formattedRoles,
      permissionsCount: permissions.length,
      permissions: permissions,
    });
    
    res.status(200).json({
      message: {
        ...sessionValidationResult.user,
        roles: formattedRoles,
        permissions: permissions,
      },
    });
  } catch (error) {
    res.status(400).json({
      message: "An error occurred",
    });
    console.error(error);
  }
}

export async function getAllUsers(token: string, res: Response) {
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
    
    // Check if user has users.read permission
    if (!(await hasPermission(userId, "users.read"))) {
      res.status(403).json({ message: "Insufficient permissions" });
      return;
    }
    
    // Get users, admins, adminviewers, and disabled users (excluding applicants)
    const users = await db
      .select()
      .from(usersTable)
      .where(inArray(usersTable.type, ["user", "admin", "adminviewer", "disabled"]));
    
    // Get roles for each user (simplified structure)
    const usersWithRoles = await Promise.all(
      users.map(async (user) => {
        const userRoles = await db
          .select()
          .from(userRolesTable)
          .where(eq(userRolesTable.userId, user.id));
        
        const permissions = await getUserPermissions(user.id);
        
        return {
          ...user,
          roles: userRoles.map(ur => ({
            id: ur.id,
            roleTitle: ur.roleTitle,
            permissions: ur.permissions,
          })),
          permissions: permissions,
        };
      })
    );
    
    res.status(200).json({
      message: usersWithRoles,
    });
  } catch (error) {
    res.status(400).json({ message: "An error occurred" });
    console.error(error);
  }
}

export async function updateUser(
  token: string,
  userId: string,
  updateData: UserUpdateData,
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

    // Check if user has users.updateinfo permission
    if (!(await hasPermission(currentUserId, "users.updateinfo"))) {
      res.status(403).json({ message: "Insufficient permissions" });
      return;
    }

    // Get the user to be updated
    const userToUpdate = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!userToUpdate[0]) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Check if target user is admin (admins cannot be edited)
    if (await isAdmin(userId)) {
      res.status(403).json({ message: "Cannot edit admin users" });
      return;
    }

    // Check if target user has users.protected permission
    const targetUserPermissions = await getUserPermissions(userId);
    const isProtected = targetUserPermissions.includes("users.protected");
    
    if (isProtected && !(await hasPermission(currentUserId, "admin"))) {
      res.status(403).json({ message: "Cannot edit protected users. Admin permission required." });
      return;
    }

    // Prepare update data (exclude roles as that's handled separately)
    const { roles, ...userUpdateFields } = updateData;

    // Update the user fields
    if (Object.keys(userUpdateFields).length > 0) {
      await db
        .update(usersTable)
        .set(userUpdateFields)
        .where(eq(usersTable.id, userId));
    }

    // If updating roles, check users.roles permission and handle separately
    if (updateData.roles !== undefined) {
      if (!(await hasPermission(currentUserId, "users.roles"))) {
        res.status(403).json({ message: "Insufficient permissions to update roles" });
        return;
      }
      
      // Validate permissions
      for (const role of updateData.roles) {
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
      for (const role of updateData.roles) {
        const permissions = role.permissions || [];
        if (permissions.includes("disabled")) {
          hasDisabled = true;
          break;
        }
      }

      // Remove all existing roles
      await db.delete(userRolesTable).where(eq(userRolesTable.userId, userId));

      // Assign new roles
      for (const role of updateData.roles) {
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
    }

    res.status(200).json({
      message: "User updated successfully",
    });
  } catch (error) {
    res.status(400).json({ message: "An error occurred" });
    console.error(error);
  }
}
