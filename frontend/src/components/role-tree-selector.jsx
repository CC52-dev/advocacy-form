"use client";
import React, { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { validatePermissionSet } from "@/lib/permissions";

export function RoleTreeSelector({
  roles = [],
  selectedRoleIds = [],
  onChange,
  disabled = false,
  targetUserIsAdmin = false,
  targetUserRoles = [],
}) {
  const [localSelectedIds, setLocalSelectedIds] = useState(selectedRoleIds);
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    setLocalSelectedIds(selectedRoleIds);
  }, [selectedRoleIds]);

  // Helper to parse permissions (handles JSON strings)
  const parsePermissions = (perms) => {
    if (Array.isArray(perms)) return perms;
    if (typeof perms === 'string') {
      try {
        const parsed = JSON.parse(perms);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error('Error parsing permissions in role-tree-selector:', e, perms);
        return [];
      }
    }
    return [];
  };

  const handleRoleToggle = (roleId, checked) => {
    const role = roles.find((r) => (r.id === roleId) || (r.roleTitle === roleId) || (r.name === roleId));
    if (!role) return;

    let newSelectedIds = [...localSelectedIds];
    const warnings = [];

    if (checked) {
      // Add role
      if (!newSelectedIds.includes(roleId)) {
        newSelectedIds.push(roleId);
      }
    } else {
      // Remove role
      newSelectedIds = newSelectedIds.filter((id) => id !== roleId);
    }

    // Validate prerequisites
    const selectedRoles = roles.filter((r) => newSelectedIds.includes(r.id || r.roleTitle || r.name));
    const allPermissions = selectedRoles.flatMap((r) => {
      const perms = parsePermissions(r.permissions);
      return Array.isArray(perms) ? perms : [];
    });
    const validation = validatePermissionSet(allPermissions);
    
    if (!validation.valid) {
      warnings.push(
        `Missing prerequisites: ${validation.missing.join(", ")}. They will be automatically added.`
      );
    }

    setWarnings(warnings);
    setLocalSelectedIds(newSelectedIds);
    
    if (onChange) {
      onChange(newSelectedIds);
    }
  };

  const isRoleDisabled = (role) => {
    const rolePermissions = parsePermissions(role.permissions);
    const hasAdminInRole = Array.isArray(rolePermissions) && rolePermissions.includes("admin");
    
    // Admin role cannot be edited if target user is admin
    if (targetUserIsAdmin && hasAdminInRole) {
      return true;
    }

    return disabled;
  };

  return (
    <div className="space-y-4">
      {warnings.length > 0 && (
        <Alert variant="default" className="bg-yellow-50 border-yellow-200">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <ul className="list-disc list-inside space-y-1">
              {warnings.map((warning, idx) => (
                <li key={idx}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {targetUserIsAdmin && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This user is an admin and cannot have their roles edited.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2 max-h-96 overflow-y-auto border rounded-md p-4">
        {roles.map((role) => {
          const roleId = role.id || role.roleTitle || role.name;
          const isSelected = localSelectedIds.includes(roleId);
          const isDisabled = isRoleDisabled(role);
          const rolePermissions = parsePermissions(role.permissions);

          return (
            <div
              key={role.id}
              className={cn(
                "flex items-start space-x-3 p-2 rounded-md hover:bg-muted/50",
                {
                  "opacity-50": isDisabled,
                }
              )}
            >
              <Checkbox
                id={roleId}
                checked={isSelected}
                onCheckedChange={(checked) =>
                  handleRoleToggle(roleId, checked)
                }
                disabled={isDisabled}
                className="mt-1"
              />
              <div className="flex-1 space-y-1">
                <label
                  htmlFor={roleId}
                  className={cn(
                    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2",
                    {
                      "cursor-pointer": !isDisabled,
                      "cursor-not-allowed": isDisabled,
                    }
                  )}
                >
                  {role.roleTitle || role.name || roleId}
                  {Array.isArray(rolePermissions) && rolePermissions.includes("users.protected") && (
                    <Badge variant="secondary" className="text-xs">
                      Protected
                    </Badge>
                  )}
                </label>
                {role.permissions && Array.isArray(role.permissions) && role.permissions.length > 0 && (
                  <div className="text-xs text-muted-foreground ml-6">
                    Permissions: {role.permissions.join(", ")}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {localSelectedIds.length === 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            No roles selected. User will have no roles but can still log in and access basic features.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
