"use client"

import React from "react"
import { PhongBan } from "@/types/phong-ban.types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  MoreVertical,
  Edit,
  Building2,
  Users,
  CheckCircle2,
  XCircle,
  Eye
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

interface PhongBanGridViewProps {
  data: PhongBan[]
  onEdit: (pb: PhongBan) => void
}

export function PhongBanGridView({ data, onEdit }: PhongBanGridViewProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-slate-500">
        Không tìm thấy phòng ban nào
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {data.map((pb) => {
        const isActive = pb.trang_thai !== false
        const isChuyenMon = pb.loai === "chuyen_mon"
        return (
          <Card key={pb.id} className="group relative overflow-hidden transition-all hover:shadow-md border-slate-200/60 bg-white">
            <CardContent className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className={`
                    flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-lg font-bold
                    ${isChuyenMon ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}
                  `}>
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {pb.ten_phong_ban}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {pb.ma_phong_ban}
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
                    <DropdownMenuItem className="cursor-pointer" onClick={() => onEdit(pb)}>
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
                <Badge variant="outline" className={isChuyenMon ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-blue-50 text-blue-700 border-blue-200"}>
                  {isChuyenMon ? "Tổ chuyên môn" : "Phòng hành chính"}
                </Badge>
              </div>

              {/* Parent Info */}
              <div className="mt-4 text-sm text-slate-600">
                {pb.cha_id ? (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="truncate">Thuộc phòng ban khác</span>
                  </div>
                ) : (
                  <div className="text-slate-400 italic text-xs">
                    Không thuộc phòng ban nào
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
