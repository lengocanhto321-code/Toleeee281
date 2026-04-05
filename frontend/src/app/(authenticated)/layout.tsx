import { AuthenticatedLayout } from "@/components/layouts"

export default function AuthenticatedLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>
}
