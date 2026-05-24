import { UserRole } from "@/types/auth.types"

export const ADMIN_ROLES: UserRole[] = ["ADMIN", "HIEU_TRUONG", "HIEU_PHO", "TO_TRUONG"]
export const EMPLOYEE_ROLES: UserRole[] = ["GIAO_VIEN", "NHAN_VIEN"]

export function isAdminRole(role: UserRole): boolean {
  return ADMIN_ROLES.includes(role)
}

export function isEmployeeRole(role: UserRole): boolean {
  return EMPLOYEE_ROLES.includes(role)
}

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Quản trị viên",
  HIEU_TRUONG: "Hiệu trưởng",
  HIEU_PHO: "Hiệu phó",
  TO_TRUONG: "Tổ trưởng",
  GIAO_VIEN: "Giáo viên",
  NHAN_VIEN: "Nhân viên",
}

export const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: "bg-red-100 text-red-700 border-red-200",
  HIEU_TRUONG: "bg-purple-100 text-purple-700 border-purple-200",
  HIEU_PHO: "bg-blue-100 text-blue-700 border-blue-200",
  TO_TRUONG: "bg-blue-100 text-blue-700 border-blue-200",
  GIAO_VIEN: "bg-emerald-100 text-emerald-700 border-emerald-200",
  NHAN_VIEN: "bg-teal-100 text-teal-700 border-teal-200",
}
