"use client"

import React from "react"
import { ChucVu } from "@/types/chuc-vu.types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  MoreVertical,
  Edit,
  Award,
  Users,
  CheckCircle2,
  XCircle,
  Crown,
  BookOpen,
  UserCog
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const LOAI_LABELS = {
  quan_ly: "Quản lý",
  giao_vien: "Giáo viên",
  nhan_vien: "Nhân viên",
}

const LOAI_ICONS = {
  quan_ly: Crown,
  giao_vien: BookOpen,
  nhan_vien: UserCog,
}

const LOAI_COLORS = {
  quan_ly: "bg-amber-100 text-amber-700",
  giao_vien: "bg-emerald-100 text-emerald-700",
  nhan_vien: "bg-blue-100 text-blue-700",
}

interface ChucVuGridViewProps {
  data: ChucVu[]
  onEdit: (cv: ChucVu) => void
}

export function ChucVuGridView({ data, onEdit }: ChucVuGridViewProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-slate-500">
        Không tìm thấy chức vụ nào
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {data.map((cv) => {
        const isActive = cv.trang_thai !== false
        const LoaiIcon = LOAI_ICONS[cv.loai] || Award
        const loaiColor = LOAI_COLORS[cv.loai] || "bg-slate-100 text-slate-700"
        
        return (
          <Card key={cv.id} className="group relative overflow-hidden transition-all hover:shadow-md border-slate-200/60 bg-white">
            <CardContent className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-lg font-bold ${loaiColor}`}>
                    <LoaiIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {cv.ten_chuc_vu}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {cv.ma_chuc_vu}
                      </span>
                      <span className="text-xs text-slate-400">
                        Cấp {cv.cap_bac}
                      </span>
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-slate-400 hover:text-slate-600">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem className="cursor-pointer" onClick={() => onEdit(cv)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Type Badge */}
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="outline" className={isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}>
                  {isActive ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                  {isActive ? "Đang hoạt động" : "Không hoạt động"}
                </Badge>
                <Badge variant="outline" className={loaiColor}>
                  <LoaiIcon className="mr-1 h-3 w-3" />
                  {LOAI_LABELS[cv.loai] || cv.loai}
                </Badge>
              </div>

              {/* Info */}
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Hệ số phụ cấp:</span>
                  <span className="font-medium">{cv.he_so_phu_cap}</span>
                </div>
                {cv.mo_ta && (
                  <div className="text-slate-400 italic text-xs line-clamp-2">
                    {cv.mo_ta}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
