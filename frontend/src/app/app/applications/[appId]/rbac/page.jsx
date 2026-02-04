"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, UserCheck } from "lucide-react";
import api from "@/lib/axios";
import { DataTableAppRBAC } from "./data-table";
import { DataTableAllUsers } from "./data-table-all-users";
import { useIsAdmin } from "@/lib/permissions";

export default function ApplicationRBACPage() {
  const params = useParams();
  const router = useRouter();
  const appId = params.appId;
  
  // Check if current user is system admin (can manage RBAC for all applications)
  const isSystemAdmin = useIsAdmin();

  // Fetch application users (users with roles)
  const { data, isLoading, error, refetch: refetchAppUsers, isFetching: isFetchingAppUsers } = useQuery({
    queryKey: ["applicationUsers", appId],
    queryFn: async () => {
      const response = await api.post(`/api/app-roles/${appId}/users`);
      return response.data;
    },
    enabled: !!appId,
  });

  // Fetch all users (only needed for devs)
  const { data: allUsersData, isLoading: allUsersLoading, refetch: refetchAllUsers, isFetching: isFetchingAllUsers } = useQuery({
    queryKey: ["allUsers"],
    queryFn: async () => {
      const response = await api.post("/api/user/getAllUsers");
      return response.data;
    },
    enabled: isSystemAdmin, // Only fetch if user is system admin
  });

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-2 sm:p-4 pt-0 h-full min-h-0 w-full">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold text-destructive">
            Error: {error.response?.data?.message || "Failed to load application"}
          </h1>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-2 sm:p-4 pt-0 h-full min-h-0 w-full">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-12 w-64" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const application = data?.message?.application;
  const applicationUsers = data?.message?.users || [];
  const allUsers = allUsersData?.message || [];

  return (
    <div className="flex flex-1 flex-col gap-4 p-2 sm:p-4 pt-0 h-full min-h-0 w-full">
      <div className="flex items-start justify-start flex-col h-full min-h-0 w-full">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/app/applications")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <code className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-left">
              {application?.name} - RBAC
            </code>
            <p className="text-sm text-muted-foreground mt-1">
              Manage user roles for this application
              {!isSystemAdmin && (
                <span className="ml-2 text-xs text-amber-600">
                  (Application Admin - can only assign non-admin roles)
                </span>
              )}
            </p>
          </div>
        </div>

        <Tabs defaultValue="app-users" className="w-full">
          <TabsList className="mb-4">
            {isSystemAdmin && (
              <TabsTrigger value="all-users" className="gap-2">
                <Users className="h-4 w-4" />
                All Users
              </TabsTrigger>
            )}
            <TabsTrigger value="app-users" className="gap-2">
              <UserCheck className="h-4 w-4" />
              Application Users
            </TabsTrigger>
          </TabsList>

          {isSystemAdmin && (
            <TabsContent value="all-users">
              <div className="mb-4 p-3 border rounded-md bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  View and manage permissions for all users in <strong>{application?.name}</strong>. 
                  Use the action menu to assign or remove application-specific permissions.
                </p>
              </div>
              <DataTableAllUsers
                appId={appId}
                application={application}
                allUsers={allUsers}
                appUsersData={data?.message}
                isLoading={allUsersLoading}
                isSystemAdmin={isSystemAdmin}
                refetch={refetchAllUsers}
                isFetching={isFetchingAllUsers}
              />
            </TabsContent>
          )}

          <TabsContent value="app-users">
            <DataTableAppRBAC 
              appId={appId} 
              application={application} 
              users={applicationUsers}
              isSystemAdmin={isSystemAdmin}
              refetch={refetchAppUsers}
              isFetching={isFetchingAppUsers}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
