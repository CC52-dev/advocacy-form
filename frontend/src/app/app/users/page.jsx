"use client";
import { Button } from "@/components/ui/button";
import { DataTableUsers } from "./data-table";
import { PageStatsRow } from "@/components/page-stats-row";

import { useQueryClient } from "@tanstack/react-query";

export default function Page() {
  // const queryClient = useQueryClient();
  // const [count, setCount] = useState(0);
  const queryClient = useQueryClient();

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-2 sm:p-4 pt-0 h-full min-h-0 w-full">
        <div className="flex items-start justify-start flex-col h-full min-h-0 w-full">
          <code className="text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-left py-2 sm:py-4 md:py-6 lg:py-8">
            User Management
          </code>

          <PageStatsRow section="users" />

          <DataTableUsers />

          <Button
            className="mt-4 mx-auto sm:mx-0"
            onClick={() => {
              queryClient.invalidateQueries({
                queryKey: ["allUsers"],
              });
              queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
            }}
          >
            Refresh
          </Button>
        </div>{" "}
      </div>
    </>
  );
}
