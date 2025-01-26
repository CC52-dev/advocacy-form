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


export function DataTableApplicants() {
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [filterValue, setFilterValue] = React.useState("");
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["applicants"],
    queryFn: async () => {
      const response = await axios.post("/api/applicants/getAllApplicants");
      return response.data;
    },
    staleTime: 60000,
    cacheTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });



  const table = useReactTable({
    data: data?.message,
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

    filterFns: {
      interestFilter: (row, columnId, filterValues) => {
        if (!filterValues?.length) return true;
        const rowInterests = row.getValue(columnId);
        return filterValues.some((filter) => rowInterests.includes(filter));
      },
    },
  });

  const interestColumn = table.getColumn("interest");
  const selectedValues = new Set(interestColumn?.getFilterValue() ?? []);

  const options = [
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
  ];

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(filterValue.toLowerCase())
  );
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (isLoading && isFetching){
    return <Skeleton className="h-[70vh] w-full bg-gray-300" />
} 
  

  return (
    
    <div className="w-full">
      <div className="flex md:items-center items-start py-4 flex-col md:flex-row">
        <Input
          placeholder="Filter emails..."
          value={table.getColumn("email")?.getFilterValue() ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        {interestColumn && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-10 border-dashed ml-2"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Interest
                {selectedValues?.size > 0 && (
                  <>
                    <Separator orientation="vertical" className="mx-2 h-4" />
                    <Badge
                      variant="secondary"
                      className="rounded-sm px-1 font-normal lg:hidden"
                    >
                      {selectedValues.size}
                    </Badge>
                    <div className="hidden space-x-1 lg:flex">
                      {selectedValues.size > 2 ? (
                        <Badge
                          variant="secondary"
                          className="rounded-sm px-1 font-normal"
                        >
                          {selectedValues.size} selected
                        </Badge>
                      ) : (
                        Array.from(selectedValues).map((value) => (
                          <Badge
                            variant="secondary"
                            key={value}
                            className="rounded-sm px-1 font-normal"
                          >
                            {value}
                          </Badge>
                        ))
                      )}
                    </div>
                  </>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="Search interests..."
                  value={filterValue}
                  onValueChange={setFilterValue}
                />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {filteredOptions.map((option) => {
                      const isSelected = selectedValues.has(option);
                      return (
                        <CommandItem
                          key={option}
                          onSelect={() => {
                            const filterValues = Array.from(selectedValues);
                            if (isSelected) {
                              const newFilterValues = filterValues.filter(
                                (value) => value !== option
                              );
                              interestColumn?.setFilterValue(
                                newFilterValues.length
                                  ? newFilterValues
                                  : undefined
                              );
                            } else {
                              interestColumn?.setFilterValue([
                                ...filterValues,
                                option,
                              ]);
                            }
                          }}
                        >
                          <div
                            className={cn(
                              "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "opacity-50 [&_svg]:invisible"
                            )}
                          >
                            <Check className="h-4 w-4" />
                          </div>
                          <span>{option}</span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                  {selectedValues.size > 0 && (
                    <>
                      <CommandSeparator />
                      <CommandGroup>
                        <CommandItem
                          onSelect={() =>
                            interestColumn?.setFilterValue(undefined)
                          }
                          className="justify-center text-center"
                        >
                          Clear filters
                        </CommandItem>
                      </CommandGroup>
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
        <Select
          onValueChange={(value) => {
            if (value === "oldest") {
              table.getColumn("appliedAt").toggleSorting(true);
            } else if (value === "newest") {
              table.getColumn("appliedAt").toggleSorting(false);
            }
          }}
          defaultValue="oldest"
        >
          <SelectTrigger className="w-[140px] mr-auto ml-2 border-dashed">
            <SelectValue placeholder="Sort Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <Button
            className="border-dashed ml-2"
            size="sm"
            onClick={() => {
              table.getColumn("location")?.toggleVisibility();
              table.getColumn("addr")?.toggleVisibility();
              table.getColumn("city")?.toggleVisibility();
              table.getColumn("zip")?.toggleVisibility();
            }}
          >
            Toggle Location
          </Button>

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
      <div className="rounded-md border">
        <Table>
          <TableHeader className="">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="">
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
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
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
    </div>
  );
}
