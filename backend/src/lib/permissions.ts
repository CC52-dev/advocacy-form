import db from "../db/db.js";
import { eq, inArray } from "drizzle-orm";
import { userRolesTable, usersTable } from "../db/schema.js";

// Permission prerequisites map
const PERMISSION_PREREQUISITES: Record<string, string[]> = {
  "applicants.approve": ["applicants.read"],
  "applicants.reject": ["applicants.read"],
  "users.updateinfo": ["users.read"],
  "users.roles": ["users.read"],
};

/**
 * Parse permissions from database (handles JSON strings)
 */
function parsePermissions(permissions: any): string[] {
  if (Array.isArray(permissions)) {
    return permissions;
  }
  if (typeof permissions === 'string') {
    try {
      const parsed = JSON.parse(permissions);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Error parsing permissions JSON:', e, permissions);
      return [];
    }
  }
  return [];
}

// All available permissions (for admin wildcard expansion)
const ALL_PERMISSIONS = [
  "applicants.read",
  "applicants.approve",
  "applicants.reject",
  "users.read",
  "users.updateinfo",
  "users.roles",
  "users.protected",
  "dev",
  "admin",
  "applicant",
  "disabled",
];

// Wildcard permission expansions
const WILDCARD_EXPANSIONS: Record<string, string[]> = {
  "applicants.*": ["applicants.read", "applicants.approve", "applicants.reject"],
  "users.*": ["users.read", "users.updateinfo", "users.roles"],
  "dev": ["dev"], // dev provides full access to applications tab
  "admin": ALL_PERMISSIONS,
};

/**
 * Expand wildcard permissions to their full permission sets
 */
function expandWildcards(permissions: string[]): string[] {
  const expanded = new Set<string>();
  
  for (const permission of permissions) {
    if (WILDCARD_EXPANSIONS[permission]) {
      // Add all permissions from wildcard expansion
      for (const expandedPerm of WILDCARD_EXPANSIONS[permission]) {
        expanded.add(expandedPerm);
      }
    } else {
      // Add the permission as-is
      expanded.add(permission);
    }
  }
  
  return Array.from(expanded);
}

/**
 * Get prerequisites for a permission
 */
export function getPermissionPrerequisites(permission: string): string[] {
  return PERMISSION_PREREQUISITES[permission] || [];
}

/**
 * Validate that a permission set includes all prerequisites
 * Handles wildcard permissions by expanding them first
 */
export function validatePermissionSet(
  permissions: string[]
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  // Expand wildcards first to check prerequisites properly
  const expandedPermissions = expandWildcards(permissions);
  const permissionSet = new Set(expandedPermissions);

  for (const permission of expandedPermissions) {
    const prerequisites = getPermissionPrerequisites(permission);
    for (const prereq of prerequisites) {
      // Check if prerequisite is satisfied (either directly or via wildcard/admin)
      const hasPrereq = permissionSet.has(prereq) || 
                       permissionSet.has("admin") ||
                       (prereq.startsWith("applicants.") && permissionSet.has("applicants.*")) ||
                       (prereq.startsWith("users.") && permissionSet.has("users.*"));
      
      if (!hasPrereq) {
        missing.push(prereq);
      }
    }
  }

  return {
    valid: missing.length === 0,
    missing: [...new Set(missing)],
  };
}

