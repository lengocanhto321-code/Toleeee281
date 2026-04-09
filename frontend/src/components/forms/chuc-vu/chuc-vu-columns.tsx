"use client"

import React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { Trash2, Edit, MoreVertical, CheckCircle2, XCircle } from "lucide-react"
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
import type { ChucVu } from "@/types/chuc-vu.types"

interface ColumnActions {
      onEdit: (cv: ChucVu) => void
      onDelete: (cv: ChucVu) => void
}

export function createChucVuColumns({ onEdit, onDelete }: ColumnActions): ColumnDef<ChucVu>[] {
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
                  accessorKey: "ma_chuc_vu",
                  header: ({ column }) => <DataTableColumnHeader column={column} title="Mã CV" />,
                  cell: ({ row }) => <span className="font-medium text-slate-900">{row.getValue("ma_chuc_vu")}</span>,
            },
            {
                  accessorKey: "ten_chuc_vu",
                  header: ({ column }) => <DataTableColumnHeader column={column} title="Tên chức vụ" />,
                  cell: ({ row }) => (
                        <div>
                              <div className="font-medium text-slate-900">{row.getValue("ten_chuc_vu")}</div>
                              {row.original.mo_ta && <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{row.original.mo_ta}</div>}
                        </div>
                  ),
            },
            {
                  accessorKey: "cap_bac",
                  header: ({ column }) => <DataTableColumnHeader column={column} title="Cấp bậc" />,
                  cell: ({ row }) => {
                        const capBac = row.getValue("cap_bac") as number
                        return (
                              <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)" }}>
                                          {capBac}
                                    </div>
                                    <span className="text-xs text-slate-500">
                                          {capBac === 1 && "(Thấp nhất)"}
                                          {capBac === 10 && "(Cao nhất)"}
                                    </span>
                              </div>
                        )
                  },
            },
            {
                  accessorKey: "he_so_phu_cap",
                  header: ({ column }) => <DataTableColumnHeader column={column} title="Hệ số" />,
                  cell: ({ row }) => <span className="text-slate-700">{(row.getValue("he_so_phu_cap") as number).toFixed(2)}</span>,
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
