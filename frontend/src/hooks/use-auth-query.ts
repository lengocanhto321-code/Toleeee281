/**
 * Auth Query Hooks - TanStack Query
 */

import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toastSuccess, toastError } from "@/lib/utils";
import { apiGateway } from "@/lib/axios";
import { ApiEndpoints } from "@/types/api.types";
import type { LoginRequest, LoginResponse, User } from "@/types/auth.types";
import { useAuthStore } from "@/stores/auth.store";

export const authQueryKeys = {
  all: ["auth"] as const,
  user: () => [...authQueryKeys.all, "user"] as const,
  profile: () => [...authQueryKeys.all, "profile"] as const,
} as const;

export function useLogin() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);
  const setLoading = useAuthStore((state) => state.setLoading);

  return useMutation({
    mutationFn: async (credentials: LoginRequest): Promise<LoginResponse> => {
      setLoading(true);
      return apiGateway.post<LoginResponse>(ApiEndpoints.AUTH_LOGIN, credentials);
    },
    onSuccess: (data) => {
      setAuth(data.user, data.access_token, data.refresh_token);
      queryClient.invalidateQueries({ queryKey: authQueryKeys.user() });
      toastSuccess("Đăng nhập thành công", `Chào mừng ${data.user.username}!`);
    },
    onError: (error: unknown) => {
      // Error message đã được extract ở axios interceptor
      const message = (error as { message?: string })?.message || "Đăng nhập thất bại";
      toastError("Đăng nhập thất bại", message);
    },
    onSettled: () => setLoading(false),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: async (): Promise<void> => {
      try {
        await apiGateway.post<void>(ApiEndpoints.AUTH_LOGOUT);
      } catch {}
    },
    onSuccess: () => {
      logout();
      queryClient.clear();
      toastSuccess("Đăng xuất thành công");
    },
  });
}

export function useCurrentUser() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  // Track if we've synced on client
  const hasSyncedRef = useRef(false);

  const query = useQuery({
    queryKey: authQueryKeys.profile(),
    queryFn: async (): Promise<User> => apiGateway.get<User>(ApiEndpoints.AUTH_ME),
    enabled: isAuthenticated && !user && typeof window !== "undefined",
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // Sync store with query data (only on client, after hydration)
  useEffect(() => {
    if (typeof window === "undefined" || hasSyncedRef.current) return;

    if (query.data && !user) {
      setUser(query.data);
      hasSyncedRef.current = true;
    }
    if (query.error && !query.isLoading) {
      logout();
      hasSyncedRef.current = true;
    }
  }, [query.data, query.error, query.isLoading, user, setUser, logout]);

  if (user) {
    return { data: user, isLoading: false, isError: false, error: null };
  }

  return query;
}
