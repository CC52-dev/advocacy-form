"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
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
} from "lucide-react";
import { MultiSelect } from "@/components/ui/multi-select";

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
import { DataTableFilter } from "@/components/data-table-filter";

import { useIsMobile } from "@/hooks/use-mobile";
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
    cell: ({ row }) => {
      return (
        <div className="flex flex-wrap gap-2 min-w-fit">
          {row.original.interest.length > 2 ? (
            <div className="flex items-center gap-2 whitespace-nowrap">
              <div className="hidden md:block">
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="primary" key="first">
                      {row.original.interest[0].length > 15
                        ? `${row.original.interest[0].substring(0, 15)}...`
                        : row.original.interest[0]}
                    </Badge>
                    <Badge variant="primary" key="more">
                      +{row.original.interest.length - 1} more
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
                    <Badge variant="primary" key="first">
                      {row.original.interest[0].length > 15
                        ? `${row.original.interest[0].substring(0, 15)}...`
                        : row.original.interest[0]}
                    </Badge>
                    <Badge variant="primary" key="more">
                      +{row.original.interest.length - 1} more
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
          ) : (
            row.original.interest.map((interest, index) => {
              const isTruncated = interest.length > 30;
              const content = isTruncated
                ? `${interest.substring(0, 30)}...`
                : interest;
              return isTruncated ? (
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                <div key={index}>
                  <div className="hidden md:block">
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="primary">{content}</Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="whitespace-pre-line">{interest}</div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="md:hidden">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Badge variant="primary">{content}</Badge>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <div className="whitespace-pre-line">{interest}</div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ) : (
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                <Badge variant="primary" key={index}>
                  {content}
                </Badge>
              );
            })
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "appliedAt",
    header: "Applied Date",
    cell: ({ row }) => {
      const date = new Date(row.original.applied_at);
      const formattedDate = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      return <span className="whitespace-nowrap">{formattedDate}</span>;
    },
  },
  {
    id: "approve/deny",
    cell: ({ row }) => {
      const [intrest, setIntrest] = React.useState(row.original.interest);
      return (
        <div className="flex  gap-2 min-w-fit ">
          <Dialog
          //   onOpenChange=
          //   {(open) => {
          //     if (!open) {
          //       setIntrest(row.original.interest)
          //     }
          //   }}
          >
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
                <Button className=" ">Confirm</Button>
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
          <Button variant="destructive" size="sm" className="">
            <X />
          </Button>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
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
              Copy Applicant ID
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

const data = [
  {
    id: "2eb7fea3-3391-4a3e-a7d2-1394edbf9484",
    firstname: "Balaji",
    lastname: "Yogesh",
    phone: "+16128105922",
    email: "balaji.yogesh@gmail.com",
    location: ["United States", "Wisconsin"],
    addr: "w239n2377 Hawks Meadow CT",
    city: "Waukesha ",
    zip: "53072",
    interest: [
      "Content Management (Global Shared Services)",
      "Vedic Worship (USA)",
    ],
    over16: true,
    applied_at: "2025-01-19 19:42:24.598268",
    accepted_at: "null",
    type: "applicant",
  },
  {
    id: "3eb7fea3-3391-4a3e-a7d2-1394edbf9485",
    firstname: "John",
    lastname: "Doe",
    phone: "+16128105923",
    email: "john.doe@gmail.com",
    location: ["United States", "Minnesota"],
    addr: "123 Main Street",
    city: "Minneapolis",
    zip: "55401",
    interest: ["Temple Services"],
    over16: true,
    applied_at: "2025-01-18 15:30:24.598268",
    accepted_at: "2025-01-19 10:00:00.000000",
    type: "applicant",
  },
  {
    id: "4eb7fea3-3391-4a3e-a7d2-1394edbf9486",
    firstname: "Jane",
    lastname: "Smith",
    phone: "+16128105924",
    email: "jane.smith@gmail.com",
    location: ["United States", "Illinois"],
    addr: "456 Oak Avenue",
    city: "Chicago",
    zip: "60601",
    interest: ["Community Events"],
    over16: true,
    applied_at: "2025-01-17 09:15:24.598268",
    accepted_at: null,
    type: "applicant",
  },
];

export function DataTableApplicants() {
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [rowSelection, setRowSelection] = React.useState({});
  const table = useReactTable({
    data,
    columns,
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
  //   const [intrest, setIntrest] = React.useState([]);
  return (
    <div className="h-[100vh] w-[100%]">
      {/* <MultiSelect
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
                      />            */}
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter emails..."
          value={table.getColumn("email")?.getFilterValue() ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        {table.getColumn("interest") && (
          <DataTableFilter
            column={table.getColumn("interest")}
            title="Interest"
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
          />
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
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
      <div className="rounded-md border  ">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
                {[10, 20, 30, 40, 50].map((pageSize) => (
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
