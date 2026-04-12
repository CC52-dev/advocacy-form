"use client";
import { useAuthStore } from "@/stores/authStore";

// Permission prerequisites map
const PERMISSION_PREREQUISITES = {
  "applicants.approve": ["applicants.read"],
  "applicants.reject": ["applicants.read"],
  "users.updateinfo": ["users.read"],
  "users.roles": ["users.read"],
  "events.update": ["events.read"],
  "events.delete": ["events.read"],
};

/**
 * Get prerequisites for a permission
 */
export function getPermissionPrerequisites(permission) {
  return PERMISSION_PREREQUISITES[permission] || [];
}

/**
 * Check if current user has a specific permission (handles admin and wildcard permissions)
 */
export function hasPermission(permission) {
  const state = useAuthStore.getState();
  const permissions = state.permissions || [];
  
  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('hasPermission check:', {
      permission,
      userId: state.id,
      userEmail: state.email,
      userPermissions: permissions,
      userRoles: state.roles,
      hasAdmin: permissions.includes("admin"),
      hasPermission: permissions.includes(permission),
    });
  }
  
  // Admin permission grants everything
  if (permissions.includes("admin")) {
    return true;
  }

  // Direct permission check
  if (permissions.includes(permission)) {
    return true;
  }

  // Check wildcard permissions
  if (permission.startsWith("applicants.") && permissions.includes("applicants.*")) {
    return true;
  }
  if (permission.startsWith("users.") && permissions.includes("users.*")) {
    return true;
  }
  if (permission.startsWith("events.") && permissions.includes("events.*")) {
    return true;
  }
  // dev permission grants access to applications management
  if (permission === "dev" && permissions.includes("dev")) {
    return true;
  }
  // App admin check - app.[appId].admin grants admin access to that app
  if (permission.startsWith("app.") && permission.endsWith(".admin")) {
    if (permissions.includes(permission)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if current user has any of the permissions
 */
export function hasAnyPermission(permissions) {
  const userPermissions = useAuthStore.getState().permissions || [];
  
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
    if (perm.startsWith("events.") && userPermissions.includes("events.*")) return true;
    // dev permission check
    if (perm === "dev" && userPermissions.includes("dev")) return true;
    return false;
  });
}

/**
 * Check if user can manage events (admin panel: CRUD, view RSVPs).
 * Requires admin or any event permission (events.read, events.create, etc.).
 */
export function canManageEvents() {
  const permissions = useAuthStore.getState().permissions || [];
  if (permissions.includes("disabled") && !permissions.includes("admin")) return false;
  if (permissions.includes("admin")) return true;
  return (
    permissions.includes("events.read") ||
    permissions.includes("events.create") ||
    permissions.includes("events.update") ||
    permissions.includes("events.delete") ||
    permissions.includes("events.*")
  );
}

/**
 * Check if user can access events (view/RSVP). Everyone can access including applicants.
 */
export function canAccessEvents() {
  const permissions = useAuthStore.getState().permissions || [];
  if (permissions.includes("disabled") && !permissions.includes("admin")) return false;
  if (permissions.includes("admin") || permissions.includes("users.read") ||
      permissions.includes("users.*") || permissions.includes("applicants.read") ||
      permissions.includes("applicants.*") || permissions.includes("events.read") ||
      permissions.includes("events.*") || permissions.includes("dev") ||
      permissions.includes("applicant")) {
    return true;
  }
  return false;
}

/**
 * React hooks that subscribe to store - use these in components so they re-render when permissions change.
 */
export function useCanAccessEvents() {
  const permissions = useAuthStore((state) => state.permissions) || [];
  if (permissions.includes("disabled") && !permissions.includes("admin")) return false;
  return !!(
    permissions.includes("admin") || permissions.includes("users.read") ||
    permissions.includes("users.*") || permissions.includes("applicants.read") ||
    permissions.includes("applicants.*") || permissions.includes("events.read") ||
    permissions.includes("events.*") || permissions.includes("dev") ||
    permissions.includes("applicant")
  );
}

export function useCanManageEvents() {
  const permissions = useAuthStore((state) => state.permissions) || [];
  if (permissions.includes("disabled") && !permissions.includes("admin")) return false;
  if (permissions.includes("admin")) return true;
  return !!(
    permissions.includes("events.read") ||
    permissions.includes("events.create") ||
    permissions.includes("events.update") ||
    permissions.includes("events.delete") ||
    permissions.includes("events.*")
  );
}

/**
 * Check if current user has all of the required permissions
 */
export function hasAllPermissions(permissions) {
  const userPermissions = useAuthStore.getState().permissions || [];
  
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
    if (perm.startsWith("events.") && userPermissions.includes("events.*")) return true;
    // dev permission check
    if (perm === "dev" && userPermissions.includes("dev")) return true;
    return false;
  });
}

/**
 * Check if current user is admin
 */
export function isAdmin() {
  const permissions = useAuthStore.getState().permissions || [];
  return permissions.includes("admin");
}

/**
 * True if user can open the analytics dashboard (any "read" area or dev).
 */
