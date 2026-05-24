import { Suspense } from "react"
import { LoginForm } from "@/components/forms/auth/login-form"
import { GraduationCap } from "lucide-react"

export default function LoginPage() {
  return (
    <div
      className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 bg-gradient-to-br from-slate-50 via-blue-50/50 to-slate-100"
      style={{
        backgroundImage: "linear-gradient(oklch(0.75 0 0 / 0.08) 1px, transparent 1px), linear-gradient(90deg, oklch(0.75 0 0 / 0.08) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="size-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">THPT Thăng Long</span>
          </div>
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            "Trường học hạnh phúc — Nơi ươm mầm tri thức"
          </p>
        </div>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
        <p className="text-[11px] text-muted-foreground/60 text-center">
          Hệ thống thông tin — THPT Thăng Long © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
