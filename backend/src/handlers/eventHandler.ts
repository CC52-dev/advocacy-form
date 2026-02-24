import { randomUUID } from "crypto";
import db from "../db/db.js";
import { eq, and, desc, inArray } from "drizzle-orm";
import { eventsTable, eventRsvpsTable, usersTable } from "../db/schema.js";
import type { Response } from "express";
import type { SessionValidationResult } from "../lib/session.js";
import { hasPermission } from "../lib/permissions.js";

type EventCreateData = {
  title: string;
  description?: string;
  location?: string;
  eventDate: string;
  startDate?: string;
  endDate?: string;
  status?: "active" | "disabled";
};

type EventUpdateData = Partial<EventCreateData>;

export async function getAllEvents(token: string, res: Response, opts?: { search?: string; myEvents?: boolean }) {
  try {
    const { validateSessionToken } = await import("../lib/session.js");
    const sessionValidationResult: SessionValidationResult =
      await validateSessionToken(token);
    if (!sessionValidationResult.session || !sessionValidationResult.user) {
      res.status(401).json({ message: "Token is Invalid Or Expired" });
      return;
    }

    const userId = sessionValidationResult.user.id;
    const isAdmin = await hasPermission(userId, "events.read") || await hasPermission(userId, "admin");

    let events;
    if (isAdmin) {
      events = await db
        .select()
        .from(eventsTable)
        .orderBy(desc(eventsTable.eventDate));
    } else {
      if (opts?.myEvents) {
        const myEventIds = await db
          .select({ eventId: eventRsvpsTable.eventId })
          .from(eventRsvpsTable)
          .where(eq(eventRsvpsTable.userId, userId));
        const ids = myEventIds.map((r) => r.eventId);
        if (ids.length === 0) {
          events = [];
        } else {
          events = await db
            .select()
            .from(eventsTable)
            .where(and(eq(eventsTable.status, "active"), inArray(eventsTable.id, ids)))
            .orderBy(desc(eventsTable.eventDate));
        }
      } else {
        events = await db
          .select()
          .from(eventsTable)
          .where(eq(eventsTable.status, "active"))
          .orderBy(desc(eventsTable.eventDate));
      }
    }

    if (opts?.search && opts.search.trim()) {
      const search = `%${opts.search.trim().toLowerCase()}%`;
      events = events.filter(
        (e) =>
          (e.title?.toLowerCase().includes(opts!.search!.toLowerCase())) ||
          (e.description?.toLowerCase().includes(opts!.search!.toLowerCase())) ||
          (e.location?.toLowerCase().includes(opts!.search!.toLowerCase())) ||
          (e.status?.toLowerCase().includes(opts!.search!.toLowerCase()))
      );
    }

    const eventsWithRsvpCount = await Promise.all(
      events.map(async (event) => {
        const rsvps = await db
          .select()
          .from(eventRsvpsTable)
          .where(eq(eventRsvpsTable.eventId, event.id));
        const startDate = event.startDate ?? event.eventDate;
        const endDate = event.endDate ?? event.eventDate;
        const now = new Date();
        const isUpcoming = new Date(startDate) >= now;
        const isPast = new Date(endDate) < now;
        return {
          ...event,
          rsvpCount: rsvps.length,
          userRsvped: rsvps.some((r) => r.userId === userId),
          isUpcoming,
          isPast,
        };
      })
    );

    res.status(200).json({ message: eventsWithRsvpCount });
  } catch (error) {
    res.status(400).json({ message: "An error occurred" });
    console.error(error);
  }
}

export async function createEvent(token: string, data: EventCreateData, res: Response) {
  try {
    const { validateSessionToken } = await import("../lib/session.js");
    const sessionValidationResult: SessionValidationResult =
      await validateSessionToken(token);
    if (!sessionValidationResult.session || !sessionValidationResult.user) {
      res.status(401).json({ message: "Token is Invalid Or Expired" });
      return;
    }

    const userId = sessionValidationResult.user.id;
    if (!(await hasPermission(userId, "events.create"))) {
      res.status(403).json({ message: "Insufficient permissions to create events" });
      return;
    }

    const eventId = randomUUID();
    const startDate = data.startDate ? new Date(data.startDate) : new Date(data.eventDate);
    const endDate = data.endDate ? new Date(data.endDate) : startDate;
    await db.insert(eventsTable).values({
      id: eventId,
      title: data.title,
      description: data.description || null,
      location: data.location || null,
      eventDate: new Date(data.eventDate),
      startDate,
      endDate,
      status: (data.status as "active" | "disabled") || "active",
      createdBy: userId,
    } as any);

    const [insertedEvent] = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.id, eventId))
      .limit(1);

    if (!insertedEvent) {
      res.status(500).json({ message: "Failed to create event" });
      return;
    }

    res.status(201).json({ message: insertedEvent });
  } catch (error) {
    res.status(400).json({ message: "An error occurred" });
    console.error(error);
  }
}

