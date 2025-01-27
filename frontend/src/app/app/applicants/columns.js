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
import axios from "axios";

import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
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
        const isTruncated = row.original.location.join(", ").length > 20;
        const content = isTruncated
          ? `${row.original.location.join(", ").substring(0, 20)}...`
          : row.original.location.join(", ");
        return isTruncated ? (
          <>
            <div className="hidden md:block">
              <Tooltip>
                <TooltipTrigger>{content}</TooltipTrigger>
                <TooltipContent>
                  <div className="whitespace-pre-line">
                    {row.original.location.join("\n")}
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger>{content}</DropdownMenuTrigger>
                <DropdownMenuContent>
                  <div className="whitespace-pre-line">
                    {row.original.location.join("\n")}
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
        return (
          <div className="flex whitespace-nowrap">
            <div className="hidden md:block">
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="primary">
                    {row.original.interest.length} Interests
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="whitespace-pre-line">
                    {row.original.interest.join("\n")}
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Badge variant="primary">
                    {row.original.interest.length} Interests
                  </Badge>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <div className="whitespace-pre-line">
                    {row.original.interest.join("\n")}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "appliedAt",
      header: "Applied Date",
      sortingFn: (rowA, rowB) => {
        const dateA = new Date(rowA.original.appliedAt);
        const dateB = new Date(rowB.original.appliedAt);
        return dateA.getTime() - dateB.getTime();
      },
      cell: ({ row }) => {
        const date = new Date(row.original.appliedAt);
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
      id: "approve/deny",
      cell: ({ row }) => {
        const [intrest, setIntrest] = React.useState(row.original.interest);
        const queryClient = useQueryClient();
        const [isOpenDialog, setIsOpenDialog] = React.useState(false);
        const [isOpenAlert, setIsOpenAlert] = React.useState(false);
        const approve = useMutation({
          mutationFn: async (applicantId) => {
            const response = await axios.post(
              `/api/applicants/approveApplicant/${applicantId}`,
              {
                interests: intrest,
              }
            );
            return response.data;
          },
          mutationKey: ["approveApplicant"],
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["applicants"] });
          },
        });
        const deny = useMutation({
          mutationFn: async (applicantId) => {
            const response = await axios.post(
              `/api/applicants/denyApplicant/${applicantId}`
            );
            return response.data;
          },
          mutationKey: ["denyApplicant"],
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["applicants"] });
          },
        });
        return (
          <div className="flex  gap-2 min-w-fit ">
            <Dialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
              <ForcedDialogContent>
                <DialogTitle>
                  Approve {row.original.firstname} {row.original.lastname}
                </DialogTitle>
                <DialogDescription>
                  Select the interests you would like to approve for{" "}
                  {row.original.firstname} {row.original.lastname}.
                </DialogDescription>
                <MultiSelect
                  options={[
                    "Thapo Kshetra revival (Bharat)",
                    "Vedic Worship (USA)",
                    "Virtual Knowledge Sessions",
                    "Research (USA)",
                    "Print and Publications (USA)",
                    "Bharatheeyatha Annual Event (USA)",
                    "Content Management (Global Shared Services)",
                    "Marketing (Global Shared Services)",
                    "Technology (Global Shared Services)",
                    "Charity (USA and Bharat)",
                    "Will participate in the near future",
                  ]}
                  selected={intrest}
                  onChange={setIntrest}
                  placeholder="Select Areas of Interest"
                  className="w-full h-24 overflow-y-auto"
                />{" "}
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" className="">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    className=" "
                    onClick={() => {
                      approve.mutate(row.original.id);
                      setIsOpenDialog(false);
                    }}
                  >
                    Confirm
                  </Button>
                </DialogFooter>
              </ForcedDialogContent>
              <DialogTrigger asChild>
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-green-400 border-border text-white"
                >
                  <Check />
                </Button>
              </DialogTrigger>
            </Dialog>
            <AlertDialog open={isOpenAlert} onOpenChange={setIsOpenAlert}>
              <AlertDialogContent>
                <AlertDialogTitle>
                  Deny {row.original.firstname} {row.original.lastname}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to deny {row.original.firstname}{" "}
                  {row.original.lastname}?
                </AlertDialogDescription>
                <AlertDialogFooter>
                  <AlertDialogCancel asChild>
                    <Button variant="outline">Cancel</Button>
                  </AlertDialogCancel>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      deny.mutate(row.original.id);
                      setIsOpenAlert(false);
                    }}
                  >
                    Confirm
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
  
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="">
                  <X />
                </Button>
              </AlertDialogTrigger>
            </AlertDialog>
          </div>
        );
      },
    },
    // {
    //   id: "actions",
    //   cell: ({ row }) => {
    //     return (
    //       <DropdownMenu>
    //         <DropdownMenuTrigger asChild>
    //           <Button variant="ghost" className="h-8 w-8 p-0">
    //             <span className="sr-only">Open menu</span>
    //             <MoreHorizontal className="h-4 w-4" />
    //           </Button>
    //         </DropdownMenuTrigger>
    //         <DropdownMenuContent align="end">
    //           <DropdownMenuLabel>Actions</DropdownMenuLabel>
    //           <DropdownMenuItem
    //             onClick={() => navigator.clipboard.writeText(row.original.id)}
    //           >
    //             Copy Applicant ID
    //           </DropdownMenuItem>
    //         </DropdownMenuContent>
    //       </DropdownMenu>
    //     );
    //   },
    // },
  ];