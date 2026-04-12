import db from "../db/db.js";
import { eq, and, inArray, isNotNull, gte, count } from "drizzle-orm";
import { usersTable, applicationsTable, eventsTable, eventRsvpsTable } from "../db/schema.js";
import type { Response } from "express";
import { validateSessionToken, type SessionValidationResult } from "../lib/session.js";
import { hasPermission, hasAnyPermission } from "../lib/permissions.js";

function daysBetween(a: Date, b: Date): number {
  return (b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24);
}

function monthKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function lastNMonthKeys(n: number): string[] {
  const keys: string[] = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d.getFullYear(), d.getMonth() - i, 1);
    keys.push(monthKey(x));
  }
  return keys;
}

export async function getDashboardStats(token: string, res: Response) {
  try {
    const sessionValidationResult: SessionValidationResult = await validateSessionToken(token);
    if (!sessionValidationResult.session || !sessionValidationResult.user) {
      res.status(401).json({ message: "Token is Invalid Or Expired" });
      return;
    }

    const userId = sessionValidationResult.user.id;

    const canUsers = await hasPermission(userId, "users.read");
    const canApplicants = await hasPermission(userId, "applicants.read");
    const canEvents = await hasAnyPermission(userId, [
      "events.read",
      "events.create",
      "events.update",
      "events.delete",
    ]);
    const canApplications =
      (await hasPermission(userId, "dev")) ||
      (await hasPermission(userId, "applications.read"));

    const payload: Record<string, unknown> = {};

    if (canUsers) {
      const [approvedRow] = await db
        .select({ n: count() })
        .from(usersTable)
        .where(inArray(usersTable.type, ["user", "admin", "adminviewer"]));

      const [disabledRow] = await db
        .select({ n: count() })
        .from(usersTable)
        .where(eq(usersTable.type, "disabled"));

      const since = new Date();
      since.setMonth(since.getMonth() - 6);
      const acceptedRecent = await db
        .select({ acceptedAt: usersTable.acceptedAt })
        .from(usersTable)
        .where(and(isNotNull(usersTable.acceptedAt), gte(usersTable.acceptedAt, since)));

      const signupsByMonth: Record<string, number> = {};
      for (const k of lastNMonthKeys(6)) signupsByMonth[k] = 0;
      for (const row of acceptedRecent) {
        if (!row.acceptedAt) continue;
        const k = monthKey(new Date(row.acceptedAt));
        if (signupsByMonth[k] !== undefined) signupsByMonth[k] += 1;
      }

      payload.users = {
        approvedMembers: approvedRow?.n ?? 0,
        disabledAccounts: disabledRow?.n ?? 0,
        signupsByMonth: lastNMonthKeys(6).map((month) => ({
          month,
          count: signupsByMonth[month] ?? 0,
        })),
      };
    } else {
      payload.users = null;
    }

    if (canApplicants) {
      const [openRow] = await db
        .select({ n: count() })
        .from(usersTable)
        .where(eq(usersTable.type, "applicant"));

      const openApplicants = await db
        .select({ appliedAt: usersTable.appliedAt })
        .from(usersTable)
        .where(eq(usersTable.type, "applicant"));

      const withApplied = openApplicants.filter((r) => r.appliedAt != null);
      const now = new Date();
      let avgDaysOpen: number | null = null;
      if (withApplied.length > 0) {
        const sum = withApplied.reduce((acc, r) => {
          return acc + daysBetween(new Date(r.appliedAt!), now);
        }, 0);
        avgDaysOpen = Math.round((sum / withApplied.length) * 10) / 10;
      }

      const approvedWithDates = await db
        .select({ appliedAt: usersTable.appliedAt, acceptedAt: usersTable.acceptedAt })
        .from(usersTable)
        .where(
          and(
            isNotNull(usersTable.acceptedAt),
            isNotNull(usersTable.appliedAt),
            inArray(usersTable.type, ["user", "admin", "adminviewer"])
          )
        );

      let avgDaysToClose: number | null = null;
      if (approvedWithDates.length > 0) {
        const sumClose = approvedWithDates.reduce((acc, r) => {
          return acc + daysBetween(new Date(r.appliedAt!), new Date(r.acceptedAt!));
        }, 0);
        avgDaysToClose = Math.round((sumClose / approvedWithDates.length) * 10) / 10;
      }

      const since = new Date();
      since.setMonth(since.getMonth() - 6);
      const appliedRecent = await db
        .select({ appliedAt: usersTable.appliedAt })
        .from(usersTable)
        .where(and(eq(usersTable.type, "applicant"), gte(usersTable.appliedAt, since)));

      const applicationsByMonth: Record<string, number> = {};
      for (const k of lastNMonthKeys(6)) applicationsByMonth[k] = 0;
      for (const row of appliedRecent) {
        if (!row.appliedAt) continue;
        const k = monthKey(new Date(row.appliedAt));
        if (applicationsByMonth[k] !== undefined) applicationsByMonth[k] += 1;
      }

      payload.applicants = {
        openApplicants: openRow?.n ?? 0,
        avgDaysOpen,
        avgDaysToClose,
        newApplicationsByMonth: lastNMonthKeys(6).map((month) => ({
          month,
          count: applicationsByMonth[month] ?? 0,
        })),
      };
    } else {
      payload.applicants = null;
    }

    if (canEvents) {
      const [totalEventsRow] = await db.select({ n: count() }).from(eventsTable);

      const now = new Date();
      const upcoming = await db
        .select({ id: eventsTable.id })
        .from(eventsTable)
        .where(and(eq(eventsTable.status, "active"), gte(eventsTable.eventDate, now)));

      const [totalRsvpsRow] = await db.select({ n: count() }).from(eventRsvpsTable);

      const [activeEventsRow] = await db
        .select({ n: count() })
        .from(eventsTable)
        .where(eq(eventsTable.status, "active"));

      payload.events = {
        totalEvents: totalEventsRow?.n ?? 0,
        activeEvents: activeEventsRow?.n ?? 0,
        upcomingEvents: upcoming.length,
        totalRsvps: totalRsvpsRow?.n ?? 0,
      };
    } else {
      payload.events = null;
    }

    if (canApplications) {
      const apps = await db
        .select({ status: applicationsTable.status })
        .from(applicationsTable);

      const byStatus: Record<string, number> = { active: 0, inactive: 0, pending: 0 };
      for (const a of apps) {
        const s = a.status ?? "pending";
        if (byStatus[s] !== undefined) byStatus[s] += 1;
      }

      payload.applications = {
        total: apps.length,
        byStatus: {
          active: byStatus.active,
          inactive: byStatus.inactive,
          pending: byStatus.pending,
        },
      };
    } else {
      payload.applications = null;
    }

    res.status(200).json({ message: payload });
  } catch (error) {
    console.error("getDashboardStats:", error);
    res.status(400).json({ message: "An error occurred" });
  }
}
