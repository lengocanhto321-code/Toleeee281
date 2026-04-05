import { LoginForm } from "@/components/pages/login-form"
import { UsersIcon } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <UsersIcon className="size-5" />
          </div>
          HR Management System
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
