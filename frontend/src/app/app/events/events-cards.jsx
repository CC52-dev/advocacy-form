"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, CalendarX, MapPin, Search, RefreshCw } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function EventCountdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = React.useState(null);
  const target = new Date(targetDate);

  React.useEffect(() => {
    const update = () => {
      const now = new Date();
      if (target <= now) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, past: true });
        return;
      }
      const diff = target - now;
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        past: false,
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!timeLeft) return <span className="text-sm text-muted-foreground">—</span>;
  if (timeLeft.past) return <span className="text-sm text-muted-foreground">Event ended</span>;

  return (
    <div className="flex gap-2 flex-wrap">
      {timeLeft.days > 0 && (
        <Badge variant="secondary">{timeLeft.days}d</Badge>
      )}
      <Badge variant="secondary">{String(timeLeft.hours).padStart(2, "0")}h</Badge>
      <Badge variant="secondary">{String(timeLeft.minutes).padStart(2, "0")}m</Badge>
      <Badge variant="secondary">{String(timeLeft.seconds).padStart(2, "0")}s</Badge>
    </div>
  );
}

function EventCard({ event, onRsvp, onCancelRsvp }) {
  const startDate = event.startDate ?? event.eventDate;
  const endDate = event.endDate ?? event.eventDate;
  const isPast = event.isPast ?? new Date(endDate) < new Date();
  const isUpcoming = event.isUpcoming ?? new Date(startDate) >= new Date();

  return (
    <Card className={cn("overflow-hidden", isPast && "opacity-70")}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg">{event.title}</CardTitle>
          <Badge
            variant={
              isPast
                ? "secondary"
                : event.status === "disabled"
                  ? "destructive"
                  : "default"
            }
          >
            {isPast ? "Expired" : event.status || "active"}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">{event.description || "No description"}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarCheck className="h-4 w-4 shrink-0" />
          <span>
            {new Date(startDate).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
            {startDate !== endDate && (
              <> – {new Date(endDate).toLocaleDateString("en-US", { hour: "2-digit", minute: "2-digit" })}</>
            )}
          </span>
        </div>
        {event.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{event.location}</span>
          </div>
        )}
        {isUpcoming && !isPast && (
          <div className="pt-2">
            <span className="text-xs text-muted-foreground block mb-1">Starts in:</span>
            <EventCountdown targetDate={startDate} />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-2">
        <span className="text-sm text-muted-foreground">{event.rsvpCount ?? 0} RSVPs</span>
        {!isPast && event.status !== "disabled" && (
          event.userRsvped ? (
            <Button variant="ghost" size="sm" onClick={() => onCancelRsvp(event)}>
              <CalendarX className="h-4 w-4 mr-1" />
              Cancel RSVP
            </Button>
          ) : (
            <Button size="sm" onClick={() => onRsvp(event)}>
              <CalendarCheck className="h-4 w-4 mr-1" />
              Confirm
            </Button>
          )
        )}
        {event.userRsvped && (
          <Badge variant="outline" className="ml-2">Confirmed</Badge>
        )}
      </CardFooter>
    </Card>
  );
}

export function EventsCardsView() {
  const [search, setSearch] = React.useState("");
  const [myEventsOnly, setMyEventsOnly] = React.useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["allEvents", search, myEventsOnly],
    queryFn: async () => {
      const response = await api.post("/api/events/getAllEvents", {
        search: search || undefined,
        myEvents: myEventsOnly,
      });
      return response.data;
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const rsvpMutation = useMutation({
    mutationFn: async (event) => {
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
    mutationFn: async (event) => {
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

  const events = data?.message || [];
  const upcomingAll = events.filter((e) => e.isUpcoming && !e.isPast);
  const confirmed = upcomingAll.filter((e) => e.userRsvped);
  const upcoming = upcomingAll.filter((e) => !e.userRsvped);
  const past = events.filter((e) => e.isPast);

  if (error) {
    return (
      <div className="text-destructive py-4">
        Error loading events: {error.message}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events by title, description, location, status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={myEventsOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setMyEventsOnly(!myEventsOnly)}
          >
            My Events
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {myEventsOnly && confirmed.length === 0 && upcoming.length === 0 && past.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center">You haven&apos;t RSVPed to any events yet.</p>
      ) : (
        <>
          {!myEventsOnly && upcoming.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onRsvp={(e) => rsvpMutation.mutate(e)}
                    onCancelRsvp={(e) => cancelRsvpMutation.mutate(e)}
                  />
                ))}
              </div>
            </section>
          )}

          {confirmed.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Your Confirmed Events</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {confirmed.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onRsvp={(e) => rsvpMutation.mutate(e)}
                    onCancelRsvp={(e) => cancelRsvpMutation.mutate(e)}
                  />
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Past Events</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {past.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onRsvp={() => {}}
                    onCancelRsvp={() => {}}
                  />
                ))}
              </div>
            </section>
          )}

          {!myEventsOnly && upcoming.length === 0 && confirmed.length === 0 && past.length === 0 && (
            <p className="text-muted-foreground py-8 text-center">No events found.</p>
          )}
        </>
      )}
    </div>
  );
}
