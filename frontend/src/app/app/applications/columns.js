"use client";

import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MoreHorizontal,
  Copy,
  Pencil,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  Plus,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Info,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  ForcedDialogContent,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { useHasPermission } from "@/lib/permissions";
import { parsePermissionsDefinition } from "@/lib/parsePermissionsDefinition";
import api from "@/lib/axios";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

// Helper function to get status badge color
const getStatusBadge = (status) => {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          Active
        </Badge>
      );
    case "inactive":
      return (
        <Badge className="bg-gray-100 text-gray-800 border-gray-200">
          Inactive
        </Badge>
      );
    case "pending":
    default:
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          Pending
        </Badge>
      );
  }
};

export const columns = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const name = row.original.name || "";
      const isTruncated = name.length > 25;
      const content = isTruncated ? `${name.substring(0, 25)}...` : name;
      return isTruncated ? (
        <Tooltip>
          <TooltipTrigger className="font-medium">{content}</TooltipTrigger>
          <TooltipContent>
            <div className="whitespace-pre-line">{name}</div>
          </TooltipContent>
        </Tooltip>
      ) : (
        <span className="font-medium">{content}</span>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.original.description || "";
      const isTruncated = description.length > 40;
      const content = isTruncated
        ? `${description.substring(0, 40)}...`
        : description || "—";
      return isTruncated ? (
        <Tooltip>
          <TooltipTrigger>{content}</TooltipTrigger>
          <TooltipContent className="max-w-sm">
            <div className="whitespace-pre-line">{description}</div>
          </TooltipContent>
        </Tooltip>
      ) : (
        content
      );
    },
  },
  {
    accessorKey: "url",
    header: "URL",
    cell: ({ row }) => {
      const url = row.original.url || "";
      if (!url) return "—";
      const isTruncated = url.length > 30;
      const content = isTruncated ? `${url.substring(0, 30)}...` : url;
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {isTruncated ? (
            <Tooltip>
              <TooltipTrigger>{content}</TooltipTrigger>
              <TooltipContent>
                <div className="whitespace-pre-line">{url}</div>
              </TooltipContent>
            </Tooltip>
          ) : (
            content
          )}
        </a>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => getStatusBadge(row.original.status),
  },
  {
    accessorKey: "createdBy",
    header: "Created By",
    cell: ({ row }) => {
      const creator = `${row.original.creatorFirstname || ""} ${
        row.original.creatorLastname || ""
      }`.trim();
      return creator || row.original.createdBy || "—";
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      if (!row.original.createdAt) return "—";
      const date = new Date(row.original.createdAt);
      return (
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline">
              {date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            {date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const { toast } = useToast();
      const queryClient = useQueryClient();
      const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
      const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
      const [showApiKey, setShowApiKey] = React.useState(false);
      
      // Parse existing permissions definition (handles JSON strings from API/DB)
      const initialParsed = parsePermissionsDefinition(
        row.original.rolesDefinition || row.original.permissionsDefinition
      );

      const [editFormData, setEditFormData] = React.useState({
        name: row.original.name || "",
        description: row.original.description || "",
        url: row.original.url || "",
        status: row.original.status || "pending",
        permissionsDefinition: {
          categories: initialParsed.categories,
          permissions: initialParsed.permissions,
        },
      });
      
      const [newCategoryName, setNewCategoryName] = React.useState("");
      const [newPermission, setNewPermission] = React.useState({
        code: "",
        name: "",
        description: "",
        category: "",
        constraints: {
          exclusive: false,
          onlyOneInCategory: false,
          prerequisites: [],
        },
      });

      // Reset form data when dialog opens
      React.useEffect(() => {
        if (isEditDialogOpen) {
          const parsed = parsePermissionsDefinition(
            row.original.rolesDefinition || row.original.permissionsDefinition
          );
          setEditFormData({
            name: row.original.name || "",
            description: row.original.description || "",
            url: row.original.url || "",
            status: row.original.status || "pending",
            permissionsDefinition: {
              categories: parsed.categories,
              permissions: parsed.permissions,
            },
          });
          setNewCategoryName("");
          setNewPermission({
            code: "",
            name: "",
            description: "",
            category: "",
            constraints: {
              exclusive: false,
              onlyOneInCategory: false,
              prerequisites: [],
            },
          });
        }
      }, [isEditDialogOpen, row.original]);
      
      // Category management functions
      const addCategory = () => {
        const trimmed = newCategoryName.trim();
        if (!trimmed) {
          toast({ title: "Error", description: "Category name is required", variant: "destructive", duration: 3000 });
          return;
        }
        const sanitized = sanitizeCode(trimmed);
        if (editFormData.permissionsDefinition.categories?.some(c => c.code === sanitized)) {
          toast({ title: "Error", description: "A category with this name already exists", variant: "destructive", duration: 3000 });
          return;
        }
        setEditFormData((prev) => ({
          ...prev,
          permissionsDefinition: {
            ...prev.permissionsDefinition,
            categories: [...(prev.permissionsDefinition.categories || []), { code: sanitized, name: trimmed }],
          },
        }));
        setNewCategoryName("");
      };

      const removeCategory = (code) => {
        setEditFormData((prev) => ({
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
        setEditFormData((prev) => {
          const cats = [...(prev.permissionsDefinition.categories || [])];
          [cats[index - 1], cats[index]] = [cats[index], cats[index - 1]];
          return {
            ...prev,
            permissionsDefinition: { ...prev.permissionsDefinition, categories: cats },
          };
        });
      };

      const moveCategoryDown = (index) => {
        setEditFormData((prev) => {
          const cats = [...(prev.permissionsDefinition.categories || [])];
          if (index >= cats.length - 1) return prev;
          [cats[index], cats[index + 1]] = [cats[index + 1], cats[index]];
          return {
            ...prev,
            permissionsDefinition: { ...prev.permissionsDefinition, categories: cats },
          };
        });
      };

      // Permission management functions
      const addPermission = () => {
        const appPrefix = getAppPrefix(editFormData.name);
        const sanitizedCode = sanitizeCode(newPermission.code);
        const fullCode = appPrefix + sanitizedCode;
        
        if (!editFormData.name.trim()) {
          toast({ title: "Error", description: "Please enter an application name first", variant: "destructive", duration: 3000 });
          return;
        }
        if (!sanitizedCode) {
          toast({ title: "Error", description: "Permission code is required", variant: "destructive", duration: 3000 });
          return;
        }
        if (!newPermission.name.trim()) {
          toast({ title: "Error", description: "Permission name is required", variant: "destructive", duration: 3000 });
          return;
        }
        if (sanitizedCode === "admin") {
          toast({ title: "Error", description: "Cannot define 'admin' permission - it is auto-created", variant: "destructive", duration: 3000 });
          return;
        }
        const exists = editFormData.permissionsDefinition.permissions.some(
          (p) => p.code.toLowerCase() === fullCode.toLowerCase()
        );
        if (exists) {
          toast({ title: "Error", description: "A permission with this code already exists", variant: "destructive", duration: 3000 });
          return;
        }
        
        setEditFormData((prev) => ({
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
        setNewPermission({
          code: "",
          name: "",
          description: "",
          category: "",
          constraints: { exclusive: false, onlyOneInCategory: false, prerequisites: [] },
        });
      };

      const removePermission = (code) => {
        setEditFormData((prev) => ({
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

      // Permission checks
      const canUpdate =
        useHasPermission("applications.update") || useHasPermission("dev");
      const canDelete =
        useHasPermission("applications.delete") || useHasPermission("dev");

      const updateApplication = useMutation({
        mutationFn: async (data) => {
          const response = await api.post(
            `/api/applications/updateApplication/${row.original.id}`,
            data
          );
          return response.data;
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["allApplications"] });
          toast({
            title: "Application updated",
            description: "The application has been updated successfully.",
            duration: 3000,
          });
          setIsEditDialogOpen(false);
        },
        onError: (error) => {
          toast({
            title: "Error",
            description:
              error.response?.data?.message || "Failed to update application",
            variant: "destructive",
            duration: 3000,
          });
        },
      });

      const deleteApplication = useMutation({
        mutationFn: async () => {
          const response = await api.post(
            `/api/applications/deleteApplication/${row.original.id}`
          );
          return response.data;
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["allApplications"] });
          toast({
            title: "Application deleted",
            description: "The application has been deleted successfully.",
            duration: 3000,
          });
          setIsDeleteDialogOpen(false);
        },
        onError: (error) => {
          toast({
            title: "Error",
            description:
              error.response?.data?.message || "Failed to delete application",
            variant: "destructive",
            duration: 3000,
          });
        },
      });

      const regenerateApiKey = useMutation({
        mutationFn: async () => {
          const response = await api.post(
            `/api/applications/regenerateApiKey/${row.original.id}`
          );
          return response.data;
        },
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: ["allApplications"] });
          toast({
            title: "API Key Regenerated",
            description: "New API key has been generated. Copy it now!",
            duration: 5000,
          });
          // Copy new API key to clipboard
          if (data.apiKey) {
            navigator.clipboard.writeText(data.apiKey);
            toast({
              title: "Copied!",
              description: "New API key copied to clipboard.",
              duration: 3000,
            });
          }
        },
        onError: (error) => {
          toast({
            title: "Error",
            description:
              error.response?.data?.message || "Failed to regenerate API key",
            variant: "destructive",
            duration: 3000,
          });
        },
      });

      const handleCopyApiKey = () => {
        if (row.original.apiKey) {
          navigator.clipboard.writeText(row.original.apiKey);
          toast({
            title: "Copied!",
            description: "API key copied to clipboard.",
            duration: 2000,
          });
        }
      };

      const handleSubmit = () => {
        const stored = parsePermissionsDefinition(
          row.original.rolesDefinition || row.original.permissionsDefinition
        );
        const submittingCount = editFormData.permissionsDefinition?.permissions?.length ?? 0;
        if (stored.permissions.length > 0 && submittingCount === 0) {
          toast({
            title: "Cannot save",
            description:
              "Permissions did not load correctly. Refresh the page before saving so existing permissions are not cleared.",
            variant: "destructive",
            duration: 5000,
          });
          return;
        }
        updateApplication.mutate(editFormData);
      };

      return (
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.id)}>
                <Copy className="mr-2 h-4 w-4" />
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyApiKey}>
                <Copy className="mr-2 h-4 w-4" />
                Copy API Key
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {canUpdate && (
                <>
                  <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => regenerateApiKey.mutate()}
                    disabled={regenerateApiKey.isPending}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate API Key
                  </DropdownMenuItem>
                </>
              )}
              {canDelete && (
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <ForcedDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogTitle>Edit Application</DialogTitle>
              <DialogDescription>
                Update the application details, categories, and permissions below.
              </DialogDescription>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Name *</Label>
                  <Input
                    value={editFormData.name}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Application Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Description</Label>
                  <Textarea
                    value={editFormData.description}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
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
                    <Label className="text-sm font-medium">URL</Label>
                    <Input
                      value={editFormData.url}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          url: e.target.value,
                        }))
                      }
                      placeholder="https://example.com"
                      type="url"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Status</Label>
                    <Select
                      value={editFormData.status}
                      onValueChange={(value) =>
                        setEditFormData((prev) => ({ ...prev, status: value }))
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

                <div className="space-y-2">
                  <Label className="text-sm font-medium">API Key</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={
                        showApiKey
                          ? row.original.apiKey || ""
                          : "••••••••••••••••••••"
                      }
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleCopyApiKey}>
                      <Copy className="h-4 w-4" />
                    </Button>
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
                          {(editFormData.permissionsDefinition.categories?.length || 0) + 1} categories
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
                        {editFormData.permissionsDefinition.categories?.map((cat, index) => (
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
                                disabled={index === (editFormData.permissionsDefinition.categories?.length || 0) - 1}
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
                          <Button variant="outline" size="sm" onClick={addCategory}>
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
                          {editFormData.permissionsDefinition.permissions.length + 1} permissions
                        </Badge>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            Define permissions for your application. The &quot;admin&quot; permission is automatically created.
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {/* Auto-created admin permission notice */}
                        <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded-md">
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">{getAppPrefix(editFormData.name)}admin</Badge>
                          <span className="text-sm text-muted-foreground">Auto-created (Application Admin - can manage RBAC)</span>
                        </div>

                        {/* Existing permissions */}
                        {editFormData.permissionsDefinition.permissions.map((perm, index) => (
                          <div key={index} className="flex flex-col gap-1 p-2 border rounded-md">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{perm.code}</Badge>
                              <span className="text-sm font-medium">{perm.name}</span>
                              {perm.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {editFormData.permissionsDefinition.categories?.find(c => c.code === perm.category)?.name || perm.category}
                                </Badge>
                              )}
                              {perm.constraints?.exclusive && (
                                <Badge variant="destructive" className="text-xs">Exclusive</Badge>
                              )}
                              {perm.constraints?.onlyOneInCategory && (
                                <Badge variant="outline" className="text-xs">One per category</Badge>
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
                                  <Badge key={i} variant="outline" className="text-xs">{prereq}</Badge>
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
                                {getAppPrefix(editFormData.name) || "app_name."}
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
                                disabled={!editFormData.name.trim()}
                              />
                            </div>
                            {!editFormData.name.trim() && (
                              <p className="text-xs text-amber-600 mt-1">Enter application name first</p>
                            )}
                          </div>
                          
                          <div>
                            <Label className="text-xs">Display Name *</Label>
                            <Input
                              value={newPermission.name}
                              onChange={(e) =>
                                setNewPermission((prev) => ({ ...prev, name: e.target.value }))
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
                                setNewPermission((prev) => ({ ...prev, description: e.target.value }))
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
                                {editFormData.permissionsDefinition.categories?.map((cat) => (
                                  <SelectItem key={cat.code} value={cat.code}>
                                    {cat.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* Constraints */}
                          <div className="space-y-2">
                            <Label className="text-xs">Constraints</Label>
                            <div className="flex flex-wrap gap-4">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="edit-exclusive"
                                  checked={newPermission.constraints.exclusive}
                                  onCheckedChange={(checked) =>
                                    setNewPermission((prev) => ({
                                      ...prev,
                                      constraints: { ...prev.constraints, exclusive: checked },
                                    }))
                                  }
                                />
                                <label htmlFor="edit-exclusive" className="text-xs">Exclusive</label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="edit-onlyOneInCategory"
                                  checked={newPermission.constraints.onlyOneInCategory}
                                  onCheckedChange={(checked) =>
                                    setNewPermission((prev) => ({
                                      ...prev,
                                      constraints: { ...prev.constraints, onlyOneInCategory: checked },
                                    }))
                                  }
                                />
                                <label htmlFor="edit-onlyOneInCategory" className="text-xs">One per category</label>
                              </div>
                            </div>
                          </div>
                          
                          {/* Prerequisites selection */}
                          {editFormData.permissionsDefinition.permissions.length > 0 && (
                            <div>
                              <Label className="text-xs">Prerequisites (optional)</Label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {editFormData.permissionsDefinition.permissions.map((perm) => (
                                  <div key={perm.code} className="flex items-center space-x-1">
                                    <Checkbox
                                      id={`edit-prereq-${perm.code}`}
                                      checked={newPermission.constraints.prerequisites?.includes(perm.code)}
                                      onCheckedChange={(checked) =>
                                        setNewPermission((prev) => ({
                                          ...prev,
                                          constraints: {
                                            ...prev.constraints,
                                            prerequisites: checked
                                              ? [...(prev.constraints.prerequisites || []), perm.code]
                                              : prev.constraints.prerequisites?.filter(p => p !== perm.code) || [],
                                          },
                                        }))
                                      }
                                    />
                                    <label htmlFor={`edit-prereq-${perm.code}`} className="text-xs">{perm.name}</label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <Button variant="outline" size="sm" onClick={addPermission} className="w-full">
                            <Plus className="h-4 w-4 mr-1" />
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
                  onClick={handleSubmit}
                  disabled={updateApplication.isPending}
                >
                  {updateApplication.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </ForcedDialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogTitle>Delete Application</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{row.original.name}"? This
                action cannot be undone and will invalidate the API key.
              </AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button
                  variant="destructive"
                  onClick={() => deleteApplication.mutate()}
                  disabled={deleteApplication.isPending}
                >
                  {deleteApplication.isPending ? "Deleting..." : "Delete"}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    },
  },
];
