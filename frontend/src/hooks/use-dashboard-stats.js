"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const response = await api.post("/api/stats/dashboard");
      return response.data?.message ?? null;
    },
    staleTime: 60_000,
  });
}
