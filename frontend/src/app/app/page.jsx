"use client";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import ApplicantStatus from "@/components/applicant-status";
import { useHasPermission } from "@/lib/permissions";

export default function Page() {
  const firstname = useAuthStore((state) => state.firstname);
  const permissions = useAuthStore((state) => state.permissions) || [];
  const isApplicant = permissions.includes("applicant");

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
    </div>
  );
}
