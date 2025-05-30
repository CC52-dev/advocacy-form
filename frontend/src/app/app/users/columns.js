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
import api from "@/lib/axios";

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
    accessorKey: "type",
    header: "User Type",
    cell: ({ row }) => {
      const type = row.original.type;
      const getTypeColor = (type) => {
        switch (type) {
          case "admin":
            return "bg-red-100 text-red-800 border-red-200";
          case "adminviewer":
            return "bg-blue-100 text-blue-800 border-blue-200";
          case "user":
            return "bg-green-100 text-green-800 border-green-200";
          case "disabled":
            return "bg-gray-100 text-gray-800 border-gray-200";
          default:
            return "bg-gray-100 text-gray-800 border-gray-200";
        }
      };
      
      const getTypeLabel = (type) => {
        switch (type) {
          case "admin":
            return "Admin";
          case "adminviewer":
            return "Admin Viewer";
          case "user":
            return "User";
          case "disabled":
            return "Disabled";
          default:
            return type;
        }
      };

      return (
        <Badge 
          variant="outline" 
          className={`${getTypeColor(type)} whitespace-nowrap`}
        >
          {getTypeLabel(type)}
        </Badge>
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
      const [editFormData, setEditFormData] = React.useState({
        firstname: row.original.firstname || "",
        lastname: row.original.lastname || "",
        email: row.original.email || "",
        phone: row.original.phone || "",
        addr: row.original.addr || "",
        city: row.original.city || "",
        zip: row.original.zip || "",
        type: row.original.type || "",
        interest: Array.isArray(row.original.interest) ? row.original.interest : JSON.parse(row.original.interest || '[]'),
        location: Array.isArray(row.original.location) ? row.original.location : JSON.parse(row.original.location || '[]'),
      });

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
        updateUser.mutate(editFormData);
      };

      // Check if current user can edit this user
      const currentUserType = useAuthStore((state) => state.type);
      const canEdit = currentUserType === "admin" && row.original.type !== "admin";

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
              {canEdit && (
                <DropdownMenuItem
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  Edit User
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {canEdit && (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <ForcedDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogTitle>
                  Edit {row.original.firstname} {row.original.lastname}
                </DialogTitle>
                <DialogDescription>
                  Update user information. Only admins can edit users, disabled users, and admin viewers.
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
                    <Input
                      value={editFormData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Phone"
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
                    <label className="text-sm font-medium">User Type</label>
                    <Select
                      value={editFormData.type}
                      onValueChange={(value) => handleInputChange('type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select user type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="adminviewer">Admin Viewer</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
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
                    disabled={updateUser.isPending}
                  >
                    {updateUser.isPending ? "Updating..." : "Update User"}
                  </Button>
                </DialogFooter>
              </ForcedDialogContent>
            </Dialog>
          )}
        </div>
      );
    },
  },
];
