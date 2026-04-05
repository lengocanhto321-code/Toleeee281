import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In - HR Management System",
  description: "Sign in to your HR Management System account",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
