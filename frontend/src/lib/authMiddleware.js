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
  const [isChecking, setIsChecking] = useState(true);

  // Check session cookie first
  useEffect(() => {
    const checkSession = async () => {
      const hasSession = document.cookie.includes('session_token=');
      if (!hasSession && pathname.startsWith('/app')) {
        router.replace('/login');
        return;
      }
      setIsChecking(false);
    };
    checkSession();
  }, [pathname, router]);

  // Only run the query if we have a session cookie
  const { data, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await api.post("/api/user/getuser");
      return response.data;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    // Only refetch if we don't have user data
    enabled: !isChecking && document.cookie.includes('session_token=')
  });

  useEffect(() => {
    if (data && data?.message !== "Token is Invalid Or Expired") {
      console.log("authMiddleware Activating");
      console.log(data.message);
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
      localStorage.removeItem('session_token');
      if (pathname.startsWith('/app')) {
        router.replace('/login');
      }
    }
  }, [data, setUserData, pathname, router]);

  useEffect(() => {
    const adminProtectedRoutes = ['/app/applicants', '/app/users'];
    const isAppRoute = pathname.startsWith('/app');
    const isAuthRoute = pathname === '/login' || pathname === '/signup';

    if (!isLoading && !isChecking) {
      if (!isLoggedIn && isAppRoute) {
        router.replace('/login');
      } else if (isLoggedIn && type !== 'admin' && adminProtectedRoutes.includes(pathname)) {
        router.replace('/app/');
      } else if (isLoggedIn && isAuthRoute) {
        router.replace('/app/');
      }
    }
  }, [isLoading, isChecking, isLoggedIn, router, type, pathname]);

  // Show loading state while checking auth
  if (isChecking || (isLoading && !isLoggedIn)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Don't render children until we've verified auth
  if (pathname.startsWith('/app') && !isLoggedIn) {
    return null;
  }

  return children;
}

export default AuthStoreProvider;
