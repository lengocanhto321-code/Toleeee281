/**
 * Auth Middleware - Next.js
 * 
 * Chặn ở MIDDLEWARE LEVEL (trước khi render) để tránh flash content
 * - Server-side check cookies
 * - Role-based route protection
 * - Redirect trước khi page được render
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/forgot-password",
  "/reset-password",
  "/gioi-thieu",
] as const;

const AUTH_ROUTES = [
  "/login",
  "/forgot-password",
  "/reset-password",
] as const;

const ADMIN_ONLY_ROUTES = [
  "/dashboard",
  "/nhan-vien",
  "/phong-ban",
  "/chuc-vu",
  "/luong",
  "/nghi-phep",
  "/cham-cong",
  "/bao-cao",
  "/cau-hinh-nghi-phep",
] as const;

const EMPLOYEE_ROUTES = [
  "/employee",
] as const;

const ADMIN_ROLES = new Set(["ADMIN", "HIEU_TRUONG", "HIEU_PHO", "TO_TRUONG"]);
const EMPLOYEE_ROLES_SET = new Set(["GIAO_VIEN", "NHAN_VIEN"]);

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname === route || (route !== "/" && pathname.startsWith(route)));
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(route => pathname.startsWith(route));
}

function isAdminRoute(pathname: string): boolean {
  return ADMIN_ONLY_ROUTES.some(route => pathname.startsWith(route));
}

function isEmployeeRoute(pathname: string): boolean {
  return EMPLOYEE_ROUTES.some(route => pathname === route || pathname.startsWith(route + "/"));
}

function getRoleFromToken(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    const roles: string[] = payload.roles || [];
    return roles.length > 0 ? roles[0] : (payload.role || null);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("token")?.value;
  const isAuthenticated = !!token;
  const userRole = token ? getRoleFromToken(token) : null;

  if (isAuthenticated && isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isAuthenticated && !isPublicRoute(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && userRole) {
    if (isAdminRoute(pathname) && !ADMIN_ROLES.has(userRole)) {
      return NextResponse.redirect(new URL("/employee", request.url));
    }

    if (isEmployeeRoute(pathname) && !EMPLOYEE_ROLES_SET.has(userRole)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
