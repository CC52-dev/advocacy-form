"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  MoreHorizontal,
  Settings,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";

// Helper to get display name for a permission
function getPermissionDisplayName(roleCode, application) {
  const permsList = application?.permissionsDefinition?.permissions || 
                    application?.rolesDefinition?.roles ||
                    application?.rolesDefinition?.permissions || [];
  const perm = permsList.find(p => p.code === roleCode);
  return perm?.name || roleCode;
}

// Helper to sanitize title for permission code
const sanitizeTitle = (title) => {
  return title
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
};

// Helper to get app prefix
const getAppPrefix = (name) => {
  if (!name) return "";
  return name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") + ".";
};

// Permission Selector Dialog Component (for All Users tab)
function PermissionSelectorDialog({ 
  open, 
  onOpenChange, 
  user, 
  appId, 
  application, 
  userRoles,
  isSystemAdmin,
  queryClient, 
  toast 
}) {
  const [pendingChanges, setPendingChanges] = React.useState({});
  const [isSaving, setIsSaving] = React.useState(false);
  const [titleValue, setTitleValue] = React.useState("");

  // Check if user is an admin for this application
  const isUserAppAdmin = React.useMemo(() => {
    return userRoles?.some(r => r.roleCode === "admin");
  }, [userRoles]);

  // Get current user roles as a Set for easy lookup
  const currentRoles = React.useMemo(() => {
    const roles = new Set();
    userRoles?.forEach(r => roles.add(r.roleCode));
    return roles;
  }, [userRoles]);

  // Get current title (stored in the title column, not as a permission)
  const currentTitle = React.useMemo(() => {
    const roleWithTitle = userRoles?.find(r => r.title);
    return roleWithTitle?.title || "";
  }, [userRoles]);

  // Initialize title value when dialog opens
  React.useEffect(() => {
    if (open) {
      setTitleValue(currentTitle);
    }
  }, [open, currentTitle]);

  // Get all available permissions from definition (admin is managed elsewhere)
  const availablePermissions = React.useMemo(() => {
    const perms = [];
    const permsList = application?.permissionsDefinition?.permissions || 
                      application?.rolesDefinition?.roles ||
                      application?.rolesDefinition?.permissions || [];
    if (permsList.length > 0) {
      perms.push(...permsList.map(p => ({
        code: p.code,
        name: p.name,
        description: p.description || null,
        category: p.category || null,
        constraints: p.constraints || null,
      })));
    }
    return perms;
  }, [application]);

  // Get categories list with names
  const categoriesMap = React.useMemo(() => {
    const map = new Map();
    const catsList = application?.permissionsDefinition?.categories || 
                     application?.rolesDefinition?.categories || [];
    catsList.forEach(cat => {
      map.set(cat.code, cat.name);
    });
    return map;
  }, [application]);

  const getCategoryDisplayName = (categoryCode) => {
    if (!categoryCode) return null;
    return categoriesMap.get(categoryCode) || categoryCode;
  };

  // Group permissions by category
  const permissionsByCategory = React.useMemo(() => {
    const categories = new Map();
    
    const catsList = application?.permissionsDefinition?.categories || 
                     application?.rolesDefinition?.categories || [];
    catsList.forEach(cat => {
      categories.set(cat.code, { name: cat.name, permissions: [] });
    });
    
    categories.set(null, { name: "General", permissions: [] });
    
    availablePermissions.forEach(perm => {
      const cat = perm.category || null;
      if (!categories.has(cat)) {
        categories.set(cat, { name: cat || "Other", permissions: [] });
      }
      categories.get(cat).permissions.push(perm);
    });
    
    for (const [key, value] of categories.entries()) {
      if (value.permissions.length === 0) {
        categories.delete(key);
      }
    }
    
    return categories;
  }, [availablePermissions, application]);

  React.useEffect(() => {
    setPendingChanges({});
  }, [open, user?.id]);

  const effectiveRoles = React.useMemo(() => {
    const roles = new Set(currentRoles);
    Object.entries(pendingChanges).forEach(([code, enabled]) => {
      if (enabled) {
        roles.add(code);
      } else {
        roles.delete(code);
      }
    });
    return roles;
  }, [currentRoles, pendingChanges]);

  const canTogglePermission = (permCode) => {
    // If user is an app admin, they cannot have other permissions edited
    if (isUserAppAdmin) {
      return { canToggle: false, reason: "App admins cannot have other permissions" };
    }

    const perm = availablePermissions.find(p => p.code === permCode);
    if (!perm) return { canToggle: false, reason: "Permission not found" };

    const wouldBeEnabled = pendingChanges[permCode] !== undefined 
      ? pendingChanges[permCode] 
      : currentRoles.has(permCode);
    
    if (!wouldBeEnabled) {
      if (perm.constraints?.exclusive) {
        const otherRoles = [...effectiveRoles].filter(r => r !== permCode);
        if (otherRoles.length > 0) {
          return { canToggle: false, reason: "Exclusive - cannot combine with other permissions" };
        }
      }

      if (perm.constraints?.onlyOneInCategory && perm.category) {
        const categoryPerms = availablePermissions
          .filter(p => p.category === perm.category && p.code !== permCode)
          .map(p => p.code);
        const hasOtherInCategory = categoryPerms.some(p => effectiveRoles.has(p));
        if (hasOtherInCategory) {
          return { canToggle: false, reason: `Only one allowed in "${getCategoryDisplayName(perm.category)}"` };
        }
      }

      if (perm.constraints?.prerequisites?.length > 0) {
        const missingPrereqs = perm.constraints.prerequisites.filter(
          prereq => !effectiveRoles.has(prereq)
        );
        if (missingPrereqs.length > 0) {
          const prereqNames = missingPrereqs.map(p => {
            const prereqPerm = availablePermissions.find(r => r.code === p);
            return prereqPerm?.name || p;
          }).join(', ');
          return { canToggle: false, reason: `Requires: ${prereqNames}` };
        }
      }

      for (const existingCode of effectiveRoles) {
        const existingPerm = availablePermissions.find(p => p.code === existingCode);
        if (existingPerm?.constraints?.exclusive && existingCode !== permCode) {
          return { canToggle: false, reason: `"${existingPerm.name}" is exclusive` };
        }
      }
    }

    return { canToggle: true, reason: null };
  };

  const handlePermissionToggle = (permCode) => {
    const currentValue = pendingChanges[permCode] !== undefined 
      ? pendingChanges[permCode] 
      : currentRoles.has(permCode);
    
    setPendingChanges(prev => ({
      ...prev,
      [permCode]: !currentValue,
    }));
  };

  const isPermissionChecked = (permCode) => {
    if (pendingChanges[permCode] !== undefined) {
      return pendingChanges[permCode];
    }
    return currentRoles.has(permCode);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const promises = [];
      const newRoleAssignments = [];
      const hasExistingRoles = currentRoles.size > 0;
      const titleChanged = titleValue !== currentTitle;
      
      // Handle permission changes
      for (const [permCode, enabled] of Object.entries(pendingChanges)) {
        const wasEnabled = currentRoles.has(permCode);
        
        if (enabled && !wasEnabled) {
          // Assign role
          newRoleAssignments.push(permCode);
          // Include title in the first role assignment if user has no existing roles and title changed
          const shouldIncludeTitle = !hasExistingRoles && titleChanged && newRoleAssignments.length === 1;
          promises.push(
            api.post(`/api/app-roles/${appId}/assign`, {
              userId: user.id,
              roleCode: permCode,
              title: shouldIncludeTitle ? titleValue : null,
            })
          );
        } else if (!enabled && wasEnabled) {
          // Remove role
          promises.push(
            api.post(`/api/app-roles/${appId}/remove`, {
              userId: user.id,
              roleCode: permCode,
            })
          );
        }
      }

      // Wait for role assignments/removals to complete before updating title
      if (promises.length > 0) {
        await Promise.all(promises);
      }

      // Handle title change separately (only if user already has roles or we didn't include it in role assignment)
      if (titleChanged && (hasExistingRoles || newRoleAssignments.length === 0 || newRoleAssignments.length > 1)) {
        await api.post(`/api/app-roles/${appId}/update-title`, {
          userId: user.id,
          title: titleValue || null,
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ["applicationUsers", appId] });
      queryClient.invalidateQueries({ queryKey: ["allUsersWithAppRoles", appId] });
      toast({
        title: "Permissions updated",
        description: "User permissions have been updated successfully.",
        duration: 3000,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update permissions",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = Object.keys(pendingChanges).some(
    code => pendingChanges[code] !== currentRoles.has(code)
  ) || titleValue !== currentTitle;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogTitle>
          Manage Permissions - {user?.firstname} {user?.lastname}
        </DialogTitle>
        <DialogDescription>
          {user?.email}
        </DialogDescription>

        <div className="space-y-4 py-4">
          {/* Application-specific Title */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Application-Specific Title</Label>
            <Input
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              placeholder="e.g., Senior Developer, Team Lead"
              className="h-9"
            />
            <p className="text-xs text-muted-foreground">
              This title will be visible within this application only.
            </p>
          </div>

          <Separator />

          {/* Admin Warning */}
          {isUserAppAdmin && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Application Admin</span>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                This user is an application admin. Admins cannot have other permissions assigned.
              </p>
            </div>
          )}

          {availablePermissions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No permissions defined for this application.
            </p>
          ) : (
            Array.from(permissionsByCategory.entries()).map(([categoryCode, categoryData]) => (
              <div key={categoryCode || "general"} className="space-y-2">
                <h4 className="text-sm font-semibold">{categoryData.name || "General"}</h4>
                <div className="space-y-2 ml-4">
                  {categoryData.permissions.map((perm) => {
                    const { canToggle, reason } = canTogglePermission(perm.code);
                    const isChecked = isPermissionChecked(perm.code);
                    const isDisabled = !canToggle && !isChecked;
                    
                    return (
                      <div
                        key={perm.code}
                        className={`flex items-start space-x-2 ${isDisabled ? 'opacity-50' : ''}`}
                      >
                        <Checkbox
                          id={`perm-${perm.code}`}
                          checked={isChecked}
                          onCheckedChange={() => handlePermissionToggle(perm.code)}
                          disabled={isDisabled}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-1">
                          <Label 
                            htmlFor={`perm-${perm.code}`}
                            className={`text-sm font-medium ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            {perm.name}
                          </Label>
                          {perm.description && (
                            <p className="text-xs text-muted-foreground">
                              {perm.description}
                            </p>
                          )}
                          {perm.constraints && (
                            <div className="flex flex-wrap gap-1">
                              {perm.constraints.exclusive && (
                                <Badge variant="secondary" className="text-xs">Exclusive</Badge>
                              )}
                              {perm.constraints.onlyOneInCategory && (
                                <Badge variant="secondary" className="text-xs">One per category</Badge>
                              )}
                              {perm.constraints.prerequisites?.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  Requires {perm.constraints.prerequisites.length}
                                </Badge>
                              )}
                            </div>
                          )}
                          {!canToggle && reason && (
                            <div className="flex items-center gap-1 text-xs text-amber-600">
                              <AlertCircle className="h-3 w-3" />
                              {reason}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !hasChanges}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Action Cell Component for All Users
function ActionCell({ row, appId, application, userRoles, isSystemAdmin, queryClient, toast }) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  
  // Check if this user is an admin for this application
  const isUserAdmin = userRoles?.some(r => r.roleCode === "admin");

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {isUserAdmin ? (
            <DropdownMenuItem disabled className="text-muted-foreground">
              <Settings className="mr-2 h-4 w-4" />
              Admin (permissions locked)
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
              <Settings className="mr-2 h-4 w-4" />
              Manage Permissions
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {!isUserAdmin && (
        <PermissionSelectorDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          user={row.original}
          appId={appId}
          application={application}
          userRoles={userRoles}
          isSystemAdmin={isSystemAdmin}
          queryClient={queryClient}
          toast={toast}
        />
      )}
    </>
  );
}

export function DataTableAllUsers({ appId, application, allUsers, appUsersData, isLoading, isSystemAdmin, refetch, isFetching }) {
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create a map of userId to their roles in this application
  const userRolesMap = React.useMemo(() => {
    const map = new Map();
    if (appUsersData?.users) {
      appUsersData.users.forEach(user => {
        map.set(user.userId, user.roles || []);
      });
    }
    return map;
  }, [appUsersData]);

  // Define columns
  const columns = React.useMemo(() => [
    {
      accessorKey: "email",
      header: "User",
      cell: ({ row }) => {
        const firstname = row.original.firstname || "";
        const lastname = row.original.lastname || "";
        const email = row.original.email || "";
        return (
          <div>
            <div className="font-medium">
              {firstname} {lastname}
            </div>
            <div className="text-sm text-muted-foreground">{email}</div>
          </div>
        );
      },
    },
    {
      id: "permissions",
      header: "Application Permissions",
      cell: ({ row }) => {
        const roles = userRolesMap.get(row.original.id) || [];
        
        if (roles.length === 0) {
          return <span className="text-muted-foreground text-sm">None</span>;
        }
        
        // Get title from any role (it's stored on the record, not as a permission)
        const title = roles.find(r => r.title)?.title;
        
        return (
          <div className="flex flex-wrap gap-1 items-center">
            {roles.map((role) => {
              const displayName = role.roleCode === "admin" ? "Admin" : getPermissionDisplayName(role.roleCode, application);
              const isLong = displayName.length > 15;
              
              if (isLong) {
                return (
                  <Tooltip key={role.roleCode}>
                    <TooltipTrigger asChild>
                      <Badge
                        variant={role.roleCode === "admin" ? "default" : "secondary"}
                        className="cursor-help"
                      >
                        {displayName.substring(0, 12)}...
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{displayName}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }
              return (
                <Badge
                  key={role.roleCode}
                  variant={role.roleCode === "admin" ? "default" : "secondary"}
                >
                  {displayName}
                </Badge>
              );
            })}
            {title && (
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                {title}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const roles = userRolesMap.get(row.original.id) || [];
        return (
          <ActionCell
            row={row}
            appId={appId}
            application={application}
            userRoles={roles}
            isSystemAdmin={isSystemAdmin}
            queryClient={queryClient}
            toast={toast}
          />
        );
      },
    },
  ], [appId, application, userRolesMap, isSystemAdmin, queryClient, toast]);

  const table = useReactTable({
    data: allUsers || [],
    columns,
    defaultColumn: {
      minSize: 60,
      maxSize: 800,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="w-full max-w-none overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center items-start py-4 space-y-4 sm:space-y-0 sm:space-x-4">
          <Input
            placeholder="Filter by email..."
            value={table.getColumn("email")?.getFilterValue() ?? ""}
            onChange={(event) =>
              table.getColumn("email")?.setFilterValue(event.target.value)
            }
            className="w-full sm:max-w-sm"
          />

          {refetch && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="w-full sm:w-auto h-10"
            >
              <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                Columns <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="rounded-md border w-full overflow-x-auto bg-white dark:bg-gray-900 p-2">
          <Table className="w-full min-w-[400px]">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="whitespace-nowrap px-2 sm:px-4">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="whitespace-nowrap px-2 sm:px-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center whitespace-nowrap px-2 sm:px-4"
                  >
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between py-4 space-y-4 sm:space-y-0">
          <div className="flex-1 text-sm text-muted-foreground text-center sm:text-left">
            {allUsers?.length || 0} total user(s). {appUsersData?.users?.length || 0} with permissions.
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft />
            </Button>
            <span className="text-sm">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
