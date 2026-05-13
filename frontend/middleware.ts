/**
 * Auth Middleware - Next.js
 * 
 * Chặn ở MIDDLEWARE LEVEL (trước khi render) để tránh flash content
 * - Server-side check cookies
 * - Redirect trước khi page được render
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes - không cần auth
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/forgot-password", 
  "/reset-password",
  "/gioi-thieu",
] as const;

// Protected routes - cần auth
const PROTECTED_ROUTES = [
  "/dashboard",
  "/nhan-vien",
  "/phong-ban",
  "/chuc-vu",
  // Thêm các route protected khác ở đây
] as const;

// Auth routes - nếu đã login thì redirect về dashboard
const AUTH_ROUTES = [
  "/login",
  "/forgot-password",
  "/reset-password",
] as const;

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(route => pathname.startsWith(route));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Lấy token từ cookie (httpOnly)
  const token = request.cookies.get("token")?.value;
  const isAuthenticated = !!token;

  // 1. Đã đăng nhập mà vào auth routes (login/register) → redirect dashboard
  if (isAuthenticated && isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 2. Chưa đăng nhập mà vào protected routes → redirect login
  if (!isAuthenticated && isProtectedRoute(pathname)) {
    const loginUrl = new URL("/login", request.url);
    // Lưu redirect url để sau login quay lại
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Cho phép access bình thường
  return NextResponse.next();
}

/**
 * Matcher config
 * - Chỉ chạy middleware cho page routes
 * - Bỏ qua: API routes, static files, _next, images
 */
export const config = {
  matcher: [
    // Match all paths except:
    // - 1. API routes (/api/*)
    // - 2. Static files (_next/static/*)
    // - 3. Images (_next/image/*)
    // - 4. Static files (favicon.ico, images, etc)
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
