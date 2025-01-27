"use client";
import { Button } from "@/components/ui/button";
import { DataTableApplicants } from "./data-table";

// const data = [
//   {
//     id: "2eb7fea3-3391-4a3e-a7d2-1394edbf9484",
//     firstname: "Balaji",
//     lastname: "Yogesh",
//     phone: "+16128105922",
//     email: "balaji.yogesh@gmail.com",
//     location: ["United States", "Wisconsin"],
//     addr: "w239n2377 Hawks Meadow CT",
//     city: "Waukesha ",
//     zip: "53072",
//     interest: ["Vedic Worship (USA)"],
//     over16: true,
//     applied_at: "2025-01-19 19:42:24.598268",
//     accepted_at: null,
//     type: "applicant",
//   },
// ];

import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function Page() {
  // const queryClient = useQueryClient();
  // const [count, setCount] = useState(0);
  const queryClient = useQueryClient();



  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0  ">
        <div className="flex items-start justify-start flex-col">
          <h1 className="lg:text-5xl md:text-4xl sm:text-3xl text-3xl font-bold text-left py-4 md:py-6 lg:py-8">
            <code>Applicant Management</code>
          </h1>

                    <DataTableApplicants  />

          <Button
            className="mt-4 mx-auto md:mx-0"
            onClick={() => {
              queryClient.invalidateQueries({
                queryKey: ["applicants"],
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
