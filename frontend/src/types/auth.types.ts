/**
 * Auth Types - Shared types for authentication
 */

export type UserRole = "ADMIN" | "GIAO_VIEN" | "TO_TRUONG" | "HIEU_TRUONG" | "HIEU_PHO";

export interface User {
  id: string;
  username: string;
  email?: string | null;
  role: UserRole;
  is_active: boolean;
  nhan_vien_id?: string | null;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthActions {
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}
