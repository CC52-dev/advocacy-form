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
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  Trash2,
  Info,
  GripVertical,
  RefreshCw,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import api from "@/lib/axios";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { columns } from "./columns";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useHasPermission } from "@/lib/permissions";
import { cn } from "@/lib/utils";

// Default empty permission template
const emptyPermission = {
  code: "",
  name: "",
  description: "",
  category: "", // Empty string means "default" category
  constraints: {
    exclusive: false,
    onlyOneInCategory: false,
    prerequisites: [],
  },
};

// Sanitize code: lowercase, replace spaces with underscores, remove special chars
const sanitizeCode = (code) => {
  return code
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_.]/g, "");
};

// Generate application prefix from name
const getAppPrefix = (name) => {
  if (!name) return "";
  return sanitizeCode(name) + ".";
};

export function DataTableApplications() {
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [newAppData, setNewAppData] = React.useState({
    name: "",
    description: "",
    url: "",
    status: "pending",
    permissionsDefinition: { permissions: [], categories: [] },
  });
  const [newPermission, setNewPermission] = React.useState({ ...emptyPermission });
  const [newCategoryName, setNewCategoryName] = React.useState("");
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Permission check
  const canCreate =
    useHasPermission("applications.create") || useHasPermission("dev");

  // Category management functions
  const addCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    const sanitized = sanitizeCode(trimmed);
    if (newAppData.permissionsDefinition.categories?.some(c => c.code === sanitized)) {
      toast({
        title: "Error",
        description: "A category with this name already exists",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    setNewAppData((prev) => ({
      ...prev,
      permissionsDefinition: {
        ...prev.permissionsDefinition,
        categories: [...(prev.permissionsDefinition.categories || []), { code: sanitized, name: trimmed }],
      },
    }));
    setNewCategoryName("");
  };

  const removeCategory = (code) => {
    // Reset permissions that use this category to default
    setNewAppData((prev) => ({
      ...prev,
      permissionsDefinition: {
        ...prev.permissionsDefinition,
        categories: prev.permissionsDefinition.categories?.filter(c => c.code !== code) || [],
        permissions: prev.permissionsDefinition.permissions.map(p => 
          p.category === code ? { ...p, category: "" } : p
        ),
      },
    }));
  };

  const moveCategoryUp = (index) => {
    if (index <= 0) return;
    setNewAppData((prev) => {
      const cats = [...(prev.permissionsDefinition.categories || [])];
      [cats[index - 1], cats[index]] = [cats[index], cats[index - 1]];
      return {
        ...prev,
        permissionsDefinition: { ...prev.permissionsDefinition, categories: cats },
      };
    });
  };

  const moveCategoryDown = (index) => {
    setNewAppData((prev) => {
      const cats = [...(prev.permissionsDefinition.categories || [])];
      if (index >= cats.length - 1) return prev;
      [cats[index], cats[index + 1]] = [cats[index + 1], cats[index]];
      return {
        ...prev,
        permissionsDefinition: { ...prev.permissionsDefinition, categories: cats },
      };
    });
  };

  // Add a permission to the definition
  const addPermission = () => {
    const appPrefix = getAppPrefix(newAppData.name);
    const sanitizedCode = sanitizeCode(newPermission.code);
    const fullCode = appPrefix + sanitizedCode;
    
    // Validation
    if (!newAppData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter an application name first",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    if (!sanitizedCode) {
      toast({
        title: "Error",
        description: "Permission code is required",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    if (sanitizedCode.length < 2) {
      toast({
        title: "Error",
        description: "Permission code must be at least 2 characters",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    if (!newPermission.name.trim()) {
      toast({
        title: "Error",
        description: "Permission name is required",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    if (newPermission.name.trim().length < 2) {
      toast({
        title: "Error",
        description: "Permission name must be at least 2 characters",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    if (sanitizedCode === "admin") {
      toast({
        title: "Error",
        description: "Cannot define 'admin' permission - it is auto-created for Application Admins",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    const exists = newAppData.permissionsDefinition.permissions.some(
      (p) => p.code.toLowerCase() === fullCode.toLowerCase()
    );
    if (exists) {
      toast({
        title: "Error",
        description: "A permission with this code already exists",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    // Validate prerequisites reference existing permissions
    const invalidPrereqs = newPermission.constraints.prerequisites.filter(
      prereq => !newAppData.permissionsDefinition.permissions.some(p => p.code === prereq)
    );
    if (invalidPrereqs.length > 0) {
      toast({
        title: "Error",
        description: `Invalid prerequisites: ${invalidPrereqs.join(', ')}`,
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    // Validate onlyOneInCategory requires a category
    if (newPermission.constraints.onlyOneInCategory && !newPermission.category) {
      toast({
        title: "Error",
        description: "'One per category' constraint requires a category to be selected",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    setNewAppData((prev) => ({
      ...prev,
      permissionsDefinition: {
        ...prev.permissionsDefinition,
        permissions: [...prev.permissionsDefinition.permissions, { 
          ...newPermission, 
          code: fullCode,
          name: newPermission.name.trim(),
          description: newPermission.description.trim(),
        }],
      },
    }));
    setNewPermission({ ...emptyPermission });
  };

  // Remove a permission from the definition
  const removePermission = (code) => {
    // Also remove this permission from any prerequisites
    setNewAppData((prev) => ({
      ...prev,
      permissionsDefinition: {
        ...prev.permissionsDefinition,
        permissions: prev.permissionsDefinition.permissions
          .filter((p) => p.code !== code)
          .map(p => ({
            ...p,
            constraints: {
              ...p.constraints,
              prerequisites: p.constraints?.prerequisites?.filter(prereq => prereq !== code) || [],
            },
          })),
      },
    }));
  };
  
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["allApplications"],
    queryFn: async () => {
      const response = await api.post("/api/applications/getAllApplications");
      return response.data;
    },
    staleTime: 60000,
    cacheTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  const createApplication = useMutation({
    mutationFn: async (appData) => {
      const response = await api.post("/api/applications/createApplication", appData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["allApplications"] });
      queryClient.invalidateQueries({ queryKey: ["myApplications"] });
      toast({
        title: "Application created",
        description: "The application has been created successfully. You are now the application admin. API key copied to clipboard!",
        duration: 5000,
      });
      // Copy API key to clipboard
      if (data.apiKey) {
        navigator.clipboard.writeText(data.apiKey);
      }
      setIsCreateDialogOpen(false);
      setNewAppData({ name: "", description: "", url: "", status: "pending", permissionsDefinition: { permissions: [], categories: [] } });
      setNewPermission({ ...emptyPermission });
      setNewCategoryName("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create application",
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  const table = useReactTable({
    data: data?.message || [],
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

  const handleCreateSubmit = () => {
    if (!newAppData.name.trim()) {
      toast({
        title: "Error",
        description: "Application name is required",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    createApplication.mutate(newAppData);
  };

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (isLoading && isFetching) {
    return (
      <div className="w-full max-w-none overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center items-start py-4 space-y-4 sm:space-y-0 sm:space-x-4">
          <Skeleton className="h-10 w-full sm:max-w-sm" />
          <Skeleton className="h-10 w-full sm:w-[140px]" />
        </div>
        <div className="rounded-md border w-full overflow-x-auto bg-white dark:bg-gray-900 p-2">
          <div className="w-full min-w-[800px]">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, rowIndex) => (
                <div key={`skeleton-row-${rowIndex}`} className="flex space-x-4">
                  {columns.map((column, colIndex) => (
                    <Skeleton
                      key={`skeleton-col-${rowIndex}-${colIndex}`}
                      className="h-6 w-[100px] whitespace-nowrap"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center items-start py-4 space-y-4 sm:space-y-0 sm:space-x-4">
        <Input
          placeholder="Filter by name..."
          value={table.getColumn("name")?.getFilterValue() ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="w-full sm:max-w-sm"
        />
        <Select
          onValueChange={(value) => {
            if (value === "all") {
              table.getColumn("status")?.setFilterValue(undefined);
            } else {
              table.getColumn("status")?.setFilterValue(value);
            }
          }}
          defaultValue="all"
        >
          <SelectTrigger className="w-full sm:w-[140px] border-dashed">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="w-full sm:w-auto h-10"
        >
          <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
        </Button>

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

        {canCreate && (
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Application
          </Button>
        )}
      </div>
      <div className="rounded-md border w-full overflow-x-auto bg-white dark:bg-gray-900 p-2">
        <Table className="w-full min-w-[800px]">
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
                  No applications found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between py-4 space-y-4 sm:space-y-0">
        <div className="flex-1 text-sm text-muted-foreground text-center sm:text-left">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[1, 10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight />
            </Button>
          </div>
        </div>
      </div>

      {/* Create Application Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogTitle>Create New Application</DialogTitle>
          <DialogDescription>
            Create a new external application. An API key will be generated automatically and you will be assigned as the application admin.
          </DialogDescription>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={newAppData.name}
                onChange={(e) =>
                  setNewAppData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="Application Name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newAppData.description}
                onChange={(e) =>
                  setNewAppData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Application description..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">URL</label>
                <Input
                  value={newAppData.url}
                  onChange={(e) =>
                    setNewAppData((prev) => ({
                      ...prev,
                      url: e.target.value,
                    }))
                  }
                  placeholder="https://example.com"
                  type="url"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={newAppData.status}
                  onValueChange={(value) =>
                    setNewAppData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Category Manager Section */}
            <Accordion type="single" collapsible>
              <AccordionItem value="categories">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <span>Permission Categories</span>
                    <Badge variant="secondary">
                      {(newAppData.permissionsDefinition.categories?.length || 0) + 1} categories
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {/* Default category */}
                    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="outline">default</Badge>
                      <span className="text-sm text-muted-foreground">Default Category (always available)</span>
                    </div>
                    
                    {/* Custom categories */}
                    {newAppData.permissionsDefinition.categories?.map((cat, index) => (
                      <div key={cat.code} className="flex items-center gap-2 p-2 border rounded-md">
                        <div className="flex flex-col">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0"
                            onClick={() => moveCategoryUp(index)}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0"
                            onClick={() => moveCategoryDown(index)}
                            disabled={index === (newAppData.permissionsDefinition.categories?.length || 0) - 1}
                          >
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </div>
                        <Badge variant="outline">{cat.code}</Badge>
                        <span className="text-sm">{cat.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-auto h-6 w-6"
                          onClick={() => removeCategory(cat.code)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    
                    {/* Add new category */}
                    <div className="flex items-center gap-2">
                      <Input
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="New category name..."
                        className="h-8 flex-1"
                        onKeyDown={(e) => e.key === "Enter" && addCategory()}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addCategory}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Permissions Definition Section */}
            <Accordion type="single" collapsible defaultValue="permissions">
              <AccordionItem value="permissions">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <span>Application Permissions</span>
                    <Badge variant="secondary">
                      {newAppData.permissionsDefinition.permissions.length + 1} permissions
                    </Badge>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        Define permissions for your application. The &quot;admin&quot; permission is automatically created for Application Admins.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {/* Auto-created admin permission notice */}
                    <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded-md">
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">{getAppPrefix(newAppData.name)}admin</Badge>
                      <span className="text-sm text-muted-foreground">Auto-created (Application Admin - can manage RBAC)</span>
                    </div>

                    {/* Existing permissions */}
                    {newAppData.permissionsDefinition.permissions.map((perm, index) => (
                      <div key={index} className="flex flex-col gap-1 p-2 border rounded-md">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{perm.code}</Badge>
                          <span className="text-sm font-medium">{perm.name}</span>
                          {perm.category && (
                            <Badge variant="secondary" className="text-xs">
                              {newAppData.permissionsDefinition.categories?.find(c => c.code === perm.category)?.name || perm.category}
                            </Badge>
                          )}
                          {perm.constraints?.exclusive && (
                            <Badge variant="destructive" className="text-xs">
                              Exclusive
                            </Badge>
                          )}
                          {perm.constraints?.onlyOneInCategory && (
                            <Badge variant="outline" className="text-xs">
                              One per category
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="ml-auto h-6 w-6"
                            onClick={() => removePermission(perm.code)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        {perm.description && (
                          <span className="text-xs text-muted-foreground ml-1">{perm.description}</span>
                        )}
                        {perm.constraints?.prerequisites?.length > 0 && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground ml-1">
                            <span>Requires:</span>
                            {perm.constraints.prerequisites.map((prereq, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {prereq}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Add new permission form */}
                    <div className="space-y-3 p-3 border border-dashed rounded-md">
                      <p className="text-sm font-medium">Add New Permission</p>
                      
                      {/* Code with application prefix */}
                      <div>
                        <Label className="text-xs">Permission Code *</Label>
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-3 h-8 text-sm text-muted-foreground bg-muted border border-r-0 rounded-l-md">
                            {getAppPrefix(newAppData.name) || "app_name."}
                          </span>
                          <Input
                            value={newPermission.code}
                            onChange={(e) =>
                              setNewPermission((prev) => ({
                                ...prev,
                                code: sanitizeCode(e.target.value),
                              }))
                            }
                            placeholder="e.g., content_edit"
                            className="h-8 rounded-l-none"
                            disabled={!newAppData.name.trim()}
                          />
                        </div>
                        {!newAppData.name.trim() && (
                          <p className="text-xs text-amber-600 mt-1">Enter application name first</p>
                        )}
                        {newPermission.code && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Full code: <code className="bg-muted px-1 rounded">{getAppPrefix(newAppData.name)}{sanitizeCode(newPermission.code)}</code>
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label className="text-xs">Display Name *</Label>
                        <Input
                          value={newPermission.name}
                          onChange={(e) =>
                            setNewPermission((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="e.g., Edit Content"
                          className="h-8"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs">Description (optional)</Label>
                        <Input
                          value={newPermission.description}
                          onChange={(e) =>
                            setNewPermission((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          placeholder="e.g., Allows editing content pages"
                          className="h-8"
                        />
                      </div>
                      
                      {/* Category dropdown */}
                      <div>
                        <Label className="text-xs">Category</Label>
                        <Select
                          value={newPermission.category || "default"}
                          onValueChange={(value) =>
                            setNewPermission((prev) => ({
                              ...prev,
                              category: value === "default" ? "" : value,
                            }))
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">
                              <span className="text-muted-foreground">Default (no category)</span>
                            </SelectItem>
                            {newAppData.permissionsDefinition.categories?.map((cat) => (
                              <SelectItem key={cat.code} value={cat.code}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {(newAppData.permissionsDefinition.categories?.length || 0) === 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Add categories in the &quot;Permission Categories&quot; section above
                          </p>
                        )}
                      </div>
                      {/* Prerequisites selection */}
                      {newAppData.permissionsDefinition.permissions.length > 0 && (
                        <div>
                          <Label className="text-xs">Prerequisites (optional)</Label>
                          <div className="flex flex-wrap gap-2 mt-1 p-2 border rounded-md bg-muted/30">
                            {newAppData.permissionsDefinition.permissions.map((perm) => (
                              <div key={perm.code} className="flex items-center space-x-1">
                                <Checkbox
                                  id={`prereq-${perm.code}`}
                                  checked={newPermission.constraints.prerequisites.includes(perm.code)}
                                  onCheckedChange={(checked) =>
                                    setNewPermission((prev) => ({
                                      ...prev,
                                      constraints: {
                                        ...prev.constraints,
                                        prerequisites: checked
                                          ? [...prev.constraints.prerequisites, perm.code]
                                          : prev.constraints.prerequisites.filter(p => p !== perm.code),
                                      },
                                    }))
                                  }
                                />
                                <Label htmlFor={`prereq-${perm.code}`} className="text-xs">
                                  {perm.code}
                                </Label>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            User must have these permissions before this one can be assigned
                          </p>
                        </div>
                      )}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="exclusive"
                            checked={newPermission.constraints.exclusive}
                            onCheckedChange={(checked) =>
                              setNewPermission((prev) => ({
                                ...prev,
                                constraints: {
                                  ...prev.constraints,
                                  exclusive: checked,
                                },
                              }))
                            }
                          />
                          <Label htmlFor="exclusive" className="text-xs">
                            Exclusive (user can only have this permission)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="onlyOneInCategory"
                            checked={newPermission.constraints.onlyOneInCategory}
                            onCheckedChange={(checked) =>
                              setNewPermission((prev) => ({
                                ...prev,
                                constraints: {
                                  ...prev.constraints,
                                  onlyOneInCategory: checked,
                                },
                              }))
                            }
                          />
                          <Label htmlFor="onlyOneInCategory" className="text-xs">
                            One per category
                          </Label>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addPermission}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Permission
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleCreateSubmit}
              disabled={createApplication.isPending}
            >
              {createApplication.isPending ? "Creating..." : "Create Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
