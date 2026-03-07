"use client";

import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  UserCheck,
  CalendarCheck,
  CalendarX,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { useHasPermission } from "@/lib/permissions";
import api from "@/lib/axios";

/** @param {boolean} showAdminActions - If true, show Edit/Delete/View RSVPs. If false, only RSVP/Cancel. */
export function getEventColumns(showAdminActions = false) {
  return [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      const title = row.original.title || "";
      const isTruncated = title.length > 25;
      const content = isTruncated ? `${title.substring(0, 25)}...` : title;
      return isTruncated ? (
        <Tooltip>
          <TooltipTrigger>{content}</TooltipTrigger>
          <TooltipContent>{title}</TooltipContent>
        </Tooltip>
      ) : (
        content
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const desc = row.original.description || "";
      const isTruncated = desc.length > 40;
      const content = isTruncated ? `${desc.substring(0, 40)}...` : desc || "-";
      return isTruncated ? (
        <Tooltip>
          <TooltipTrigger>{content}</TooltipTrigger>
          <TooltipContent>{desc}</TooltipContent>
        </Tooltip>
      ) : (
        content
      );
    },
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => row.original.location || "-",
  },
  {
    accessorKey: "eventDate",
    header: "Start",
    cell: ({ row }) => {
      const date = new Date(row.original.startDate ?? row.original.eventDate);
      const isPast = date < new Date();
      return (
        <Badge variant={isPast ? "secondary" : "default"}>
          {date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Badge>
      );
    },
  },
  ...(showAdminActions
    ? [
        {
          accessorKey: "endDate",
          header: "End",
          cell: ({ row }) => {
            const end = row.original.endDate ?? row.original.eventDate;
            return (
              <span className="text-sm">
                {new Date(end).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            );
          },
        },
        {
          accessorKey: "status",
          header: "Status",
          cell: ({ row }) => {
            const end = row.original.endDate ?? row.original.eventDate;
            const isPast = new Date(end) < new Date();
            return (
              <Badge
                variant={
                  isPast
                    ? "secondary"
                    : row.original.status === "disabled"
                      ? "destructive"
                      : "default"
                }
              >
                {isPast ? "Expired" : row.original.status || "active"}
              </Badge>
            );
          },
        },
        {
          accessorKey: "rsvpCount",
          header: "RSVPs",
          cell: ({ row }) => (
            <span className="text-sm">{row.original.rsvpCount ?? 0}</span>
          ),
        },
      ]
    : []),
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const { toast } = useToast();
      const queryClient = useQueryClient();
      const event = row.original;
      const [isEditOpen, setIsEditOpen] = React.useState(false);
      const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
      const [isRsvpsOpen, setIsRsvpsOpen] = React.useState(false);
      const [rsvps, setRsvps] = React.useState([]);
      const [editForm, setEditForm] = React.useState({
        title: event.title,
        description: event.description || "",
        location: event.location || "",
        eventDate: event.eventDate
          ? new Date(event.eventDate).toISOString().slice(0, 16)
          : "",
        startDate: (event.startDate || event.eventDate)
          ? new Date(event.startDate || event.eventDate).toISOString().slice(0, 16)
          : "",
        endDate: (event.endDate || event.eventDate)
          ? new Date(event.endDate || event.eventDate).toISOString().slice(0, 16)
          : "",
        status: event.status || "active",
      });

      const canManageEvents = showAdminActions && (useHasPermission("events.create") || useHasPermission("events.update") || useHasPermission("events.delete") || useHasPermission("admin"));
      const canViewRsvps = showAdminActions && (useHasPermission("events.read") || useHasPermission("admin"));
      const userRsvped = event.userRsvped;
      const endDate = event.endDate ?? event.eventDate;
      const isPast = new Date(endDate) < new Date();

      const updateMutation = useMutation({
        mutationFn: async (data) => {
          const res = await api.post(`/api/events/updateEvent/${event.id}`, data);
          return res.data;
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["allEvents"] });
          toast({ title: "Event updated" });
          setIsEditOpen(false);
        },
        onError: (err) => {
          toast({
            title: "Error",
            description: err.response?.data?.message || "Failed to update",
            variant: "destructive",
          });
        },
      });

      const deleteMutation = useMutation({
        mutationFn: async () => {
          const res = await api.post(`/api/events/deleteEvent/${event.id}`);
          return res.data;
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["allEvents"] });
          toast({ title: "Event deleted" });
          setIsDeleteOpen(false);
        },
        onError: (err) => {
          toast({
            title: "Error",
            description: err.response?.data?.message || "Failed to delete",
            variant: "destructive",
          });
        },
      });

      const rsvpMutation = useMutation({
        mutationFn: async () => {
          const res = await api.post(`/api/events/rsvp/${event.id}`);
          return res.data;
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["allEvents"] });
          toast({ title: "RSVP confirmed" });
        },
        onError: (err) => {
          toast({
            title: "Error",
            description: err.response?.data?.message || "Failed to RSVP",
            variant: "destructive",
          });
        },
      });

      const cancelRsvpMutation = useMutation({
        mutationFn: async () => {
          const res = await api.post(`/api/events/cancelRsvp/${event.id}`);
          return res.data;
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["allEvents"] });
          toast({ title: "RSVP cancelled" });
        },
        onError: (err) => {
          toast({
            title: "Error",
            description: err.response?.data?.message || "Failed to cancel",
            variant: "destructive",
          });
        },
      });

      const fetchRsvps = async () => {
        try {
          const res = await api.post(`/api/events/getEventRsvps/${event.id}`);
          setRsvps(res.data?.message || []);
        } catch (e) {
          toast({
            title: "Error",
            description: "Failed to load RSVPs",
            variant: "destructive",
          });
        }
      };

      const exportRsvps = () => {
        const headers = ["First Name", "Last Name", "Email"];
        const rows = rsvps.map((r) => [r.firstname || "", r.lastname || "", r.email || ""]);
        const csv = [headers.join(","), ...rows.map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `rsvps-${event.title.replace(/[^a-z0-9]/gi, "-")}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      };

      return (
        <div className="flex gap-2 items-center">
          {!showAdminActions && !isPast && !userRsvped && (
            <Button
              size="sm"
              variant="default"
              onClick={() => rsvpMutation.mutate()}
              disabled={rsvpMutation.isPending}
            >
              <CalendarCheck className="h-4 w-4 mr-1" />
              Confirm
            </Button>
          )}
          {!showAdminActions && !isPast && userRsvped && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => cancelRsvpMutation.mutate()}
              disabled={cancelRsvpMutation.isPending}
            >
              <CalendarX className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          )}
          {showAdminActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              {canViewRsvps && (
                <DropdownMenuItem
                  onClick={() => {
                    setIsRsvpsOpen(true);
                    fetchRsvps();
                  }}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  View RSVPs ({event.rsvpCount ?? 0})
                </DropdownMenuItem>
              )}
              {canManageEvents && (
                <>
                  <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsDeleteOpen(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          )}

          {/* Edit Dialog */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Event</DialogTitle>
                <DialogDescription>Update event details</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, title: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, description: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={editForm.location}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, location: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Start Date & Time</label>
                  <Input
                    type="datetime-local"
                    value={editForm.startDate || editForm.eventDate}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, startDate: e.target.value, eventDate: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date & Time</label>
                  <Input
                    type="datetime-local"
                    value={editForm.endDate || editForm.eventDate}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, endDate: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, status: e.target.value }))
                    }
                  >
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    const start = editForm.startDate || editForm.eventDate;
                    const end = editForm.endDate || start;
                    if (start && end && new Date(start) >= new Date(end)) {
                      toast({ title: "Invalid dates", description: "Start date must be before end date", variant: "destructive" });
                      return;
                    }
                    updateMutation.mutate({
                      ...editForm,
                      eventDate: new Date(editForm.startDate || editForm.eventDate).toISOString(),
                      startDate: new Date(editForm.startDate || editForm.eventDate).toISOString(),
                      endDate: new Date(editForm.endDate || editForm.startDate || editForm.eventDate).toISOString(),
                      status: editForm.status,
                    });
                  }}
                  disabled={updateMutation.isPending}
                >
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation */}
          <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Event?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete &quot;{event.title}&quot; and all RSVPs.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteMutation.mutate()}
                  className="bg-destructive text-destructive-foreground"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* View RSVPs Dialog */}
          <Dialog open={isRsvpsOpen} onOpenChange={setIsRsvpsOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>RSVPs for {event.title}</DialogTitle>
                <DialogDescription>
                  {rsvps.length} people have RSVPed
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {rsvps.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No RSVPs yet</p>
                ) : (
                  rsvps.map((r) => (
                    <div
                      key={r.id}
                      className="flex justify-between items-center py-2 border-b"
                    >
                      <span className="font-medium">
                        {r.firstname} {r.lastname}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {r.email}
                      </span>
                    </div>
                  ))
                )}
              </div>
              {canViewRsvps && rsvps.length > 0 && (
                <div className="pt-4">
                  <Button variant="outline" size="sm" onClick={exportRsvps}>
                    <Download className="h-4 w-4 mr-2" />
                    Export RSVPs
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      );
    },
  },
];
}

export const columns = getEventColumns(false);
