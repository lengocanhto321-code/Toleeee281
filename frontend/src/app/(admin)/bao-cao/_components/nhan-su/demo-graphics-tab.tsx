"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { TableProperties } from "lucide-react"
import { BaoCaoFilters } from "@/types/bao-cao.types"
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender, type SortingState } from '@tanstack/react-table'
import { useState } from 'react'

export function NhanSuDemoGraphicsTab({ filters }: { filters: BaoCaoFilters }) {
  const stackedBarOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['22-30 tuổi', '31-40 tuổi', '41-50 tuổi', '51+ tuổi'] },
    xAxis: { type: 'category', data: ['THPT', 'Cử nhân', 'Thạc sĩ', 'Tiến sĩ'] },
    yAxis: { type: 'value' },
    series: [
      { name: '22-30 tuổi', type: 'bar', stack: 'total', data: [5, 8, 3, 0], color: '#1e40af' },
      { name: '31-40 tuổi', type: 'bar', stack: 'total', data: [3, 10, 5, 1], color: '#059669' },
      { name: '41-50 tuổi', type: 'bar', stack: 'total', data: [1, 5, 3, 2], color: '#d97706' },
      { name: '51+ tuổi', type: 'bar', stack: 'total', data: [0, 2, 1, 1], color: '#7c3aed' },
    ],
  }

  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const columns = [
    { accessorKey: 'hoTen', header: 'Họ tên', cell: (info: any) => info.getValue() },
    { accessorKey: 'doTuoi', header: 'Độ tuổi', cell: (info: any) => info.getValue() },
    { accessorKey: 'trinhDo', header: 'Trình độ', cell: (info: any) => info.getValue() },
    { accessorKey: 'phongBan', header: 'Phòng ban', cell: (info: any) => info.getValue() },
  ]

  const data = [
    { hoTen: 'Nguyễn Văn A', doTuoi: '22-30', trinhDo: 'Cử nhân', phongBan: 'Tổ Toán' },
    { hoTen: 'Trần Thị B', doTuoi: '31-40', trinhDo: 'Cử nhân', phongBan: 'Tổ Văn' },
    { hoTen: 'Lê Văn C', doTuoi: '22-30', trinhDo: 'Cử nhân', phongBan: 'Tổ Anh' },
    { hoTen: 'Phạm Thị D', doTuoi: '31-40', trinhDo: 'Thạc sĩ', phongBan: 'Tổ Lý' },
    { hoTen: 'Hoàng Văn E', doTuoi: '41-50', trinhDo: 'Thạc sĩ', phongBan: 'Ban Giám hiệu' },
    { hoTen: 'Ngô Thị F', doTuoi: '22-30', trinhDo: 'Cử nhân', phongBan: 'Văn phòng' },
    { hoTen: 'Đặng Văn G', doTuoi: '31-40', trinhDo: 'Cử nhân', phongBan: 'Tổ Hóa' },
    { hoTen: 'Bùi Thị H', doTuoi: '22-30', trinhDo: 'Cử nhân', phongBan: 'Tổ Toán' },
    { hoTen: 'Vũ Văn I', doTuoi: '41-50', trinhDo: 'Thạc sĩ', phongBan: 'Tổ Văn' },
    { hoTen: 'Đỗ Thị K', doTuoi: '22-30', trinhDo: 'Cử nhân', phongBan: 'Văn phòng' },
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
      {/* Table Section */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TableProperties className="w-4 h-4" />
            Danh sách nhân sự theo trình độ và độ tuổi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TableProperties className="w-4 h-4" />
              <span className="text-sm font-medium">Danh sách nhân sự theo trình độ và độ tuổi</span>
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
      <Card className="border-border/50 shadow-sm">
        <CardHeader><CardTitle className="text-base">Nhân sự theo trình độ và độ tuổi</CardTitle></CardHeader>
        <CardContent><EChartsWrapper option={stackedBarOption} height={400} /></CardContent>
      </Card>
    </div>
  )
}
