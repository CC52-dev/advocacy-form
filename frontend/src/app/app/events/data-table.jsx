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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
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
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { getEventColumns } from "./columns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

export function DataTableEvents({ canCreateEvents = false, showAdminActions = false }) {
  const [sorting, setSorting] = React.useState([]);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [rowSelection, setRowSelection] = React.useState({});
  const queryClient = useQueryClient();

  const { toast } = useToast();
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["allEvents"],
    queryFn: async () => {
      const response = await api.post("/api/events/getAllEvents");
      return response.data;
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  const columns = React.useMemo(
    () => getEventColumns(showAdminActions),
    [showAdminActions]
  );

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

  const [createForm, setCreateForm] = React.useState({
    title: "",
    description: "",
    location: "",
    eventDate: "",
    startDate: "",
    endDate: "",
    status: "active",
  });

  const validateEventDates = (formData, isCreate = false) => {
    const startDate = formData.startDate || formData.eventDate;
    const endDate = formData.endDate || startDate;
    if (!startDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    if (start >= end) return "Start date must be before end date";
    if (isCreate && start < now) return "Start date must be in the future";
    if (isCreate && end < now) return "End date must be in the future";
    return null;
  };

  const createMutation = useMutation({
    mutationFn: async (formData) => {
      const startDate = formData.startDate || formData.eventDate;
      const endDate = formData.endDate || startDate;
      const res = await api.post("/api/events/createEvent", {
        ...formData,
        eventDate: new Date(formData.eventDate || startDate).toISOString(),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        status: formData.status || "active",
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allEvents"] });
      toast({ title: "Event created" });
      setCreateOpen(false);
      setCreateForm({ title: "", description: "", location: "", eventDate: "", startDate: "", endDate: "", status: "active" });
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to create event",
        variant: "destructive",
      });
    },
  });

  if (error) {
    return (
      <div className="text-destructive">
        Error loading events: {error.message}
      </div>
    );
  }

  if (isLoading && isFetching) {
    return (
      <div className="w-full max-w-none overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center items-start py-4 space-y-4 sm:space-y-0 sm:space-x-4">
          <Skeleton className="h-10 w-full sm:max-w-sm" />
          <Skeleton className="h-10 w-full sm:w-[140px]" />
        </div>
        <div className="rounded-md border w-full overflow-x-auto bg-white dark:bg-gray-900 p-2">
          <div className="w-full min-w-[600px]">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, rowIndex) => (
                <div key={`skeleton-row-${rowIndex}`} className="flex space-x-4">
                  <Skeleton className="h-6 w-[150px]" />
                  <Skeleton className="h-6 w-[100px]" />
                  <Skeleton className="h-6 w-[120px]" />
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
        {canCreateEvents && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        )}
        <Input
          placeholder="Filter by title..."
          value={table.getColumn("title")?.getFilterValue() ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="w-full sm:max-w-sm"
        />
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
              .map((column) => (
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
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border w-full overflow-x-auto bg-white dark:bg-gray-900 p-2">
        <Table className="w-full min-w-[600px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "whitespace-nowrap px-2 sm:px-4",
                      header.column.id === "actions" &&
                        "sticky right-0 bg-white dark:bg-gray-900 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.1)] z-10"
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
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "whitespace-nowrap px-2 sm:px-4",
                        cell.column.id === "actions" &&
                          "sticky right-0 bg-white dark:bg-gray-900 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.1)] z-10"
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center whitespace-nowrap px-2 sm:px-4"
                >
                  No events found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between py-4 space-y-4 sm:space-y-0">
        <div className="flex-1 text-sm text-muted-foreground text-center sm:text-left">
          {table.getFilteredRowModel().rows.length} event(s)
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
            {table.getPageCount() || 1}
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

      {/* Create Event Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Event</DialogTitle>
            <DialogDescription>Add a new event</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={createForm.title}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="Event title"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Event description"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Location</label>
              <Input
                value={createForm.location}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, location: e.target.value }))
                }
                placeholder="Event location"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Start Date & Time</label>
              <Input
                type="datetime-local"
                min={new Date().toISOString().slice(0, 16)}
                value={createForm.startDate || createForm.eventDate}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, startDate: e.target.value, eventDate: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">End Date & Time</label>
              <Input
                type="datetime-local"
                min={createForm.startDate || createForm.eventDate || new Date().toISOString().slice(0, 16)}
                value={createForm.endDate || createForm.startDate || createForm.eventDate}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, endDate: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={createForm.status}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, status: e.target.value }))
                }
              >
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const err = validateEventDates(createForm, true);
                if (err) {
                  toast({ title: "Invalid dates", description: err, variant: "destructive" });
                  return;
                }
                createMutation.mutate(createForm);
              }}
              disabled={
                createMutation.isPending ||
                !createForm.title ||
                !(createForm.startDate || createForm.eventDate)
              }
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
