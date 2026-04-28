"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Users, UserCheck, UserX, TrendingUp, TableProperties } from "lucide-react"
import { BaoCaoFilters } from "@/types/bao-cao.types"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender, type SortingState } from '@tanstack/react-table'
import { useState } from 'react'

interface NhanSuTongHopTabProps {
  filters: BaoCaoFilters
}

const statCards = [
  { title: "Tổng nhân sự", value: "45", icon: Users, color: "text-blue-600 bg-blue-50", change: "+2" },
  { title: "Đang làm việc", value: "42", icon: UserCheck, color: "text-emerald-600 bg-emerald-50", change: "93%" },
  { title: "Nghỉ việc", value: "3", icon: UserX, color: "text-red-600 bg-red-50", change: "-1" },
  { title: "Tuyển mới", value: "5", icon: TrendingUp, color: "text-amber-600 bg-amber-50", change: "+3" },
]

export function NhanSuTongHopTab({ filters }: NhanSuTongHopTabProps) {
  const [modalData, setModalData] = useState<{ name: string; value: number; percent?: number } | null>(null)

  const pieOption = {
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', right: 10, top: 'center' },
    series: [{
      type: 'pie', radius: ['40%', '70%'], avoidLabelOverlap: false,
      itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold' },
        itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' }
      },
      select: { itemStyle: { shadowBlur: 10, shadowColor: '#1e40af' } },
      data: [
        { value: 25, name: 'Nam', itemStyle: { color: '#1e40af' } },
        { value: 20, name: 'Nữ', itemStyle: { color: '#059669' } },
      ],
    }],
  }

  const barOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'category', data: ['Ban Giám hiệu', 'Tổ Toán', 'Tổ Văn', 'Tổ Anh', 'Tổ Lý', 'Tổ Hóa', 'Văn phòng'] },
    yAxis: { type: 'value' },
    series: [{
      type: 'bar', data: [5, 8, 7, 6, 6, 5, 8],
      itemStyle: { borderRadius: [4, 4, 0, 0], color: '#1e40af' },
      barWidth: '40%',
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(30, 64, 175, 0.5)' } }
    }],
  }

  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const columns = [
    { accessorKey: 'hoTen', header: 'Họ tên', cell: (info: any) => info.getValue() },
    { accessorKey: 'gioiTinh', header: 'Giới tính', cell: (info: any) => info.getValue() },
    { accessorKey: 'phongBan', header: 'Phòng ban', cell: (info: any) => info.getValue() },
    { accessorKey: 'chucVu', header: 'Chức vụ', cell: (info: any) => info.getValue() },
  ]

  const data = [
    { hoTen: 'Nguyễn Văn A', gioiTinh: 'Nam', phongBan: 'Tổ Toán', chucVu: 'Giáo viên' },
    { hoTen: 'Trần Thị B', gioiTinh: 'Nữ', phongBan: 'Tổ Văn', chucVu: 'Giáo viên' },
    { hoTen: 'Lê Văn C', gioiTinh: 'Nam', phongBan: 'Tổ Anh', chucVu: 'Giáo viên' },
    { hoTen: 'Phạm Thị D', gioiTinh: 'Nữ', phongBan: 'Tổ Lý', chucVu: 'Giáo viên' },
    { hoTen: 'Hoàng Văn E', gioiTinh: 'Nam', phongBan: 'Ban Giám hiệu', chucVu: 'Hiệu trưởng' },
    { hoTen: 'Ngô Thị F', gioiTinh: 'Nữ', phongBan: 'Văn phòng', chucVu: 'Thư ký' },
    { hoTen: 'Đặng Văn G', gioiTinh: 'Nam', phongBan: 'Tổ Hóa', chucVu: 'Giáo viên' },
    { hoTen: 'Bùi Thị H', gioiTinh: 'Nữ', phongBan: 'Tổ Toán', chucVu: 'Giáo viên' },
    { hoTen: 'Vũ Văn I', gioiTinh: 'Nam', phongBan: 'Tổ Văn', chucVu: 'Tổ trưởng' },
    { hoTen: 'Đỗ Thị K', gioiTinh: 'Nữ', phongBan: 'Văn phòng', chucVu: 'Kế toán' },
  ]

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.color)}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-emerald-600">{stat.change}</span>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.title}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Table Section */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TableProperties className="w-4 h-4" />
            Danh sách nhân sự
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TableProperties className="w-4 h-4" />
              <span className="text-sm font-medium">Danh sách nhân sự</span>
            </div>
            <input
              type="text"
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              placeholder="Tìm kiếm..."
              className="px-3 py-1.5 text-sm border rounded-lg w-64"
            />
          </div>
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b">
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="text-left p-2 cursor-pointer hover:bg-muted/50"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{ asc: ' ↑', desc: ' ↓' }[header.column.getIsSorted() as string] ?? null}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="border-b hover:bg-muted/30">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="p-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between mt-4 text-sm">
            <span>
              Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1 border rounded hover:bg-muted/50 disabled:opacity-50"
              >
                Trước
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1 border rounded hover:bg-muted/50 disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Cơ cấu giới tính</CardTitle>
          </CardHeader>
          <CardContent>
            <EChartsWrapper
              option={pieOption}
              height={300}
              onEvents={{
                'click': (params: any) => {
                  setModalData({ name: params.name, value: params.value, percent: params.percent })
                }
              }}
            />
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Nhân sự theo phòng ban</CardTitle>
          </CardHeader>
          <CardContent>
            <EChartsWrapper
              option={barOption}
              height={300}
              onEvents={{
                'click': (params: any) => {
                  setModalData({ name: params.name, value: params.value })
                }
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
