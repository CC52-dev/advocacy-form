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
  MoreHorizontal,
  Settings,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Label } from "@/components/ui/label";
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

import api from "@/lib/axios";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
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

// Role Management Dialog Component
function RoleManagementDialog({ 
  open, 
  onOpenChange, 
  user, 
  appId, 
  application, 
  isSystemAdmin, 
  queryClient, 
  toast 
}) {
  const [pendingChanges, setPendingChanges] = React.useState({});
  const [isSaving, setIsSaving] = React.useState(false);
  const [titleValue, setTitleValue] = React.useState("");

  // Check if user is an admin for this application
  const isUserAppAdmin = React.useMemo(() => {
    return user?.roles?.some(r => r.roleCode === "admin");
  }, [user?.roles]);

  // Get current title from roles (stored in the title column, not as a permission)
  const currentTitle = React.useMemo(() => {
    // Title is stored on any role record, so just get the first one with a title
    const roleWithTitle = user?.roles?.find(r => r.title);
    return roleWithTitle?.title || "";
  }, [user?.roles]);

  // Initialize title value when dialog opens
  React.useEffect(() => {
    if (open) {
      setTitleValue(currentTitle);
    }
  }, [open, currentTitle]);

  // Get current user roles as a Set for easy lookup
  const currentRoles = React.useMemo(() => {
    const roles = new Set();
    user?.roles?.forEach(r => roles.add(r.roleCode));
    return roles;
  }, [user?.roles]);

  // Get all available roles (custom roles from definition, admin is managed elsewhere)
  const availableRoles = React.useMemo(() => {
    const roles = [];
    // Support both old "rolesDefinition.roles" and new "permissionsDefinition.permissions" format
    const permsList = application?.permissionsDefinition?.permissions || 
                      application?.rolesDefinition?.roles ||
                      application?.rolesDefinition?.permissions || [];
    if (permsList.length > 0) {
      roles.push(...permsList.map(p => ({
        code: p.code,
        name: p.name,
        description: p.description || null,
        category: p.category || null,
        constraints: p.constraints || null,
      })));
    }
    return roles;
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

  // Get category display name
  const getCategoryDisplayName = (categoryCode) => {
    if (!categoryCode) return null;
    return categoriesMap.get(categoryCode) || categoryCode;
  };

  // Group roles by category (in order of categories defined)
  const rolesByCategory = React.useMemo(() => {
    const categories = new Map();
    
    // First, create entries for all defined categories in order
    const catsList = application?.permissionsDefinition?.categories || 
                     application?.rolesDefinition?.categories || [];
    catsList.forEach(cat => {
      categories.set(cat.code, { name: cat.name, roles: [] });
    });
    
    // Add "default" category for uncategorized roles
    categories.set(null, { name: null, roles: [] });
    
    availableRoles.forEach(role => {
      const cat = role.category || null;
      if (!categories.has(cat)) {
        categories.set(cat, { name: cat, roles: [] });
      }
      categories.get(cat).roles.push(role);
    });
    
    // Remove empty categories
    for (const [key, value] of categories.entries()) {
      if (value.roles.length === 0) {
        categories.delete(key);
      }
    }
    
    return categories;
  }, [availableRoles, application]);

  // Reset pending changes when dialog opens/closes or user changes
  React.useEffect(() => {
    setPendingChanges({});
  }, [open, user?.userId]);

  // Calculate effective roles (current + pending changes)
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

  // Check if a role can be toggled based on constraints
  const canToggleRole = (roleCode) => {
    const role = availableRoles.find(r => r.code === roleCode);
    if (!role) return { canToggle: false, reason: "Role not found" };
    
    // If user is an app admin, they cannot have their permissions edited
    if (isUserAppAdmin) {
      return { canToggle: false, reason: "App admins cannot have other permissions" };
    }

    const wouldBeEnabled = pendingChanges[roleCode] !== undefined 
      ? pendingChanges[roleCode] 
      : currentRoles.has(roleCode);
    
    // If we're trying to enable the role, check constraints
    if (!wouldBeEnabled) {
      // Check exclusive constraint - if this role is exclusive and user has other roles
      if (role.constraints?.exclusive) {
        const otherRoles = [...effectiveRoles].filter(r => r !== roleCode);
        if (otherRoles.length > 0) {
          return { 
            canToggle: false, 
            reason: "This role is exclusive and cannot be combined with other roles" 
          };
        }
      }

      // Check onlyOneInCategory constraint
      if (role.constraints?.onlyOneInCategory && role.category) {
        const categoryRoles = availableRoles
          .filter(r => r.category === role.category && r.code !== roleCode)
          .map(r => r.code);
        const hasOtherInCategory = categoryRoles.some(r => effectiveRoles.has(r));
        if (hasOtherInCategory) {
          const categoryName = getCategoryDisplayName(role.category) || role.category;
          return { 
            canToggle: false, 
            reason: `Only one role allowed in the "${categoryName}" category` 
          };
        }
      }

      // Check prerequisites
      if (role.constraints?.prerequisites?.length > 0) {
        const missingPrereqs = role.constraints.prerequisites.filter(
          prereq => !effectiveRoles.has(prereq)
        );
        if (missingPrereqs.length > 0) {
          const prereqNames = missingPrereqs.map(p => {
            const prereqRole = availableRoles.find(r => r.code === p);
            return prereqRole?.name || p;
          }).join(', ');
          return { 
            canToggle: false, 
            reason: `Requires: ${prereqNames}` 
          };
        }
      }

      // Check if user has an exclusive role that prevents adding more
      for (const existingRoleCode of effectiveRoles) {
        const existingRole = availableRoles.find(r => r.code === existingRoleCode);
        if (existingRole?.constraints?.exclusive && existingRoleCode !== roleCode) {
          return { 
            canToggle: false, 
            reason: `User has exclusive role "${existingRole.name}" which prevents adding more roles` 
          };
        }
      }
    }

    return { canToggle: true, reason: null };
  };

  // Get prerequisite names for display
  const getPrerequisiteNames = (prereqs) => {
    if (!prereqs?.length) return [];
    return prereqs.map(p => {
      const prereqRole = availableRoles.find(r => r.code === p);
      return prereqRole?.name || p;
    });
  };

  // Handle checkbox change
  const handleRoleToggle = (roleCode) => {
    const currentValue = pendingChanges[roleCode] !== undefined 
      ? pendingChanges[roleCode] 
      : currentRoles.has(roleCode);
    
    setPendingChanges(prev => ({
      ...prev,
      [roleCode]: !currentValue,
    }));
  };

  // Check if role is currently checked (considering pending changes)
  const isRoleChecked = (roleCode) => {
    if (pendingChanges[roleCode] !== undefined) {
      return pendingChanges[roleCode];
    }
    return currentRoles.has(roleCode);
  };

  // Save changes
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const promises = [];
      const newRoleAssignments = [];
      const hasExistingRoles = currentRoles.size > 0;
      const titleChanged = titleValue !== currentTitle;
      
      // Handle permission changes
      for (const [roleCode, enabled] of Object.entries(pendingChanges)) {
        const wasEnabled = currentRoles.has(roleCode);
        
        if (enabled && !wasEnabled) {
          // Assign role
          newRoleAssignments.push(roleCode);
          // Include title in the first role assignment if user has no existing roles and title changed
          const shouldIncludeTitle = !hasExistingRoles && titleChanged && newRoleAssignments.length === 1;
          promises.push(
            api.post(`/api/app-roles/${appId}/assign`, {
              userId: user.userId,
              roleCode,
              title: shouldIncludeTitle ? titleValue : null,
            })
          );
        } else if (!enabled && wasEnabled) {
          // Remove role
          promises.push(
            api.post(`/api/app-roles/${appId}/remove`, {
              userId: user.userId,
              roleCode,
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
          userId: user.userId,
          title: titleValue || null,
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ["applicationUsers", appId] });
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

          {Array.from(rolesByCategory.entries()).map(([categoryCode, categoryData]) => (
            <div key={categoryCode || "uncategorized"} className="space-y-3">
              {categoryData.name && (
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {categoryData.name}
                </h4>
              )}
              <div className="space-y-2">
                {categoryData.roles.map((role) => {
                  const { canToggle, reason } = canToggleRole(role.code);
                  const isChecked = isRoleChecked(role.code);
                  const isDisabled = !canToggle && !isChecked;
                  
                  return (
                    <div 
                      key={role.code} 
                      className={`flex items-start space-x-3 p-3 rounded-md border ${
                        isChecked ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'
                      } ${isDisabled ? 'opacity-60' : ''}`}
                    >
                      <Checkbox
                        id={`role-${role.code}`}
                        checked={isChecked}
                        onCheckedChange={() => handleRoleToggle(role.code)}
                        disabled={isDisabled}
                      />
                      <div className="flex-1 space-y-1">
                        <Label 
                          htmlFor={`role-${role.code}`}
                          className={`font-medium cursor-pointer ${isDisabled ? 'cursor-not-allowed' : ''}`}
                        >
                          {role.name}
                          {role.code === "admin" && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Admin
                            </Badge>
                          )}
                        </Label>
                        {role.description && (
                          <p className="text-xs text-muted-foreground">
                            {role.description}
                          </p>
                        )}
                        {role.constraints && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {role.constraints.exclusive && (
                              <Badge variant="secondary" className="text-xs">
                                Exclusive
                              </Badge>
                            )}
                            {role.constraints.onlyOneInCategory && (
                              <Badge variant="secondary" className="text-xs">
                                One per category
                              </Badge>
                            )}
                            {role.constraints.prerequisites?.length > 0 && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant="outline" className="text-xs cursor-help">
                                    Requires {role.constraints.prerequisites.length}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Prerequisites: {getPrerequisiteNames(role.constraints.prerequisites).join(', ')}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        )}
                        {!canToggle && reason && (
                          <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
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
          ))}
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

// Action Cell Component
function ActionCell({ row, appId, application, isSystemAdmin, queryClient, toast }) {
  const [isRoleDialogOpen, setIsRoleDialogOpen] = React.useState(false);
  
  // Check if this user is an admin for this application
  const isUserAdmin = row.original.roles?.some(r => r.roleCode === "admin");

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
            <DropdownMenuItem onClick={() => setIsRoleDialogOpen(true)}>
              <Settings className="mr-2 h-4 w-4" />
              Manage Permissions
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {!isUserAdmin && (
        <RoleManagementDialog
          open={isRoleDialogOpen}
          onOpenChange={setIsRoleDialogOpen}
          user={row.original}
          appId={appId}
          application={application}
          isSystemAdmin={isSystemAdmin}
          queryClient={queryClient}
          toast={toast}
        />
      )}
    </>
  );
}

export function DataTableAppRBAC({ appId, application, users, isSystemAdmin, refetch, isFetching }) {
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [rowSelection, setRowSelection] = React.useState({});
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      accessorKey: "roles",
      header: "Permissions",
      cell: ({ row }) => {
        const roles = row.original.roles || [];
        
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
      cell: ({ row }) => (
        <ActionCell
          row={row}
          appId={appId}
          application={application}
          isSystemAdmin={isSystemAdmin}
          queryClient={queryClient}
          toast={toast}
        />
      ),
    },
  ], [appId, application, isSystemAdmin, queryClient, toast]);

  const table = useReactTable({
    data: users || [],
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
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <TooltipProvider>
      <div className="w-full max-w-none overflow-hidden">
        {/* Info Text */}
        <div className="mb-4 p-3 border rounded-md bg-muted/50">
          <p className="text-sm text-muted-foreground">
            View and manage permissions for users in <strong>{application?.name}</strong>. 
            Use the action menu to assign or remove application-specific permissions.
          </p>
        </div>

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
          <Table className="w-full min-w-[600px]">
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
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
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
                    No users assigned to this application.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between py-4 space-y-4 sm:space-y-0">
          <div className="flex-1 text-sm text-muted-foreground text-center sm:text-left">
            {users?.length || 0} user(s) with permissions in this application.
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
