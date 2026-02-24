"use client";
import React, { useState, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Info, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { validatePermissionSet, getPermissionPrerequisites } from "@/lib/permissions";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

// Available permissions organized by resource
const PERMISSION_GROUPS = {
  applicants: [
    { value: "applicants.read", label: "Read Applicants" },
    { value: "applicants.approve", label: "Approve Applicants" },
    { value: "applicants.reject", label: "Reject Applicants" },
    { value: "applicants.*", label: "All Applicant Permissions (Full Access)" },
  ],
  users: [
    { value: "users.read", label: "Read Users" },
    { value: "users.updateinfo", label: "Update User Info" },
    { value: "users.roles", label: "Manage User Roles" },
    { value: "users.*", label: "All User Permissions (Full Access)" },
  ],
  events: [
    { value: "events.read", label: "Read Events" },
    { value: "events.create", label: "Create Events" },
    { value: "events.update", label: "Update Events" },
    { value: "events.delete", label: "Delete Events" },
    { value: "events.*", label: "All Event Permissions (Full Access)" },
  ],
  special: [
    { value: "dev", label: "Developer (Full Applications Access)" },
    { value: "users.protected", label: "Protected User" },
    { value: "admin", label: "Admin (All Permissions)" },
    { value: "applicant", label: "Applicant" },
    { value: "disabled", label: "Disabled" },
  ],
};

export function PermissionSelector({
  permissions = [],
  onChange,
  disabled = false,
  showWarnings = true,
}) {
  const [localPermissions, setLocalPermissions] = useState(permissions);
  const [warnings, setWarnings] = useState([]);

  // Fetch all applications for the admin permissions
  const { data: applicationsData, isLoading: isLoadingApps } = useQuery({
    queryKey: ["allApplicationsForPermissions"],
    queryFn: async () => {
      const response = await api.post("/api/applications/getAllApplications");
      return response.data?.message || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const applications = applicationsData || [];

  // Update local state when permissions prop changes
  React.useEffect(() => {
    setLocalPermissions(permissions);
  }, [permissions]);

  // Generate app admin permission code from application ID
  const getAppAdminPermission = (appId) => `app.${appId}.admin`;

  const handlePermissionToggle = (permission, checked) => {
    let newPermissions = [...localPermissions];
    
    if (checked) {
      // Add permission if not already present
      if (!newPermissions.includes(permission)) {
        newPermissions.push(permission);
      }
      
      // Automatically add prerequisites
      const prerequisites = getPermissionPrerequisites(permission);
      for (const prereq of prerequisites) {
        if (!newPermissions.includes(prereq)) {
          newPermissions.push(prereq);
        }
      }
      
      // If selecting applicant or disabled, clear all other permissions
      if (permission === "applicant" || permission === "disabled") {
        newPermissions = [permission];
      }
      // If selecting a wildcard, remove individual permissions of that type
      else if (permission === "applicants.*") {
        newPermissions = newPermissions.filter(p => 
          !p.startsWith("applicants.") || p === "applicants.*"
        );
        newPermissions.push("applicants.*");
      } else if (permission === "users.*") {
        newPermissions = newPermissions.filter(p => 
          !p.startsWith("users.") || p === "users.*" || p === "users.protected"
        );
        newPermissions.push("users.*");
      } else if (permission === "admin") {
        // Admin grants everything - remove all other permissions
        newPermissions = ["admin"];
      }
      
      // If selecting individual permission but wildcard exists, remove wildcard
      if (permission.startsWith("applicants.") && permission !== "applicants.*") {
        newPermissions = newPermissions.filter(p => p !== "applicants.*");
      }
    if (permission.startsWith("users.") && permission !== "users.*" && permission !== "users.protected") {
      newPermissions = newPermissions.filter(p => p !== "users.*");
      }
      if (permission.startsWith("events.") && permission !== "events.*") {
        newPermissions = newPermissions.filter(p => p !== "events.*");
      }
    } else {
      // Remove permission
      newPermissions = newPermissions.filter(p => p !== permission);
      
      // Also remove permissions that depend on this one (if this was a prerequisite)
      // Check if any remaining permissions need this as a prerequisite
      const remainingPermissions = newPermissions.filter(p => p !== permission);
      for (const remainingPerm of remainingPermissions) {
        const prereqs = getPermissionPrerequisites(remainingPerm);
        if (prereqs.includes(permission)) {
          // This permission depends on the one being removed, so remove it too
          newPermissions = newPermissions.filter(p => p !== remainingPerm);
        }
      }
    }
    
    // Remove duplicates
    newPermissions = [...new Set(newPermissions)];
    
    // Validate prerequisites (should be valid now since we auto-added them)
    const validation = validatePermissionSet(newPermissions);
    const newWarnings = [];
    
    if (!validation.valid && showWarnings) {
      newWarnings.push(
        `Missing prerequisites: ${validation.missing.join(", ")}. They will be automatically added.`
      );
    }
    
    setWarnings(newWarnings);
    setLocalPermissions(newPermissions);
    
    if (onChange) {
      onChange(newPermissions);
    }
  };

  const isPermissionDisabled = (permission) => {
    // Disable admin checkbox
    if (permission === "admin") {
      return true;
    }
    // Disable individual permissions if wildcard is selected
    if (permission.startsWith("applicants.") && permission !== "applicants.*") {
      return localPermissions.includes("applicants.*") || localPermissions.includes("admin");
    }
    if (permission.startsWith("users.") && permission !== "users.*" && permission !== "users.protected") {
      return localPermissions.includes("users.*") || localPermissions.includes("admin");
    }
    if (permission.startsWith("events.") && permission !== "events.*") {
      return localPermissions.includes("events.*") || localPermissions.includes("admin");
    }
    // Disable everything if admin, applicant, or disabled is selected
    if (permission !== "admin" && permission !== "applicant" && permission !== "disabled") {
      if (localPermissions.includes("admin") || localPermissions.includes("applicant") || localPermissions.includes("disabled")) {
        return true;
      }
    }
    return disabled;
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {/* Applicants Permissions */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Applicants</h4>
          <div className="space-y-2 ml-4">
            {PERMISSION_GROUPS.applicants.map((perm) => {
              const isSelected = localPermissions.includes(perm.value);
              const isDisabled = isPermissionDisabled(perm.value);
              const isWildcard = perm.value.endsWith(".*");
              
              return (
                <div
                  key={perm.value}
                  className={cn("flex items-start space-x-2", {
                    "opacity-50": isDisabled,
                  })}
                >
                  <Checkbox
                    id={perm.value}
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      handlePermissionToggle(perm.value, checked)
                    }
                    disabled={isDisabled}
                    className="mt-1"
                  />
                  <label
                    htmlFor={perm.value}
                    className={cn(
                      "text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2",
                      {
                        "cursor-pointer": !isDisabled,
                        "cursor-not-allowed": isDisabled,
                      }
                    )}
                  >
                    {perm.label}
                    {isWildcard && (
                      <Badge variant="outline" className="text-xs">
                        Wildcard
                      </Badge>
                    )}
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Users Permissions */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Users</h4>
          <div className="space-y-2 ml-4">
            {PERMISSION_GROUPS.users.map((perm) => {
              const isSelected = localPermissions.includes(perm.value);
              const isDisabled = isPermissionDisabled(perm.value);
              const isWildcard = perm.value.endsWith(".*");
              
              return (
                <div
                  key={perm.value}
                  className={cn("flex items-start space-x-2", {
                    "opacity-50": isDisabled,
                  })}
                >
                  <Checkbox
                    id={perm.value}
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      handlePermissionToggle(perm.value, checked)
                    }
                    disabled={isDisabled}
                    className="mt-1"
                  />
                  <label
                    htmlFor={perm.value}
                    className={cn(
                      "text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2",
                      {
                        "cursor-pointer": !isDisabled,
                        "cursor-not-allowed": isDisabled,
                      }
                    )}
                  >
                    {perm.label}
                    {isWildcard && (
                      <Badge variant="outline" className="text-xs">
                        Wildcard
                      </Badge>
                    )}
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Events Permissions */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Events</h4>
          <div className="space-y-2 ml-4">
            {PERMISSION_GROUPS.events.map((perm) => {
              const isSelected = localPermissions.includes(perm.value);
              const isDisabled = isPermissionDisabled(perm.value);
              const isWildcard = perm.value.endsWith(".*");
              
              return (
                <div
                  key={perm.value}
                  className={cn("flex items-start space-x-2", {
                    "opacity-50": isDisabled,
                  })}
                >
                  <Checkbox
                    id={perm.value}
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      handlePermissionToggle(perm.value, checked)
                    }
                    disabled={isDisabled}
                    className="mt-1"
                  />
                  <label
                    htmlFor={perm.value}
                    className={cn(
                      "text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2",
                      {
                        "cursor-pointer": !isDisabled,
                        "cursor-not-allowed": isDisabled,
                      }
                    )}
                  >
                    {perm.label}
                    {isWildcard && (
                      <Badge variant="outline" className="text-xs">
                        Wildcard
                      </Badge>
                    )}
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Application Admin Permissions */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Application Admin Access</h4>
          <p className="text-xs text-muted-foreground ml-4 mb-2">
            Grant admin access to specific applications. App admins can manage RBAC for their application.
          </p>
          <div className="space-y-2 ml-4">
            {isLoadingApps ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading applications...
              </div>
            ) : applications.length === 0 ? (
              <p className="text-sm text-muted-foreground">No applications created yet.</p>
            ) : (
              applications.map((app) => {
                const adminPermission = getAppAdminPermission(app.id);
                const isSelected = localPermissions.includes(adminPermission);
                const isDisabled = isPermissionDisabled(adminPermission);
                
                return (
                  <div
                    key={app.id}
                    className={cn("flex items-start space-x-2", {
                      "opacity-50": isDisabled,
                    })}
                  >
                    <Checkbox
                      id={adminPermission}
                      checked={isSelected}
                      onCheckedChange={(checked) =>
                        handlePermissionToggle(adminPermission, checked)
                      }
                      disabled={isDisabled}
                      className="mt-1"
                    />
                    <label
                      htmlFor={adminPermission}
                      className={cn(
                        "text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2",
                        {
                          "cursor-pointer": !isDisabled,
                          "cursor-not-allowed": isDisabled,
                        }
                      )}
                    >
                      {app.name} Admin
                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                        App Admin
                      </Badge>
                    </label>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Special Permissions */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Special</h4>
          <div className="space-y-2 ml-4">
            {PERMISSION_GROUPS.special.map((perm) => {
              const isSelected = localPermissions.includes(perm.value);
              const isDisabled = isPermissionDisabled(perm.value);
              const isAdmin = perm.value === "admin";
              const isDev = perm.value === "dev";
              
              return (
                <div
                  key={perm.value}
                  className={cn("flex items-start space-x-2", {
                    "opacity-50": isDisabled,
                  })}
                >
                  <Checkbox
                    id={perm.value}
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      handlePermissionToggle(perm.value, checked)
                    }
                    disabled={isDisabled}
                    className="mt-1"
                  />
                  <label
                    htmlFor={perm.value}
                    className={cn(
                      "text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2",
                      {
                        "cursor-pointer": !isDisabled,
                        "cursor-not-allowed": isDisabled,
                      }
                    )}
                  >
                    {perm.label}
                    {isAdmin && (
                      <Badge variant="default" className="text-xs bg-red-100 text-red-800">
                        All Access
                      </Badge>
                    )}
                    {isDev && (
                      <Badge variant="default" className="text-xs bg-blue-100 text-blue-800">
                        Dev Access
                      </Badge>
                    )}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
