"use client";

import { StatCard } from "@/components/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import {
  useHasUsersStats,
  useHasApplicantsStats,
  useHasEventStats,
  useHasApplicationsStats,
} from "@/lib/permissions";
import {
  Users,
  UserPlus,
  Calendar,
  AppWindow,
  Clock,
  Timer,
  Activity,
} from "lucide-react";

/**
 * @param {{ section: "users" | "applicants" | "events" | "applications" }} props
 */
export function PageStatsRow({ section }) {
  const okUsers = useHasUsersStats();
  const okApplicants = useHasApplicantsStats();
  const okEvents = useHasEventStats();
  const okApps = useHasApplicationsStats();

  const allowed =
    (section === "users" && okUsers) ||
    (section === "applicants" && okApplicants) ||
    (section === "events" && okEvents) ||
    (section === "applications" && okApps);

  const { data, isLoading } = useDashboardStats();

  if (!allowed) return null;

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full mb-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
    );
  }

  if (section === "users" && data?.users) {
    return (
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full mb-4">
        <StatCard
          title="Approved members"
          value={data.users.approvedMembers?.toLocaleString?.() ?? "—"}
          description="Active member accounts."
          icon={Users}
        />
        <StatCard
          title="Disabled accounts"
          value={data.users.disabledAccounts?.toLocaleString?.() ?? "—"}
          icon={Activity}
        />
      </div>
    );
  }

  if (section === "applicants" && data?.applicants) {
    return (
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full mb-4">
        <StatCard
          title="Open applicants"
          value={data.applicants.openApplicants?.toLocaleString?.() ?? "—"}
          icon={UserPlus}
        />
        <StatCard
          title="Avg. age (open)"
          value={
            data.applicants.avgDaysOpen != null ? `${data.applicants.avgDaysOpen} days` : "—"
          }
          description="Mean days in queue."
          icon={Clock}
        />
        <StatCard
          title="Avg. time to approve"
          value={
            data.applicants.avgDaysToClose != null
              ? `${data.applicants.avgDaysToClose} days`
              : "—"
          }
          description="Apply → accept (approved members)."
          icon={Timer}
        />
      </div>
    );
  }

  if (section === "events" && data?.events) {
    return (
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full mb-4">
        <StatCard
          title="Total events"
          value={data.events.totalEvents?.toLocaleString?.() ?? "—"}
          icon={Calendar}
        />
        <StatCard
          title="Upcoming"
          value={data.events.upcomingEvents?.toLocaleString?.() ?? "—"}
          description="Future active events."
          icon={Clock}
        />
        <StatCard
          title="Total RSVPs"
          value={data.events.totalRsvps?.toLocaleString?.() ?? "—"}
          icon={Users}
        />
        <StatCard
          title="Active events"
          value={data.events.activeEvents?.toLocaleString?.() ?? "—"}
          icon={Activity}
        />
      </div>
    );
  }

  if (section === "applications" && data?.applications) {
    return (
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full mb-4">
        <StatCard
          title="Integrations"
          value={data.applications.total?.toLocaleString?.() ?? "—"}
          icon={AppWindow}
        />
        <StatCard
          title="Active"
          value={data.applications.byStatus?.active?.toLocaleString?.() ?? "—"}
          icon={Activity}
        />
        <StatCard
          title="Pending"
          value={data.applications.byStatus?.pending?.toLocaleString?.() ?? "—"}
          icon={Clock}
        />
        <StatCard
          title="Inactive"
          value={data.applications.byStatus?.inactive?.toLocaleString?.() ?? "—"}
          icon={Users}
        />
      </div>
    );
  }

  return null;
}
