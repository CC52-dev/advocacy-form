"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  sortingFns,
  useReactTable,
} from "@tanstack/react-table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  PlusCircle,
} from "lucide-react";
import { MultiSelect } from "@/components/ui/multi-select";
import { PhoneInput } from "@/components/ui/phone-input";
import LocationSelector from "@/components/ui/location-input";
import { parsePhoneNumber } from "react-phone-number-input";
import { Separator } from "@/components/ui/separator";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  DialogTrigger,
  DialogFooter,
  DialogClose,
  ForcedDialogContent,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTrigger,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { PermissionSelector } from "@/components/permission-selector";
import { isAdmin } from "@/lib/permissions";
import api from "@/lib/axios";

// Import location data
import countries from "@/data/countries.json";
import states from "@/data/states.json";

// Helper functions for safe data conversion
const safeString = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

const safeArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    if (value.trim() === "") return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [value];
    } catch {
      return [value];
    }
  }
  return [];
};

const safeLocationArray = (value) => {
  const arr = safeArray(value);
  // Ensure we always have exactly 2 elements for location [country, state]
  return [
    safeString(arr[0] || ""),
    safeString(arr[1] || "")
  ];
};

// Helper function to get country from phone number
const getCountryFromPhone = (phoneNumber) => {
  if (!phoneNumber) return "US"; // Default fallback
  try {
    const parsed = parsePhoneNumber(phoneNumber);
    return parsed?.country || "US";
  } catch {
    return "US"; // Fallback if parsing fails
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
    accessorKey: "firstname",
    header: "First Name",
    cell: ({ row }) => {
      const isTruncated = row.original.firstname.length > 15;
      const content = isTruncated
        ? `${row.original.firstname.substring(0, 15)}...`
        : row.original.firstname;
      return isTruncated ? (
        <>
          <div className="hidden md:block">
            <Tooltip>
              <TooltipTrigger>{content}</TooltipTrigger>
              <TooltipContent>
                <div className="whitespace-pre-line">
                  {row.original.firstname}
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger>{content}</DropdownMenuTrigger>
              <DropdownMenuContent>
                <div className="whitespace-pre-line">
                  {row.original.firstname}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      ) : (
        content
      );
    },
  },
  {
    accessorKey: "lastname",
    header: "Last Name",
    cell: ({ row }) => {
      const isTruncated = row.original.lastname.length > 15;
      const content = isTruncated
        ? `${row.original.lastname.substring(0, 15)}...`
        : row.original.lastname;
      return isTruncated ? (
        <>
          <div className="hidden md:block">
            <Tooltip>
              <TooltipTrigger>{content}</TooltipTrigger>
              <TooltipContent>
                <div className="whitespace-pre-line">
                  {row.original.lastname}
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger>{content}</DropdownMenuTrigger>
              <DropdownMenuContent>
                <div className="whitespace-pre-line">
                  {row.original.lastname}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      ) : (
        content
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const isTruncated = row.original.email.length > 20;
      const content = isTruncated
        ? `${row.original.email.substring(0, 20)}...`
        : row.original.email;
      return isTruncated ? (
        <>
          <div className="hidden md:block">
            <Tooltip>
              <TooltipTrigger>{content}</TooltipTrigger>
              <TooltipContent>
                <div className="whitespace-pre-line">{row.original.email}</div>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger>{content}</DropdownMenuTrigger>
              <DropdownMenuContent>
                <div className="whitespace-pre-line">{row.original.email}</div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      ) : (
        content
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => {
      const isTruncated = row.original.phone.length > 15;
      const content = isTruncated
        ? `${row.original.phone.substring(0, 15)}...`
        : row.original.phone;
      return isTruncated ? (
        <>
          <div className="hidden md:block">
            <Tooltip>
              <TooltipTrigger>{content}</TooltipTrigger>
              <TooltipContent>
                <div className="whitespace-pre-line">{row.original.phone}</div>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger>{content}</DropdownMenuTrigger>
              <DropdownMenuContent>
                <div className="whitespace-pre-line">{row.original.phone}</div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      ) : (
        content
      );
    },
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => {
      let location;
      try {
        location = typeof row.original.location === 'string' 
          ? JSON.parse(row.original.location) 
          : row.original.location;
      } catch (e) {
        location = [row.original.location || ''];
      }
      location = Array.isArray(location) ? location : [location || ''];
      
      const locationString = location.join(", ");
      const isTruncated = locationString.length > 20;
      const content = isTruncated
        ? `${locationString.substring(0, 20)}...`
        : locationString;
      return isTruncated ? (
        <>
          <div className="hidden md:block">
            <Tooltip>
              <TooltipTrigger>{content}</TooltipTrigger>
              <TooltipContent>
                <div className="whitespace-pre-line">
                  {location.join("\n")}
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger>{content}</DropdownMenuTrigger>
              <DropdownMenuContent>
                <div className="whitespace-pre-line">
                  {location.join("\n")}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      ) : (
        content
      );
    },
  },
  {
    accessorKey: "addr",
    header: "Address",
    cell: ({ row }) => {
      const isTruncated = row.original.addr.length > 20;
      const content = isTruncated
        ? `${row.original.addr.substring(0, 20)}...`
        : row.original.addr;
      return isTruncated ? (
        <>
          <div className="hidden md:block">
            <Tooltip>
              <TooltipTrigger>{content}</TooltipTrigger>
              <TooltipContent>
                <div className="whitespace-pre-line">{row.original.addr}</div>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger>{content}</DropdownMenuTrigger>
              <DropdownMenuContent>
                <div className="whitespace-pre-line">{row.original.addr}</div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      ) : (
        content
      );
    },
  },
  {
    accessorKey: "city",
    header: "City",
    cell: ({ row }) => {
      const isTruncated = row.original.city.length > 15;
      const content = isTruncated
        ? `${row.original.city.substring(0, 15)}...`
        : row.original.city;
      return isTruncated ? (
        <>
          <div className="hidden md:block">
            <Tooltip>
              <TooltipTrigger>{content}</TooltipTrigger>
              <TooltipContent>
                <div className="whitespace-pre-line">{row.original.city}</div>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger>{content}</DropdownMenuTrigger>
              <DropdownMenuContent>
                <div className="whitespace-pre-line">{row.original.city}</div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      ) : (
        content
      );
    },
  },
  {
    accessorKey: "zip",
    header: "ZIP",
    cell: ({ row }) => {
      const isTruncated = row.original.zip.length > 10;
      const content = isTruncated
        ? `${row.original.zip.substring(0, 10)}...`
        : row.original.zip;
      return isTruncated ? (
        <>
          <div className="hidden md:block">
            <Tooltip>
              <TooltipTrigger>{content}</TooltipTrigger>
              <TooltipContent>
                <div className="whitespace-pre-line">{row.original.zip}</div>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger>{content}</DropdownMenuTrigger>
              <DropdownMenuContent>
                <div className="whitespace-pre-line">{row.original.zip}</div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      ) : (
        content
      );
    },
  },
  {
    accessorKey: "interest",
    header: "Interests",
    filterFn: "interestFilter",
    cell: ({ row }) => {
      const interest = Array.isArray(row.original.interest) ? row.original.interest : JSON.parse(row.original.interest || '[]');
      return (
        <div className="flex whitespace-nowrap">
          <div className="hidden md:block">
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="primary">
                  {interest.length} Interests
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <div className="whitespace-pre-line">
                  {interest.map((item, i) => (
                    <div key={i}>{item}</div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Badge variant="primary">
                  {interest.length} Interests
                </Badge>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <div className="whitespace-pre-line">
                  {interest.map((item, i) => (
                    <div key={i}>{item}</div>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "roles",
    header: "Roles",
    cell: ({ row }) => {
      const roles = row.original.roles || [];
      const permissions = row.original.permissions || [];
      
      // Helper function to safely extract all permissions
      const extractAllPerms = () => {
        const allPerms = [...permissions];
        
        // Extract from roles
        roles.forEach(role => {
          let rolePerms = role.permissions;
          
          // If it's a JSON string, parse it
          if (typeof rolePerms === 'string') {
            try {
              rolePerms = JSON.parse(rolePerms);
            } catch (e) {
              return;
            }
          }
          
          // Add to allPerms if it's an array
          if (Array.isArray(rolePerms)) {
            allPerms.push(...rolePerms);
          }
        });
        
        // Remove duplicates and filter out any JSON strings
        return [...new Set(allPerms)].filter(p => typeof p === 'string' && !p.startsWith('['));
      };
      
      const allPerms = extractAllPerms();
      
      // Show admin badge if user has exact "admin" permission
      if (allPerms.includes("admin")) {
        return (
          <Badge variant="default" className="bg-red-100 text-red-800 border-red-200">
            Admin
          </Badge>
        );
      }
      
      // Show disabled badge if user has disabled permission
      const hasDisabledPermission = allPerms.includes("disabled");
      if (hasDisabledPermission) {
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
            Disabled
          </Badge>
        );
      }
      
      // Show protected badge if user has users.protected permission
      const isProtected = allPerms.includes("users.protected");
      
      // Show role badges - only the role title, no "App Admin" badge
      if (roles.length === 0) {
        return (
          <div className="flex items-center gap-1 flex-wrap">
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              User
            </Badge>
            {isProtected && (
              <Badge variant="secondary" className="text-xs">
                Protected
              </Badge>
            )}
          </div>
        );
      }
      
      return (
        <div className="flex flex-wrap gap-1">
          {roles.slice(0, 2).map((role) => (
            <Badge 
              key={role.id || role.roleTitle} 
              variant="outline" 
              className="whitespace-nowrap"
            >
              {role.roleTitle || role.name || role.id}
            </Badge>
          ))}
          {roles.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{roles.length - 2} more
            </Badge>
          )}
          {isProtected && (
            <Badge variant="secondary" className="text-xs">
              Protected
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "appliedAt",
    header: "Applied Date",
    cell: ({ row }) => {
      const date = new Date(row.original.appliedAt);
      const formattedDate = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      return (
        <div className="flex whitespace-nowrap">
          <div className="hidden md:block">
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="primary">Date</Badge>
              </TooltipTrigger>
              <TooltipContent>
                <div className="whitespace-pre-line">
                  <code className="whitespace-nowrap">{formattedDate}</code>{" "}
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Badge variant="primary">Date</Badge>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <div className="whitespace-pre-line">
                  <code className="whitespace-nowrap">{formattedDate}</code>{" "}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "acceptedAt",
    header: "Accepted Date",
    sortingFn: (rowA, rowB) => {
      const dateA = new Date(rowA.original.appliedAt);
      const dateB = new Date(rowB.original.appliedAt);
      return dateA.getTime() - dateB.getTime();
    },
    cell: ({ row }) => {
      const date = new Date(row.original.acceptedAt);
      const formattedDate = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      return <code className="whitespace-nowrap">{formattedDate}</code>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const { toast } = useToast();
      const queryClient = useQueryClient();
      const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
      const [locationSelectorKey, setLocationSelectorKey] = React.useState(0);
      
      // Get user's current roles (new structure: {id, roleTitle, permissions})
      const userRoles = row.original.roles || [];
      const initialRoles = userRoles.map((r) => ({
        roleTitle: r.roleTitle || r.name || r.id,
        permissions: r.permissions || [],
      }));
      
      // Safely convert location data
      const safeLocationData = safeLocationArray(row.original.location);
      
      // Helper function to safely extract permissions from roles and handle JSON strings
      const extractAllPermissions = (directPerms, roles) => {
        const allPerms = [...(directPerms || [])];
        
        // Extract from roles
        if (roles && Array.isArray(roles)) {
          roles.forEach(role => {
            let rolePerms = role.permissions;
            
            // If it's a JSON string, parse it
            if (typeof rolePerms === 'string') {
              try {
                rolePerms = JSON.parse(rolePerms);
              } catch (e) {
                // If parsing fails, skip this role's permissions
                return;
              }
            }
            
            // Add to allPerms if it's an array
            if (Array.isArray(rolePerms)) {
              allPerms.push(...rolePerms);
            }
          });
        }
        
        // Remove duplicates and filter out any remaining JSON strings
        return [...new Set(allPerms)].filter(p => typeof p === 'string' && !p.startsWith('['));
      };
      
      // Extract all permissions from both direct permissions and roles
      const initialPermissions = extractAllPermissions(row.original.permissions, userRoles);
      
      // Get role title from first role (or empty)
      const initialRoleTitle = userRoles.length > 0 
        ? (userRoles[0].roleTitle || userRoles[0].name || "")
        : "";

      const [editFormData, setEditFormData] = React.useState({
        firstname: safeString(row.original.firstname),
        lastname: safeString(row.original.lastname),
        email: safeString(row.original.email),
        phone: safeString(row.original.phone),
        addr: safeString(row.original.addr),
        city: safeString(row.original.city),
        zip: safeString(row.original.zip),
        interest: safeArray(row.original.interest),
        location: safeLocationData,
        roleTitle: initialRoleTitle,
        permissions: initialPermissions, // Already deduplicated in extractAllPermissions
      });

      const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);

      const updateUser = useMutation({
        mutationFn: async (userData) => {
          const response = await api.post(`/api/user/updateUser/${row.original.id}`, userData);
          return response.data;
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["allUsers"] });
          toast({
            title: "User updated successfully",
            description: "User information has been updated",
            variant: "default",
            duration: 3000,
          });
          setIsEditDialogOpen(false);
        },
        onError: (error) => {
          toast({
            title: "Error updating user",
            description: error.response?.data?.message || "An error occurred",
            variant: "destructive",
            duration: 3000,
          });
        }
      });

      const handleInputChange = (field, value) => {
        setEditFormData(prev => ({
          ...prev,
          [field]: value
        }));
      };

      const handleSubmit = () => {
        // Check if role title or permissions changed
        const currentPermissions = [...new Set(editFormData.permissions || [])].sort();
        const initialPerms = [...new Set(initialPermissions)].sort();
        const permissionsChanged = JSON.stringify(currentPermissions) !== JSON.stringify(initialPerms);
        const roleTitleChanged = editFormData.roleTitle !== initialRoleTitle;
        
        // Prepare update data
        const updateData = {
          firstname: editFormData.firstname,
          lastname: editFormData.lastname,
          phone: editFormData.phone,
          addr: editFormData.addr,
          city: editFormData.city,
          zip: editFormData.zip,
          interest: editFormData.interest,
          location: editFormData.location,
        };
        
        // If permissions changed, include roles
        // Note: We always use a single role with all permissions combined
        if (permissionsChanged || roleTitleChanged) {
          // Use existing role title if available, otherwise require one
          const roleTitle = editFormData.roleTitle?.trim() || initialRoleTitle?.trim();
          
          if (!roleTitle) {
            toast({
              title: "Role title required",
              description: "Please enter a role title when assigning permissions",
              variant: "destructive",
              duration: 3000,
            });
            return;
          }
          
          updateData.roles = [{
            roleTitle: roleTitle,
            permissions: currentPermissions,
          }];
          
          setShowConfirmDialog(true);
        } else {
          updateUser.mutate(updateData);
        }
      };

      const confirmRoleChange = () => {
        setShowConfirmDialog(false);
        const roleTitle = editFormData.roleTitle?.trim() || initialRoleTitle?.trim() || "User";
        const updateData = {
          firstname: editFormData.firstname,
          lastname: editFormData.lastname,
          phone: editFormData.phone,
          addr: editFormData.addr,
          city: editFormData.city,
          zip: editFormData.zip,
          interest: editFormData.interest,
          location: editFormData.location,
          roles: [{
            roleTitle: roleTitle,
            permissions: [...new Set(editFormData.permissions || [])],
          }],
        };
        updateUser.mutate(updateData);
      };

      // Handle dialog open/close
      const handleDialogChange = (open) => {
        setIsEditDialogOpen(open);
        if (open) {
          // Reset LocationSelector when dialog opens
          setLocationSelectorKey(prev => prev + 1);
          // Re-extract permissions in case user data has changed
          const currentPermissions = extractAllPermissions(row.original.permissions, userRoles);
          // Reset to initial values
          setEditFormData({
            firstname: safeString(row.original.firstname),
            lastname: safeString(row.original.lastname),
            email: safeString(row.original.email),
            phone: safeString(row.original.phone),
            addr: safeString(row.original.addr),
            city: safeString(row.original.city),
            zip: safeString(row.original.zip),
            interest: safeArray(row.original.interest),
            location: safeLocationData,
            roleTitle: initialRoleTitle,
            permissions: currentPermissions,
          });
        }
      };

      // Check if current user can view/edit this user
      const currentUserPermissions = useAuthStore((state) => state.permissions) || [];
      const currentUserRoles = useAuthStore((state) => state.roles) || [];
      // Combine all permissions from direct permissions and role permissions
      const allCurrentUserPerms = [
        ...currentUserPermissions,
        ...currentUserRoles.flatMap(r => r.permissions || [])
      ];
      // Check admin in both direct permissions AND role permissions
      const isCurrentUserAdmin = allCurrentUserPerms.includes("admin");
      const canViewUsers = allCurrentUserPerms.includes("users.read") || allCurrentUserPerms.includes("users.*") || isCurrentUserAdmin;
      const canEditUsers = allCurrentUserPerms.includes("users.updateinfo") || allCurrentUserPerms.includes("users.*") || isCurrentUserAdmin;
      
      const allTargetUserPerms = extractAllPermissions(row.original.permissions, row.original.roles);
      
      // Check for exact "admin" permission (not substring match)
      const targetUserIsAdmin = allTargetUserPerms.includes("admin");
      const targetUserIsProtected = allTargetUserPerms.includes("users.protected");
      
      // Check if target user is an application admin (has any app.*.admin permission)
      const targetUserIsAppAdmin = allTargetUserPerms.some(p => /^app\.[^.]+\.admin$/.test(p));
      
      // Debug logging
      if (targetUserIsAppAdmin || targetUserIsAdmin) {
        console.log('User Check:', {
          email: row.original.email,
          directPermissions: row.original.permissions,
          roles: row.original.roles,
          allTargetUserPerms,
          targetUserIsAdmin,
          targetUserIsAppAdmin,
        });
      }
      
      // Determine if current user can edit this user:
      // 1. Must have basic edit permission (users.updateinfo or admin)
      // 2. Cannot edit system admins (no one can)
      // 3. System admins can edit everyone (including app admins and protected users)
      // 4. Protected users can only be edited by system admins
      // 5. App admins CAN be edited by anyone with users.updateinfo
      const canEdit = (() => {
        if (!canEditUsers) return false; // Must have edit permission
        if (targetUserIsAdmin) return false; // No one can edit system admins
        if (isCurrentUserAdmin) return true; // System admins can edit everyone else
        if (targetUserIsProtected) return false; // Only system admins can edit protected users
        // Anyone with users.updateinfo can edit app admins and regular users
        return true;
      })();
      
      // Determine if current user can edit this user's PERMISSIONS:
      // Requires users.roles permission
      const canEditPermissions = (() => {
        if (targetUserIsAdmin) return false; // Cannot edit system admin permissions
        if (!allCurrentUserPerms.includes("users.roles") && !isCurrentUserAdmin) return false; // Must have users.roles
        if (targetUserIsProtected && !isCurrentUserAdmin) return false; // Only admins can edit protected user permissions
        // Anyone with users.roles can edit app admin permissions and regular user permissions
        return true;
      })();

      // No need to fetch roles anymore - we're using direct permission selection

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
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(row.original.id)}
              >
                Copy User ID
              </DropdownMenuItem>
              {canViewUsers && (
                <DropdownMenuItem
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  Edit User
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {canViewUsers && (
            <>
              <Dialog open={isEditDialogOpen} onOpenChange={handleDialogChange}>
                <ForcedDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogTitle>
                    Edit {row.original.firstname} {row.original.lastname}
                  </DialogTitle>
                  <DialogDescription>
                    Update user information. System admins can edit all users except other system admins. Application admins can only be edited by system admins.
                  </DialogDescription>
                  
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">First Name</label>
                      <Input
                        value={editFormData.firstname}
                        onChange={(e) => handleInputChange('firstname', e.target.value)}
                        placeholder="First Name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Last Name</label>
                      <Input
                        value={editFormData.lastname}
                        onChange={(e) => handleInputChange('lastname', e.target.value)}
                        placeholder="Last Name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        value={editFormData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Email"
                        type="email"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phone</label>
                      <PhoneInput
                        value={editFormData.phone}
                        onChange={(value) => handleInputChange('phone', value)}
                        defaultCountry={getCountryFromPhone(editFormData.phone)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Address</label>
                      <Input
                        value={editFormData.addr}
                        onChange={(e) => handleInputChange('addr', e.target.value)}
                        placeholder="Address"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">City</label>
                      <Input
                        value={editFormData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="City"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">ZIP Code</label>
                      <Input
                        value={editFormData.zip}
                        onChange={(e) => handleInputChange('zip', e.target.value)}
                        placeholder="ZIP Code"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Location</label>
                      <LocationSelector
                        value={editFormData.location}
                        onChange={(val) => handleInputChange('location', val)}
                      />
                    </div>
                    
                    <div className="col-span-2 space-y-2">
                      <label className="text-sm font-medium">Role Title</label>
                      <Input
                        value={editFormData.roleTitle || ""}
                        onChange={(e) => {
                          setEditFormData(prev => ({
                            ...prev,
                            roleTitle: e.target.value,
                          }));
                        }}
                        placeholder="e.g., Manager, Editor, Viewer"
                      />
                    </div>
                    
                    <div className="col-span-2 space-y-2">
                      <label className="text-sm font-medium">Permissions</label>
                      {!canEditPermissions && !targetUserIsAdmin && (
                        <p className="text-xs text-amber-600 mb-2">
                          You need the "Manage User Roles" permission to edit permissions.
                        </p>
                      )}
                      {targetUserIsAdmin && (
                        <p className="text-xs text-red-600 mb-2">
                          System admin permissions cannot be modified.
                        </p>
                      )}
                      <PermissionSelector
                        permissions={editFormData.permissions || []}
                        onChange={(selectedPermissions) => {
                          setEditFormData(prev => ({
                            ...prev,
                            permissions: selectedPermissions,
                          }));
                        }}
                        disabled={!canEditPermissions}
                        showWarnings={false}
                      />
                    </div>
                    
                    <div className="col-span-2 space-y-2">
                      <label className="text-sm font-medium">Interests</label>
                      <MultiSelect
                        options={[
                          "Thapo Kshetra revival (Bharat)",
                          "Vedic Worship (USA)",
                          "Virtual Knowledge Sessions (USA)",
                          "Research (USA)",
                          "Print and Publications (USA)",
                          "Bharatheeyatha Annual Event (USA)",
                          "Content Management (Global Shared Services)",
                          "Marketing (Global Shared Services)",
                          "Technology (Global Shared Services)",
                          "Charity (USA and Bharat)",
                          "Help me decide",
                        ]}
                        selected={editFormData.interest}
                        onChange={(value) => handleInputChange('interest', value)}
                        placeholder="Select Areas of Interest"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button 
                      onClick={handleSubmit}
                      disabled={updateUser.isPending || !canEdit}
                    >
                      {updateUser.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </DialogFooter>
                </ForcedDialogContent>
              </Dialog>

              {/* Confirmation Dialog for Role Changes */}
              <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You are about to modify this user's roles. This action cannot be undone. Are you sure you want to continue?
                  </AlertDialogDescription>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>
                      Cancel
                    </AlertDialogCancel>
                    <Button onClick={confirmRoleChange}>
                      Confirm
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      );
    },
  },
];
