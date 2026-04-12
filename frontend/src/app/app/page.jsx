"use client";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import ApplicantStatus from "@/components/applicant-status";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, User, Loader2, Calendar, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useCanAccessEvents, useCanViewDashboard } from "@/lib/permissions";

export default function Page() {
  const firstname = useAuthStore((state) => state.firstname);
  const permissions = useAuthStore((state) => state.permissions) || [];
  const roles = useAuthStore((state) => state.roles) || [];
  const allPerms = permissions.length > 0
    ? permissions
    : (roles || []).flatMap((r) => r.permissions || []);
  const hasApplicant = allPerms.includes("applicant");
  const hasAdminOrApproved = allPerms.includes("admin") ||
    allPerms.some((p) => p.startsWith("users.") || p.startsWith("applicants."));
  const isApplicant = hasApplicant && !hasAdminOrApproved;
  const { toast } = useToast();
  const canViewEvents = useCanAccessEvents();
  const canViewAnalytics = useCanViewDashboard();

  // Fetch applications where user has any access (applicants do not get assigned apps)
  const { data: accessibleAppsData, isLoading: appsLoading } = useQuery({
    queryKey: ["accessibleApplications"],
    queryFn: async () => {
      const response = await api.post("/api/app-roles/accessible");
      return response.data;
    },
    enabled: !isApplicant && !!(roles?.length > 0 || permissions?.length > 0),
    staleTime: 60000,
  });

  // Ensure accessibleApplications is always an array
  const accessibleApplications = Array.isArray(accessibleAppsData?.message) 
    ? accessibleAppsData.message 
    : [];

  // Launch application mutation
  const launchMutation = useMutation({
    mutationFn: async (appId) => {
      const response = await api.post(`/api/app-roles/launch/${appId}/generate`);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.redirectUrl) {
        if (data.reused) {
          toast({
            title: "Launching Application",
            description: "Reusing existing session...",
            duration: 2000,
          });
        } else {
          toast({
            title: "Launching Application",
            description: "Redirecting to the application...",
            duration: 2000,
          });
        }
        window.open(data.redirectUrl, "_blank");
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to launch application",
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  const handleLaunchApp = (appId) => {
    launchMutation.mutate(appId);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-start justify-start flex-col">
        <code className="text-2xl md:text-5xl lg:text-6xl font-bold text-left py-4 md:py-6 lg:py-8">
          {firstname ? (
            `Welcome back, ${firstname}!`
            
          ) : (
            <Skeleton
              className={cn(
                "h-[32px] w-[250px] md:h-[56px] md:w-[400px] lg:h-[72px] lg:w-[500px] bg-gray-300"
              )}
            />
          )}
        </code>{" "}
      </div>
      
      {/* Show applicant status for applicants */}
      {isApplicant && (
        <div className="mt-4">
          <ApplicantStatus />
        </div>
      )}

      {/* Application Cards Section */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Applications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* My Advocacy Card - Available to everyone */}
          <Link href="/app/myadvocacy">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <CardTitle>My Advocacy</CardTitle>
                </div>
                <CardDescription>View your personal information and advocacy details</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Click to view your profile</p>
              </CardContent>
            </Card>
          </Link>

          {canViewAnalytics && (
            <Link href="/app/dashboard">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="h-5 w-5" />
                    <CardTitle>Dashboard</CardTitle>
                  </div>
                  <CardDescription>Statistics and charts for areas you can access</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Open analytics</p>
                </CardContent>
              </Card>
            </Link>
          )}

          {/* Events - link to events page (not Event Admin) */}
          {canViewEvents && (
            <Link href="/app/events">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <CardTitle>Events</CardTitle>
                  </div>
                  <CardDescription>View and RSVP to upcoming events</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Click to view events</p>
                </CardContent>
              </Card>
            </Link>
          )}

          {/* Assigned applications - only for non-applicants */}
          {!isApplicant && (
            <>
              {appsLoading ? (
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ) : Array.isArray(accessibleApplications) ? (
                accessibleApplications
                  .filter(app => app && app.status === "active")
                  .map((app) => (
                    <Card
                      key={app.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleLaunchApp(app.id)}
                    >
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <ExternalLink className="h-5 w-5" />
                          <CardTitle>{app.name}</CardTitle>
                        </div>
                        <CardDescription>
                          {app.description || "Launch this application"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {launchMutation.isPending ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Launching...</span>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Click to launch</p>
                        )}
                      </CardContent>
                    </Card>
                  ))
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
