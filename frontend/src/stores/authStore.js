"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

// const fetchUser = () => {
//   const { data, isLoading, isFetching } = useQuery({
//     queryKey: ["users"],
//     queryFn: async () => {
//       const response = await axios.post("/api/user/getuser");
//       return response.data;
//     },
//     staleTime: 60000,
//     cacheTime: 300000,
//     refetchOnWindowFocus: false,
//     refetchOnMount: true,
//   });
//   return data;
// };

export const useAuthStore = create(
  persist(
    (set) => ({
      isLoggedIn: false,
      firstname: "",
      lastname: "",
      email: "",
      id: "",
      type: "",
      interest: [],
      location: [],
      addr: "",
      phone: "",
      city: "",
      zip: "",
      applied_at: "",
      accepted_at: "",
      setUserData: (userData, isLoggedIn) => {
        set({
          isLoggedIn: isLoggedIn,
          firstname: userData?.message?.firstname,
          lastname: userData?.message?.lastname,
          email: userData?.message?.email,
          id: userData?.message?.id,
          type: userData?.message?.type,
          interest: userData?.message?.interest,
          location: userData?.message?.location,
          addr: userData?.message?.addr,
          phone: userData?.message?.phone,
          city: userData?.message?.city,
          zip: userData?.message?.zip,
          applied_at: userData?.message?.applied_at,
          accepted_at: userData?.message?.accepted_at,
        });
      },
      logout: () => {
        set({
          isLoggedIn: false,
          firstname: "",
          lastname: "",
          email: "",
          id: "",
          type: "",
          interest: [],
          location: [],
          addr: "",
          phone: "",
          city: "",
          zip: "",
          applied_at: "",
          accepted_at: "",
        });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);