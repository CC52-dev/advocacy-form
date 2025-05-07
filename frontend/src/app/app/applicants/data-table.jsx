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

import { cn } from "@/lib/utils";

import api from "@/lib/axios";

import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { columns } from "./columns";
import { useRouter } from "next/navigation";

export function DataTableApplicants() {
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [rowSelection, setRowSelection] = React.useState({});
  const router = useRouter();
  const [filterValue, setFilterValue] = React.useState("");
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["applicants"],
    queryFn: async () => {
      const response = await api.post("/api/applicants/getAllApplicants");
      return response.data;
    },
    staleTime: 60000,
    cacheTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  const tableData = data?.message || [];

  const table = useReactTable({
    data: tableData,
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

  if (isLoading || isFetching) {
    return (
      <div className="w-full">
        <div className="flex flex-col md:flex-row md:items-center items-start py-4 space-y-4 md:space-y-0 md:space-x-4">
          <Skeleton className="h-10 w-full md:max-w-sm" />
          <Skeleton className="h-10 w-[140px]" />
          <Skeleton className="h-10 w-[140px]" />
        </div>
        <div className="rounded-md border">
          <div className="p-4">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, rowIndex) => (
                <div key={`skeleton-row-${rowIndex}`} className="flex space-x-4">
                  {columns.map((column, colIndex) => (
                    <Skeleton 
                      key={`skeleton-col-${rowIndex}-${colIndex}`} 
                      className="h-6 w-[100px]" 
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

  if (error) {
    return (
      <div className="w-full p-4 text-center text-destructive">
        Error loading data. Please try refreshing the page.
      </div>
    );
  }



  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center items-start py-4 space-y-4 md:space-y-0 md:space-x-4">
        <Input
          placeholder="Filter emails..."
          value={table.getColumn("email")?.getFilterValue() ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="w-full md:max-w-sm"
        />
        {interestColumn && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full md:w-auto h-10 border-dashed"
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
                            <Check className={cn("h-4 w-4")} />
                          </div>
                          {option}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
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
          <SelectTrigger className="w-full md:w-[140px] border-dashed">
            <SelectValue placeholder="Sort Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full md:w-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <Button
            className="w-full md:w-auto border-dashed"
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
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id}
                    className={cn(
                      "whitespace-nowrap",
                      header.id === "select" && "w-[50px]",
                      header.id === "firstname" && "w-[150px]",
                      header.id === "lastname" && "w-[150px]",
                      header.id === "email" && "w-[250px]",
                      header.id === "phone" && "w-[150px]",
                      header.id === "location" && "w-[200px]",
                      header.id === "addr" && "w-[200px]",
                      header.id === "city" && "w-[150px]",
                      header.id === "zip" && "w-[100px]",
                      header.id === "interest" && "w-[200px]",
                      header.id === "appliedAt" && "w-[180px]",
                      header.id === "approve/deny" && "w-[150px]"
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
      <div className="flex flex-col md:flex-row items-center justify-between py-4 space-y-4 md:space-y-0">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 lg:space-x-8">
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
