import { Suspense } from "react"
import { LoginForm } from "@/components/forms/auth/login-form"
import { UsersIcon } from "lucide-react"

export default function LoginPage() {
  return (
    <div
      className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10"
      style={{
        backgroundImage: "linear-gradient(oklch(0.75 0 0 / 0.15) 1px, transparent 1px), linear-gradient(90deg, oklch(0.75 0 0 / 0.15) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <UsersIcon className="size-5" />
          </div>
          HR Management System
        </div>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