export async function updateEvent(token: string, eventId: string, data: EventUpdateData, res: Response) {
  try {
    const { validateSessionToken } = await import("../lib/session.js");
    const sessionValidationResult: SessionValidationResult =
      await validateSessionToken(token);
    if (!sessionValidationResult.session || !sessionValidationResult.user) {
      res.status(401).json({ message: "Token is Invalid Or Expired" });
      return;
    }

    const userId = sessionValidationResult.user.id;
    if (!(await hasPermission(userId, "events.update"))) {
      res.status(403).json({ message: "Insufficient permissions to update events" });
      return;
    }

    const updatePayload: Record<string, unknown> = {};
    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.location !== undefined) updatePayload.location = data.location;
    if (data.eventDate !== undefined) updatePayload.eventDate = new Date(data.eventDate);
    if (data.startDate !== undefined) updatePayload.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updatePayload.endDate = new Date(data.endDate);
    if (data.status !== undefined) updatePayload.status = data.status;

    if (Object.keys(updatePayload).length === 0) {
      res.status(400).json({ message: "No valid fields to update" });
      return;
    }

    await db
      .update(eventsTable)
      .set(updatePayload as any)
      .where(eq(eventsTable.id, eventId));

    const [updated] = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.id, eventId))
      .limit(1);

    if (!updated) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    res.status(200).json({ message: updated });
  } catch (error) {
    res.status(400).json({ message: "An error occurred" });
    console.error(error);
  }
}

export async function deleteEvent(token: string, eventId: string, res: Response) {
  try {
    const { validateSessionToken } = await import("../lib/session.js");
    const sessionValidationResult: SessionValidationResult =
      await validateSessionToken(token);
    if (!sessionValidationResult.session || !sessionValidationResult.user) {
      res.status(401).json({ message: "Token is Invalid Or Expired" });
      return;
    }

    const userId = sessionValidationResult.user.id;
    if (!(await hasPermission(userId, "events.delete"))) {
      res.status(403).json({ message: "Insufficient permissions to delete events" });
      return;
    }

    await db.delete(eventsTable).where(eq(eventsTable.id, eventId));

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "An error occurred" });
    console.error(error);
  }
}

export async function rsvpEvent(token: string, eventId: string, res: Response) {
  try {
    const { validateSessionToken } = await import("../lib/session.js");
    const sessionValidationResult: SessionValidationResult =
      await validateSessionToken(token);
    if (!sessionValidationResult.session || !sessionValidationResult.user) {
      res.status(401).json({ message: "Token is Invalid Or Expired" });
      return;
    }

    const userId = sessionValidationResult.user.id;

    const [event] = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.id, eventId))
      .limit(1);

    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    const endDate = event.endDate ?? event.eventDate;
    if (new Date(endDate) < new Date()) {
      res.status(400).json({ message: "Cannot RSVP for past events" });
      return;
    }
    if (event.status === "disabled") {
      res.status(400).json({ message: "Cannot RSVP for disabled events" });
      return;
    }

    try {
      await db.insert(eventRsvpsTable).values({
        eventId,
        userId,
      });
    } catch (dupErr: any) {
      if (dupErr?.code === "ER_DUP_ENTRY" || dupErr?.errno === 1062) {
        res.status(200).json({ message: "Already RSVPed" });
        return;
      }
      throw dupErr;
    }

    res.status(200).json({ message: "RSVP successful" });
  } catch (error) {
    res.status(400).json({ message: "An error occurred" });
    console.error(error);
  }
}

export async function cancelRsvp(token: string, eventId: string, res: Response) {
  try {
    const { validateSessionToken } = await import("../lib/session.js");
    const sessionValidationResult: SessionValidationResult =
      await validateSessionToken(token);
    if (!sessionValidationResult.session || !sessionValidationResult.user) {
      res.status(401).json({ message: "Token is Invalid Or Expired" });
      return;
    }

    const userId = sessionValidationResult.user.id;

    await db
      .delete(eventRsvpsTable)
      .where(and(eq(eventRsvpsTable.eventId, eventId), eq(eventRsvpsTable.userId, userId)));

    res.status(200).json({ message: "RSVP cancelled" });
  } catch (error) {
    res.status(400).json({ message: "An error occurred" });
    console.error(error);
  }
}

export async function getEventRsvps(token: string, eventId: string, res: Response) {
  try {
    const { validateSessionToken } = await import("../lib/session.js");
    const sessionValidationResult: SessionValidationResult =
      await validateSessionToken(token);
    if (!sessionValidationResult.session || !sessionValidationResult.user) {
      res.status(401).json({ message: "Token is Invalid Or Expired" });
      return;
    }

    const userId = sessionValidationResult.user.id;
    if (!(await hasPermission(userId, "events.read"))) {
      res.status(403).json({ message: "Insufficient permissions to view RSVPs" });
      return;
    }

    const rsvps = await db
      .select({
        id: eventRsvpsTable.id,
        userId: eventRsvpsTable.userId,
        createdAt: eventRsvpsTable.createdAt,
        firstname: usersTable.firstname,
        lastname: usersTable.lastname,
        email: usersTable.email,
      })
      .from(eventRsvpsTable)
      .innerJoin(usersTable, eq(eventRsvpsTable.userId, usersTable.id))
      .where(eq(eventRsvpsTable.eventId, eventId));

    res.status(200).json({ message: rsvps });
  } catch (error) {
    res.status(400).json({ message: "An error occurred" });
    console.error(error);
  }
}
