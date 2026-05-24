import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Đăng nhập - THPT Thăng Long",
  description: "Hệ thống thông tin THPT Thăng Long",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