export function canViewDashboard() {
  const permissions = useAuthStore.getState().permissions || [];
  if (permissions.includes("admin")) return true;
  if (permissions.includes("users.read") || permissions.includes("users.*")) return true;
  if (permissions.includes("applicants.read") || permissions.includes("applicants.*")) return true;
  if (
    permissions.includes("events.read") ||
    permissions.includes("events.create") ||
    permissions.includes("events.update") ||
    permissions.includes("events.delete") ||
    permissions.includes("events.*")
  ) {
    return true;
  }
  if (permissions.includes("applications.read") || permissions.includes("dev")) return true;
  return false;
}

export function useCanViewDashboard() {
  const permissions = useAuthStore((state) => state.permissions) || [];
  if (permissions.includes("admin")) return true;
  if (permissions.includes("users.read") || permissions.includes("users.*")) return true;
  if (permissions.includes("applicants.read") || permissions.includes("applicants.*")) return true;
  if (
    permissions.includes("events.read") ||
    permissions.includes("events.create") ||
    permissions.includes("events.update") ||
    permissions.includes("events.delete") ||
    permissions.includes("events.*")
  ) {
    return true;
  }
  if (permissions.includes("applications.read") || permissions.includes("dev")) return true;
  return false;
}

/** Matches backend stats: users section */
export function useHasUsersStats() {
  const permissions = useAuthStore((state) => state.permissions) || [];
  return (
    permissions.includes("admin") ||
    permissions.includes("users.read") ||
    permissions.includes("users.*")
  );
}

export function useHasApplicantsStats() {
  const permissions = useAuthStore((state) => state.permissions) || [];
  return (
    permissions.includes("admin") ||
    permissions.includes("applicants.read") ||
    permissions.includes("applicants.*")
  );
}

export function useHasEventStats() {
  const permissions = useAuthStore((state) => state.permissions) || [];
  if (permissions.includes("admin")) return true;
  if (permissions.includes("events.*")) return true;
  return (
    permissions.includes("events.read") ||
    permissions.includes("events.create") ||
    permissions.includes("events.update") ||
    permissions.includes("events.delete")
  );
}

export function useHasApplicationsStats() {
  const permissions = useAuthStore((state) => state.permissions) || [];
  return (
    permissions.includes("admin") ||
    permissions.includes("dev") ||
    permissions.includes("applications.read")
  );
}

// Wildcard permission expansions
const WILDCARD_EXPANSIONS = {
  "applicants.*": ["applicants.read", "applicants.approve", "applicants.reject"],
  "users.*": ["users.read", "users.updateinfo", "users.roles"],
  "events.*": ["events.read", "events.create", "events.update", "events.delete"],
  "dev": ["dev"], // dev provides full access to applications tab
  "admin": ["applicants.read", "applicants.approve", "applicants.reject", "users.read", "users.updateinfo", "users.roles", "users.protected", "events.read", "events.create", "events.update", "events.delete", "dev", "admin", "applicant", "disabled"],
};

/**
 * Expand wildcard permissions to their full permission sets
 */
function expandWildcards(permissions) {
  const expanded = new Set();
  
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
 * Validate that a permission set includes all prerequisites
 * Handles wildcard permissions by expanding them first
 */
export function validatePermissionSet(permissions) {
  const missing = [];
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
 * React hook version of hasPermission
 */
export function useHasPermission(permission) {
  const permissions = useAuthStore((state) => state.permissions) || [];
  
  // Admin permission grants everything
  if (permissions.includes("admin")) {
    return true;
  }

  // Direct check
  if (permissions.includes(permission)) {
    return true;
  }

  // Check wildcard permissions
  if (permission.startsWith("applicants.") && permissions.includes("applicants.*")) {
    return true;
  }
  if (permission.startsWith("users.") && permissions.includes("users.*")) {
    return true;
  }
  if (permission.startsWith("events.") && permissions.includes("events.*")) {
    return true;
  }
  // dev permission grants access to applications management
  if (permission === "dev" && permissions.includes("dev")) {
    return true;
  }
  // App admin check
  if (permission.startsWith("app.") && permission.endsWith(".admin")) {
    if (permissions.includes(permission)) {
      return true;
    }
  }

  return false;
}

/**
 * React hook version of isAdmin
 */
export function useIsAdmin() {
  const permissions = useAuthStore((state) => state.permissions) || [];
  return permissions.includes("admin");
}

/**
 * Check if user is admin for a specific application
 */
export function useIsAppAdmin(appId) {
  const permissions = useAuthStore((state) => state.permissions) || [];
  // System admin has access to all apps
  if (permissions.includes("admin")) {
    return true;
  }
  // Check for app-specific admin permission
  return permissions.includes(`app.${appId}.admin`);
}

/**
 * Get all applications the user is admin for
 */
export function useAppAdminIds() {
  const permissions = useAuthStore((state) => state.permissions) || [];
  const appIds = [];
  
  for (const perm of permissions) {
    const match = perm.match(/^app\.(.+)\.admin$/);
    if (match) {
      appIds.push(match[1]);
    }
  }
  
  return appIds;
}

