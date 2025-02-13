"use client";
import { Button } from "@/components/ui/button";
import { DataTableUsers } from "./data-table";

import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function Page() {
  // const queryClient = useQueryClient();
  // const [count, setCount] = useState(0);
  const queryClient = useQueryClient();

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0  ">
        <div className="flex items-start justify-start flex-col">
          <code className="text-2xl md:text-5xl lg:text-6xl font-bold text-left py-4 md:py-6 lg:py-8">
            User Management
          </code>

          <DataTableUsers />

          <Button
            className="mt-4 mx-auto md:mx-0"
            onClick={() => {
              queryClient.invalidateQueries({
                queryKey: ["allUsers"],
              });
            }}
          >
            Refresh
          </Button>
        </div>{" "}
      </div>
    </>
  );
}
