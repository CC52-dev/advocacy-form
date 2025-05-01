"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useAuthStore } from "@/stores/authStore"; // Assuming you have an auth store
import { usePathname } from "next/navigation";

export function AuthStoreProvider({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { setUserData, isLoggedIn, type } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await api.post("/api/user/getuser");
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
      // Clear any invalid tokens
      localStorage.removeItem('token');
    }
  }, [data, setUserData]);

  useEffect(() => {
    const adminProtectedRoutes = ['/app/applicants', '/app/users'];
    const isAppRoute = pathname.startsWith('/app');
    const isAuthRoute = pathname === '/login' || pathname === '/signup';

    if (!isLoading) {
      if (!isLoggedIn && isAppRoute) {
        router.replace('/login');
      } else if (isLoggedIn && type !== 'admin' && adminProtectedRoutes.includes(pathname)) {
        router.replace('/app/');
      } else if (isLoggedIn && isAuthRoute) {
        router.replace('/app/');
      }
    }
  }, [isLoading, isLoggedIn, router, type, pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return children;
}

export default AuthStoreProvider;
