"use client";

import { useMemo } from "react";
import { format, parse } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCanViewDashboard,
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
  Percent,
  Activity,
} from "lucide-react";

function formatMonthLabel(ym) {
  try {
    return format(parse(ym, "yyyy-MM", new Date()), "MMM yyyy");
  } catch {
    return ym;
  }
}

const PIE_COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))"];

export default function DashboardPage() {
  const canView = useCanViewDashboard();
  const showUsers = useHasUsersStats();
  const showApplicants = useHasApplicantsStats();
  const showEvents = useHasEventStats();
  const showApplications = useHasApplicationsStats();

  const { data, isLoading, isError } = useDashboardStats();

  const signupsChart = useMemo(() => {
    const rows = data?.users?.signupsByMonth;
    if (!rows?.length) return [];
    return rows.map((r) => ({
      ...r,
      label: formatMonthLabel(r.month),
    }));
  }, [data]);

  const applicationsChart = useMemo(() => {
    const rows = data?.applicants?.newApplicationsByMonth;
    if (!rows?.length) return [];
    return rows.map((r) => ({
      ...r,
      label: formatMonthLabel(r.month),
    }));
  }, [data]);

  const pieData = useMemo(() => {
    const b = data?.applications?.byStatus;
    if (!b) return [];
    return [
      { name: "Active", value: b.active },
      { name: "Inactive", value: b.inactive },
      { name: "Pending", value: b.pending },
    ].filter((d) => d.value > 0);
  }, [data]);

  if (!canView) {
    return (
      <div className="p-4">
        <p className="text-muted-foreground">You do not have access to this dashboard.</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4">
        <p className="text-destructive">Could not load statistics. Try again later.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-2 sm:p-4 pt-0">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-4xl font-bold tracking-tight py-2 sm:py-4">
          Analytics dashboard
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Metrics reflect your permissions. Sections you cannot access are hidden.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          {showUsers && data?.users && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" />
                Members
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                  title="Approved members"
                  value={data.users.approvedMembers?.toLocaleString?.() ?? "—"}
                  description="Users with member access (user, admin, adminviewer)."
                  icon={Users}
                />
                <StatCard
                  title="Disabled accounts"
                  value={data.users.disabledAccounts?.toLocaleString?.() ?? "—"}
                  description="Accounts marked disabled."
                  icon={Activity}
                />
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>New members by month</CardTitle>
                  <CardDescription>Accepted sign-ups in the last six months</CardDescription>
                </CardHeader>
                <CardContent className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={signupsChart}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name="Sign-ups" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </section>
          )}

          {showApplicants && data?.applicants && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Applicants
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Open applicants"
                  value={data.applicants.openApplicants?.toLocaleString?.() ?? "—"}
                  description="Applications awaiting review."
                  icon={UserPlus}
                />
                <StatCard
                  title="Avg. age (open)"
                  value={
                    data.applicants.avgDaysOpen != null
                      ? `${data.applicants.avgDaysOpen} days`
                      : "—"
                  }
                  description="Mean days since apply date for open applications."
                  icon={Clock}
                />
                <StatCard
                  title="Avg. time to approve"
                  value={
                    data.applicants.avgDaysToClose != null
                      ? `${data.applicants.avgDaysToClose} days`
                      : "—"
                  }
                  description="Mean days from application to acceptance (approved members)."
                  icon={Timer}
                />
                <StatCard
                  title="Pipeline"
                  value={
                    data.applicants.openApplicants > 0 && data.applicants.avgDaysOpen != null
                      ? `${data.applicants.openApplicants} open · ~${data.applicants.avgDaysOpen}d avg age`
                      : "—"
                  }
                  description="Quick view of queue depth and aging."
                  icon={Percent}
                />
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>New applications by month</CardTitle>
                  <CardDescription>Open applications submitted in the last six months</CardDescription>
                </CardHeader>
                <CardContent className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={applicationsChart}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar
                        dataKey="count"
                        fill="hsl(var(--chart-2))"
                        radius={[4, 4, 0, 0]}
                        name="Applications"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </section>
          )}

          {showEvents && data?.events && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Events
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Total events"
                  value={data.events.totalEvents?.toLocaleString?.() ?? "—"}
                  description="All events in the system."
                  icon={Calendar}
                />
                <StatCard
                  title="Active events"
                  value={data.events.activeEvents?.toLocaleString?.() ?? "—"}
                  description="Events currently active."
                  icon={Activity}
                />
                <StatCard
                  title="Upcoming"
                  value={data.events.upcomingEvents?.toLocaleString?.() ?? "—"}
                  description="Active events with a future date."
                  icon={Clock}
                />
                <StatCard
                  title="Total RSVPs"
                  value={data.events.totalRsvps?.toLocaleString?.() ?? "—"}
                  description="All RSVP records."
                  icon={Users}
                />
              </div>
            </section>
          )}

          {showApplications && data?.applications && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <AppWindow className="h-5 w-5" />
                External applications
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Total integrations"
                  value={data.applications.total?.toLocaleString?.() ?? "—"}
                  description="Registered external applications."
                  icon={AppWindow}
                />
                <StatCard
                  title="Active"
                  value={data.applications.byStatus?.active?.toLocaleString?.() ?? "—"}
                  description="Live integrations."
                  icon={Activity}
                />
                <StatCard
                  title="Pending"
                  value={data.applications.byStatus?.pending?.toLocaleString?.() ?? "—"}
                  description="Awaiting activation."
                  icon={Clock}
                />
                <StatCard
                  title="Inactive"
                  value={data.applications.byStatus?.inactive?.toLocaleString?.() ?? "—"}
                  description="Turned off."
                  icon={Percent}
                />
              </div>
              {pieData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Status mix</CardTitle>
                    <CardDescription>Distribution of integration statuses</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                        >
                          {pieData.map((_, index) => (
                            <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
