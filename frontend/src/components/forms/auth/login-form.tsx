/**
 * LoginForm Component
 */

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/hooks/use-auth-query";
import { useAuthStore } from "@/stores/auth.store";
import type { LoginRequest } from "@/types/auth.types";

const EMPLOYEE_ROLES = ["GIAO_VIEN", "NHAN_VIEN"];

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();
  const user = useAuthStore((state) => state.user);

  const redirectParam = searchParams.get("redirect");

  const [formData, setFormData] = useState<LoginRequest>({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginRequest, string>>>({});

  const handleChange = (field: keyof LoginRequest) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof LoginRequest, string>> = {};
    if (!formData.username) newErrors.username = "Tên đăng nhập là bắt buộc";
    if (!formData.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await login.mutateAsync(formData);
      const currentUser = useAuthStore.getState().user;
      if (redirectParam) {
        router.push(redirectParam);
      } else if (currentUser && EMPLOYEE_ROLES.includes(currentUser.role)) {
        router.push("/employee");
      } else {
        router.push("/dashboard");
      }
    } catch {}
  };

  const isLoading = login.isPending;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Đăng nhập</CardTitle>
        <CardDescription>Nhập thông tin đăng nhập để tiếp tục</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="text-sm font-medium">Tên đăng nhập</label>
            <Input
              id="username"
              type="text"
              placeholder="Tên đăng nhập"
              value={formData.username}
              onChange={handleChange("username")}
              disabled={isLoading}
              autoFocus
              className={errors.username ? "border-destructive" : undefined}
            />
            {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium">Mật khẩu</label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange("password")}
              disabled={isLoading}
              className={errors.password ? "border-destructive" : undefined}
            />
            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang đăng nhập...
              </>
            ) : (
              "Đăng nhập"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
