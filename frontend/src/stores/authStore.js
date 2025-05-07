"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import Cookies from 'js-cookie';

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
        if (!userData?.message) {
          console.error('Invalid user data structure:', userData);
          return;
        }
        
        const user = userData.message;
        set({
          isLoggedIn: isLoggedIn,
          firstname: user.firstname || "",
          lastname: user.lastname || "",
          email: user.email || "",
          id: user.id || "",
          type: user.type || "",
          interest: user.interest || [],
          location: user.location || [],
          addr: user.addr || "",
          phone: user.phone || "",
          city: user.city || "",
          zip: user.zip || "",
          applied_at: user.applied_at || "",
          accepted_at: user.accepted_at || "",
        });
      },
      logout: async() => {
        // Remove cookie using js-cookie
        Cookies.remove('session_token');
        
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
      // Only persist these fields
      partialize: (state) => ({
          isLoggedIn: state.isLoggedIn,
          firstname: state.firstname,
          lastname: state.lastname,
          email: state.email,
          id: state.id,
          type: state.type,
          interest: state.interest,
          location: state.location,
          addr: state.addr,
          phone: state.phone,
          city: state.city,
          zip: state.zip,
          applied_at: state.applied_at,
          accepted_at: state.accepted_at,
      }),
    }
  )
);