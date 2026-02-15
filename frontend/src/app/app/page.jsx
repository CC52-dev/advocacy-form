"use client";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import ApplicantStatus from "@/components/applicant-status";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, User, Loader2 } from "lucide-react";
import { useState } from "react";

export default function Page() {
  const firstname = useAuthStore((state) => state.firstname);
  const lastname = useAuthStore((state) => state.lastname);
  const email = useAuthStore((state) => state.email);
  const phone = useAuthStore((state) => state.phone);
  const locationRaw = useAuthStore((state) => state.location);
  const location = Array.isArray(locationRaw) ? locationRaw : [];
  const addr = useAuthStore((state) => state.addr);
  const city = useAuthStore((state) => state.city);
  const zip = useAuthStore((state) => state.zip);
  const interestRaw = useAuthStore((state) => state.interest);
  const interest = Array.isArray(interestRaw) ? interestRaw : [];
  const permissions = useAuthStore((state) => state.permissions) || [];
  const roles = useAuthStore((state) => state.roles) || [];
  const isApplicant = permissions.includes("applicant");
  const { toast } = useToast();
  const [myAdvocacyOpen, setMyAdvocacyOpen] = useState(false);

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
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setMyAdvocacyOpen(true)}
          >
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

      {/* My Advocacy Dialog */}
      <Dialog open={myAdvocacyOpen} onOpenChange={setMyAdvocacyOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>My Advocacy Information</DialogTitle>
            <DialogDescription>
              Your personal information and advocacy details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Personal Information */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">First Name</p>
                  <p className="text-base">{firstname || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Name</p>
                  <p className="text-base">{lastname || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-base">{email || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-base">{phone || "Not provided"}</p>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Address</h3>
              <div className="space-y-2">
                {addr && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Street Address</p>
                    <p className="text-base">{addr}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {city && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">City</p>
                      <p className="text-base">{city}</p>
                    </div>
                  )}
                  {location.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {location.length > 1 ? "State" : "Country"}
                      </p>
                      <p className="text-base">{location[location.length - 1] || location[0]}</p>
                    </div>
                  )}
                  {location.length > 1 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Country</p>
                      <p className="text-base">{location[0]}</p>
                    </div>
                  )}
                  {zip && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">ZIP Code</p>
                      <p className="text-base">{zip}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Interests */}
            {interest && interest.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Areas of Interest</h3>
                <div className="flex flex-wrap gap-2">
                  {interest.map((item, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
