"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useAuthStore } from "@/stores/authStore";
import { usePathname } from "next/navigation";
import { hasPermission } from "@/lib/permissions.js";

// Force import to ensure store is available
const getStoreState = () => useAuthStore.getState();

export function AuthStoreProvider({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const setUserData = useAuthStore((state) => state.setUserData);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const permissions = useAuthStore((state) => state.permissions) || [];
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status
  const { data, isLoading: isUserLoading, error: queryError } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      console.log('Auth middleware: Fetching user data...');
      try {
        const response = await api.post("/api/user/getuser");
        console.log('Auth middleware: Raw response:', JSON.stringify(response.data, null, 2));
        console.log('Auth middleware: User data received:', {
          hasMessage: !!response.data?.message,
          userId: response.data?.message?.id,
          email: response.data?.message?.email,
          roles: response.data?.message?.roles,
          rolesType: typeof response.data?.message?.roles,
          rolesIsArray: Array.isArray(response.data?.message?.roles),
          permissions: response.data?.message?.permissions,
          permissionsType: typeof response.data?.message?.permissions,
          permissionsIsArray: Array.isArray(response.data?.message?.permissions),
        });
        return response.data;
      } catch (error) {
        console.error('Auth middleware: Error fetching user:', error);
        // Return a clear error response instead of throwing
        if (error.response?.status === 401) {
          return { message: "Token is Invalid Or Expired" };
        }
        throw error;
      }
    },
    refetchOnWindowFocus: false, // Prevent constant refetching
    refetchOnMount: true,
    retry: false,
    staleTime: 0, // Always consider data stale to force refetch
    gcTime: 0, // Don't cache the data (gcTime replaces cacheTime in newer versions)
  });

  useEffect(() => {
    // Handle query errors
    if (queryError) {
      console.error('Auth middleware: Query error:', queryError);
      clearAuth();
      setIsLoading(false);
      if (pathname.startsWith('/app')) {
        router.replace('/login');
      }
      return;
    }

    // Handle successful data fetch
    if (data !== undefined) {
      if (data?.message !== "Token is Invalid Or Expired") {
        const user = data?.message;
        console.log('Auth middleware: Processing user data', {
          userId: user?.id,
          email: user?.email,
          rawRoles: user?.roles,
          rawPermissions: user?.permissions,
        });
        
        // Set user data even if permissions are empty (user might have roles but no permissions yet)
        // This prevents infinite refetch loops
        console.log('Auth middleware: Calling setUserData with:', data);
        setUserData(data, true);
        
        // Verify data was set correctly
        setTimeout(() => {
          const storeState = useAuthStore.getState();
          console.log('Auth middleware: Store state after setUserData:', {
            isLoggedIn: storeState.isLoggedIn,
            roles: storeState.roles,
            permissions: storeState.permissions,
          });
        }, 100);
      } else {
        // Clear auth on invalid token
        console.log('Auth middleware: Token invalid, clearing auth');
        clearAuth();
        if (pathname.startsWith('/app')) {
          router.replace('/login');
        }
      }
      setIsLoading(false);
    } else if (!isUserLoading) {
      // If query is not loading and we have no data, user is not authenticated
      setIsLoading(false);
    }
  }, [data, queryError, setUserData, clearAuth, pathname, router, isUserLoading]);

  useEffect(() => {
    // Only run redirect logic after auth check is complete
    if (!isLoading && !isUserLoading) {
      const isAppRoute = pathname.startsWith('/app');
      const isAuthRoute = pathname === '/login' || pathname === '/signup';

      if (isLoggedIn) {
        // Permission-based route protection
        if (isAppRoute) {
          if (pathname === '/app/applicants' && !hasPermission('applicants.read')) {
            router.replace('/app/');
            return;
          }
          if (pathname === '/app/users' && !hasPermission('users.read')) {
            router.replace('/app/');
            return;
          }
          // Roles are managed through user_roles table, no separate roles page
          if (pathname === '/app/roles') {
            router.replace('/app/users');
            return;
          }
        }
        
        // Redirect away from auth pages if logged in
        if (isAuthRoute) {
          router.replace('/app/');
        }
      } else {
        // Not logged in - redirect to login if on app route
        if (isAppRoute) {
          router.replace('/login');
        }
      }
    }
  }, [isLoading, isUserLoading, isLoggedIn, router, pathname, permissions]);

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
