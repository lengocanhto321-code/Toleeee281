"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, Users, CheckCircle2, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatCard } from "@/components/ui/stat-card"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import { useDanhSachVangMat } from "@/hooks/cham-cong/use-danh-sach-vang-mat"

interface VangMatItem {
  id: string
  nhan_vien_id: string
  nhan_vien_ho_ten: string
  phong_ban: string
  ngay: string
  trang_thai: "vang_mat_co_phep" | "vang_mat_khong_phep"
  ghi_chu_vang: string
  created_at: string
}

const columns: ColumnDef<VangMatItem>[] = [
  {
    accessorKey: "nhan_vien_ho_ten",
    header: "Họ tên",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.nhan_vien_ho_ten}</p>
        <p className="text-xs text-muted-foreground">{row.original.nhan_vien_id}</p>
      </div>
    ),
  },
  {
    accessorKey: "phong_ban",
    header: "Phòng ban",
    cell: ({ row }) => <span>{row.original.phong_ban || "—"}</span>,
  },
  {
    accessorKey: "trang_thai",
    header: "Trạng thái",
    cell: ({ row }) => {
      const isCoPhep = row.original.trang_thai === "vang_mat_co_phep"
      return (
        <Badge
          variant="outline"
          className={cn(
            isCoPhep
              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
              : "bg-red-100 text-red-700 border-red-200"
          )}
        >
          {isCoPhep ? "Có phép" : "Không phép"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "ghi_chu_vang",
    header: "Lý do",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.ghi_chu_vang || "—"}
      </span>
    ),
  },
]

export function VangMatTab() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [loaiVang, setLoaiVang] = useState<string>("all")
  const [page, setPage] = useState(1)

  const ngayStr = format(selectedDate, "yyyy-MM-dd")

  const { data, isLoading } = useDanhSachVangMat({
    ngay: ngayStr,
    loai_vang: loaiVang === "all" ? undefined : loaiVang,
    page,
    page_size: 20,
  })

  const items = data?.data || []
  const stats = data?.metadata?.thong_ke || { tong_vang: 0, tong_co_phep: 0, tong_khong_phep: 0 }
  const totalPages = data?.metadata?.total_pages || 1

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Users}
          label="Tổng vắng mặt"
          value={stats.tong_vang}
          accent="primary"
        />
        <StatCard
          icon={CheckCircle2}
          label="Có phép"
          value={stats.tong_co_phep}
          accent="success"
        />
        <StatCard
          icon={XCircle}
          label="Không phép"
          value={stats.tong_khong_phep}
          accent="danger"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              {format(selectedDate, "dd/MM/yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d) => {
                if (d) {
                  setSelectedDate(d)
                  setPage(1)
                }
              }}
            />
          </PopoverContent>
        </Popover>

        <Select value={loaiVang} onValueChange={(v) => { setLoaiVang(v); setPage(1) }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="co_phep">Có phép</SelectItem>
            <SelectItem value="khong_phep">Không phép</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={isLoading}
        emptyMessage="Không có nhân viên vắng mặt trong ngày này"
      />

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Trước
          </Button>
          <span className="flex items-center text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  )
}
