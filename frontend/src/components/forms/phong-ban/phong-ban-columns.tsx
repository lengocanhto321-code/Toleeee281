"use client"

import React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { Trash2, Edit, Building2, Landmark, MoreVertical, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuSeparator,
      DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "@/components/ui/data-table"
import type { PhongBan } from "@/types/phong-ban.types"

interface ColumnActions {
      onEdit: (pb: PhongBan) => void
      onDelete: (pb: PhongBan) => void
}

export function createPhongBanColumns({ onEdit, onDelete }: ColumnActions): ColumnDef<PhongBan>[] {
      return [
            {
                  id: "select",
                  header: ({ table }) => (
                        <div className="flex w-full items-center justify-center">
                              <Checkbox
                                    checked={
                                          table.getIsAllPageRowsSelected() ||
                                          (table.getIsSomePageRowsSelected() && "indeterminate")
                                    }
                                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                                    aria-label="Chọn tất cả"
                              />
                        </div>
                  ),
                  cell: ({ row }) => (
                        <div className="flex w-full items-center justify-center">
                              <Checkbox
                                    checked={row.getIsSelected()}
                                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                                    aria-label="Chọn dòng"
                              />
                        </div>
                  ),
                  enableSorting: false,
                  enableHiding: false,
                  size: 40,
            },
            {
                  accessorKey: "ma_phong_ban",
                  header: ({ column }) => <DataTableColumnHeader column={column} title="Mã PB" />,
                  cell: ({ row }) => <span className="font-medium text-slate-900">{row.getValue("ma_phong_ban")}</span>,
            },
            {
                  accessorKey: "ten_phong_ban",
                  header: ({ column }) => <DataTableColumnHeader column={column} title="Tên phòng ban" />,
                  cell: ({ row }) => <div className="font-medium text-slate-900">{row.getValue("ten_phong_ban")}</div>,
            },
            {
                  accessorKey: "loai",
                  header: "Loại",
                  cell: ({ row }) => {
                        const loai = row.getValue("loai") as string
                        const isHanhChinh = loai === "hanh_chinh"
                        return (
                              <Badge variant="outline" className={isHanhChinh ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-amber-50 text-amber-700 border-amber-200"}>
                                    {isHanhChinh ? <Landmark className="mr-1.5 h-3 w-3" /> : <Building2 className="mr-1.5 h-3 w-3" />}
                                    {isHanhChinh ? "Hành chính" : "Chuyên môn"}
                              </Badge>
                        )
                  },
            },
            {
                  accessorKey: "so_luong_nhan_vien",
                  header: ({ column }) => <DataTableColumnHeader column={column} title="Nhân viên" />,
                  cell: ({ row }) => <span className="text-slate-600">{row.original.so_luong_nhan_vien || 0}</span>,
            },
            {
                  accessorKey: "trang_thai",
                  header: "Trạng thái",
                  cell: ({ row }) => {
                        const isActive = row.getValue("trang_thai")
                        return (
                              <Badge variant="outline" className={isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}>
                                    {isActive ? <CheckCircle2 className="mr-1.5 h-3 w-3" /> : <XCircle className="mr-1.5 h-3 w-3" />}
                                    {isActive ? "Hoạt động" : "Ngừng"}
                              </Badge>
                        )
                  },
            },
            {
                  id: "actions",
                  header: () => <span className="sr-only">Thao tác</span>,
                  cell: ({ row }) => (
                        <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                                          <MoreVertical className="h-4 w-4" />
                                    </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                    <DropdownMenuItem onClick={() => onEdit(row.original)} className="cursor-pointer">
                                          <Edit className="mr-2 h-3.5 w-3.5" />
                                          Chỉnh sửa
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => onDelete(row.original)} className="cursor-pointer text-red-600 focus:text-red-600">
                                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                                          Xóa
                                    </DropdownMenuItem>
                              </DropdownMenuContent>
                        </DropdownMenu>
                  ),
                  size: 50,
            },
      ]
}
