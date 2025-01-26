"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "@/stores/authStore"; // Assuming you have an auth store
import { usePathname } from "next/navigation";

export function AuthStoreProvider({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { setUserData, isLoggedIn, type } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await axios.post("/api/user/getuser");
      return response.data;
    },
    staleTime: 60000,
    cacheTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  useEffect(() => {
    if (data && data?.message !== "Token is Invalid Or Expired") {
      setUserData(data, true);
    } else if (data?.message === "Token is Invalid Or Expired") {
      setUserData(
        {
          message: {
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
          }
        },
        false
      );
    }
  }, [data, setUserData]);

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      console.log(router.pathname);
      if (
        type !== "admin" &&
        (pathname === "/app/applicants" || pathname === "/app/users")
      ) {
        router.push("/app/");
      }
    } else if (!isLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoading, isLoggedIn, router, type, pathname]);

  if (isLoading) {
    return children; // Or return a loading spinner component
  }

  return children;
}

export default AuthStoreProvider;
