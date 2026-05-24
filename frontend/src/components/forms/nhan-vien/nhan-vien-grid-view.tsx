"use client"

import React from "react"
import { NhanVien } from "@/types/nhan-vien.types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
      MoreVertical,
      Edit,
      Building2,
      Phone,
      Mail,
      CheckCircle2,
      XCircle,
      Briefcase,
      Eye
} from "lucide-react"
import {
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

function getInitials(name: string) {
      const parts = name.trim().split(" ")
      if (parts.length === 0) return "NV"
      if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

interface NhanVienGridViewProps {
      data: NhanVien[]
      onEdit: (nv: NhanVien) => void
}

export function NhanVienGridView({ data, onEdit }: NhanVienGridViewProps) {
      if (data.length === 0) {
            return (
                  <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-slate-500">
                        Không tìm thấy nhân viên nào
                  </div>
            )
      }

      return (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {data.map((nv) => {
                        const isActive = nv.trang_thai === "dang_lam"
                        return (
                              <Card key={nv.id} className="group relative overflow-hidden transition-all hover:shadow-md border-slate-200/60 bg-white">
                                    <CardContent className="p-5">
                                          {/* Header: Avatar + Info */}
                                          <div className="flex items-start justify-between">
                                                <div className="flex gap-4">
                                                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
                                                            {getInitials(nv.ho_ten)}
                                                      </div>
                                                      <div>
                                                            <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                                  {nv.ho_ten}
                                                            </h3>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                                                        {nv.ma_nhan_vien}
                                                                  </span>
                                                                  {nv.phong_ban && (
                                                                        <span className="text-xs text-slate-500 hidden sm:inline-block">
                                                                              • {nv.phong_ban.ten_phong_ban}
                                                                        </span>
                                                                  )}
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
                                                            <DropdownMenuItem asChild className="cursor-pointer">
                                                                  <Link href={`/nhan-vien/${nv.ma_nhan_vien}`}>
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        Xem chi tiết
                                                                  </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="cursor-pointer" onClick={() => onEdit(nv)}>
                                                                  <Edit className="mr-2 h-4 w-4" />
                                                                  Chỉnh sửa
                                                            </DropdownMenuItem>
                                                      </DropdownMenuContent>
                                                </DropdownMenu>
                                          </div>

                                          {/* Status and Roles */}
                                          <div className="mt-4 flex flex-wrap gap-2">
                                                <Badge variant="outline" className={isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}>
                                                      {isActive ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                                                      {isActive ? "Đang làm" : nv.trang_thai === "nghi_huu" ? "Nghỉ hưu" : "Nghỉ việc"}
                                                </Badge>
                                                {nv.chuc_vu && (
                                                      <Badge variant="outline" className="bg-blue-50/50 text-blue-700 border-blue-200" title={nv.chuc_vu.ten_chuc_vu}>
                                                            <Briefcase className="mr-1 h-3 w-3" />
                                                            <span className="max-w-[120px] truncate">{nv.chuc_vu.ten_chuc_vu}</span>
                                                      </Badge>
                                                )}
                                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                                      {nv.loai_nhan_vien === "giao_vien" ? "Giáo viên" : nv.loai_nhan_vien === "nhan_vien" ? "Nhân viên" : "Cán bộ"}
                                                </Badge>
                                          </div>

                                          {/* Contact Info */}
                                          <div className="mt-5 space-y-2 text-sm text-slate-600">
                                                {nv.email && (
                                                      <div className="flex items-center gap-2">
                                                            <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                                                            <span className="truncate">{nv.email}</span>
                                                      </div>
                                                )}
                                                {nv.so_dien_thoai && (
                                                      <div className="flex items-center gap-2">
                                                            <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                                                            <span>{nv.so_dien_thoai}</span>
                                                      </div>
                                                )}
                                                {!nv.email && !nv.so_dien_thoai && (
                                                      <div className="text-slate-400 italic text-xs">Chưa có thông tin liên lạc</div>
                                                )}
                                          </div>
                                    </CardContent>
                              </Card>
                        )
                  })}
            </div>
      )
}
