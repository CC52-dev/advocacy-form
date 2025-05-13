"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useAuthStore } from "@/stores/authStore"; // Assuming you have an auth store
import { usePathname } from "next/navigation";

export function AuthStoreProvider({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const setUserData = useAuthStore((state) => state.setUserData);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const type = useAuthStore((state) => state.type);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status
  const { data, isLoading: isUserLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await api.post("/api/user/getuser");
      return response.data;
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: false,
  });

  useEffect(() => {
    if (data) {
      if (data?.message !== "Token is Invalid Or Expired") {
        setUserData(data, true);
      } else {
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
        if (pathname.startsWith('/app')) {
          router.replace('/login');
        }
      }
    }
    setIsLoading(false);
  }, [data, setUserData, pathname, router]);

  useEffect(() => {
    if (!isLoading && !isUserLoading) {
      const adminProtectedRoutes = ['/app/applicants', '/app/users'];
      const isAppRoute = pathname.startsWith('/app');
      const isAuthRoute = pathname === '/login' || pathname === '/signup';

      if (!isLoggedIn && isAppRoute) {
        router.replace('/login');
      } else if (isLoggedIn && type !== 'admin' && adminProtectedRoutes.includes(pathname)) {
        router.replace('/app/');
      } else if (isLoggedIn && isAuthRoute) {
        router.replace('/app/');
      }
    }
  }, [isLoading, isUserLoading, isLoggedIn, router, type, pathname]);

  // Show loading state while checking auth
  if (isLoading || isUserLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!isLoggedIn && pathname.startsWith('/app')) {
    router.replace('/login');
    return null;
  }

  return children;
}

export default AuthStoreProvider;
