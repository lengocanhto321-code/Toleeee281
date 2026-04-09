/**
 * Auth Hook - Client-side auth utilities
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "./use-auth-query";
import { useAuthStore } from "@/stores/auth.store";

export function useRequireAuth() {
  const router = useRouter();
  
  // GÓP TẤT CẢ STATE VÀO MỘT LẦN - đảm bảo thứ tự hooks ổn định
  const authState = useAuthStore((state) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
  }));

  const { data: user, isLoading } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && !authState.isAuthenticated) {
      router.push("/login");
    }
  }, [authState.isAuthenticated, isLoading, router]);

  return { 
    user: user || authState.user, 
    isAuthenticated: authState.isAuthenticated, 
    isLoading: isLoading || authState.isLoading 
  };
}

export function useHasRole(allowedRoles: string[]) {
  const userResult = useCurrentUser();
  const user = "data" in userResult ? userResult.data : undefined;
  const userRole = user?.role;
  return { 
    hasRole: userRole ? allowedRoles.includes(userRole) : false, 
    userRole 
  };
}

export function useUser() {
  return useCurrentUser();
}