/**
 * Check if user has admin permission
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const userRoles = await db
    .select()
    .from(userRolesTable)
    .where(eq(userRolesTable.userId, userId));

  for (const userRole of userRoles) {
    const permissions = parsePermissions(userRole.permissions);
    if (permissions.includes("admin")) {
      return true;
    }
  }

  return false;
}

/**
 * Get all permissions for a user (expands wildcards and admin, adds prerequisites)
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  // Check if user exists
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (!user[0]) {
    return [];
  }

  // Get user's roles
  const userRoles = await db
    .select()
    .from(userRolesTable)
    .where(eq(userRolesTable.userId, userId));

  // Collect all permissions from roles
  const permissionsSet = new Set<string>();

  for (const userRole of userRoles) {
    const rolePermissions = parsePermissions(userRole.permissions);
    
    // If disabled permission, return empty (user cannot access anything)
    if (rolePermissions.includes("disabled")) {
      return [];
    }
    
    // Add all permissions from this role
    for (const permission of rolePermissions) {
      permissionsSet.add(permission);
    }
  }

  // Expand wildcards
  const expandedPermissions = expandWildcards(Array.from(permissionsSet));
  const expandedSet = new Set(expandedPermissions);

  // Add prerequisites for all permissions
  for (const permission of expandedPermissions) {
    const prerequisites = getPermissionPrerequisites(permission);
    for (const prereq of prerequisites) {
      expandedSet.add(prereq);
    }
  }

  return Array.from(expandedSet);
}

/**
 * Check if user has a specific permission (handles admin and wildcard permissions)
 */
export async function hasPermission(
  userId: string,
  permission: string
): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId);
  
  // Admin permission grants everything
  if (userPermissions.includes("admin")) {
    return true;
  }

  // Direct permission check
  if (userPermissions.includes(permission)) {
    return true;
  }

  // Check wildcard permissions
  if (permission.startsWith("applicants.") && userPermissions.includes("applicants.*")) {
    return true;
  }
  if (permission.startsWith("users.") && userPermissions.includes("users.*")) {
    return true;
  }
  // dev permission grants access to applications management
  if (permission === "dev" && userPermissions.includes("dev")) {
    return true;
  }
  // App admin check - app.[appId].admin grants admin access to that app
  if (permission.startsWith("app.") && permission.endsWith(".admin")) {
    if (userPermissions.includes(permission)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if user is admin for a specific application
 */
export async function isAppAdmin(userId: string, appId: string): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId);
  
  // System admin has access to all apps
  if (userPermissions.includes("admin")) {
    return true;
  }
  
  // Check for app-specific admin permission
  return userPermissions.includes(`app.${appId}.admin`);
}

/**
 * Check if user has any of the required permissions
 */
export async function hasAnyPermission(
  userId: string,
  permissions: string[]
): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId);
  
  // Admin permission grants everything
  if (userPermissions.includes("admin")) {
    return true;
  }

  return permissions.some((perm) => {
    // Direct check
    if (userPermissions.includes(perm)) return true;
    // Wildcard checks
    if (perm.startsWith("applicants.") && userPermissions.includes("applicants.*")) return true;
    if (perm.startsWith("users.") && userPermissions.includes("users.*")) return true;
    // dev permission check
    if (perm === "dev" && userPermissions.includes("dev")) return true;
    return false;
  });
}

/**
 * Check if user has all of the required permissions
 */
export async function hasAllPermissions(
  userId: string,
  permissions: string[]
): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId);
  
  // Admin permission grants everything
  if (userPermissions.includes("admin")) {
    return true;
  }

  return permissions.every((perm) => {
    // Direct check
    if (userPermissions.includes(perm)) return true;
    // Wildcard checks
    if (perm.startsWith("applicants.") && userPermissions.includes("applicants.*")) return true;
    if (perm.startsWith("users.") && userPermissions.includes("users.*")) return true;
    // dev permission check
    if (perm === "dev" && userPermissions.includes("dev")) return true;
    return false;
  });
}

/**
 * Validate permission set against required permissions
 */
export function checkPermissions(
  requiredPermissions: string[],
  userPermissions: string[]
): boolean {
  // Admin permission grants everything
  if (userPermissions.includes("admin")) {
    return true;
  }

  return requiredPermissions.every((perm) => {
    // Direct check
    if (userPermissions.includes(perm)) return true;
    // Wildcard checks
    if (perm.startsWith("applicants.") && userPermissions.includes("applicants.*")) return true;
    if (perm.startsWith("users.") && userPermissions.includes("users.*")) return true;
    // dev permission check
    if (perm === "dev" && userPermissions.includes("dev")) return true;
    return false;
  });
}
