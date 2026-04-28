"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { TableProperties } from "lucide-react"
import { BaoCaoFilters } from "@/types/bao-cao.types"
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender, type SortingState } from '@tanstack/react-table'
import React, { useState } from 'react'

export const NhanSuTrinhDoTab = React.memo(function NhanSuTrinhDoTab({ filters }: { filters: BaoCaoFilters }) {
  const radarOption = React.useMemo(() => ({
    tooltip: {},
    legend: { data: ['Nam', 'Nữ'] },
    radar: {
      indicator: [
        { name: 'THPT', max: 20 },
        { name: 'Cử nhân', max: 20 },
        { name: 'Thạc sĩ', max: 10 },
        { name: 'Tiến sĩ', max: 5 },
        { name: 'Chứng chỉ', max: 15 },
      ]
    },
    series: [{
      type: 'radar',
      data: [
        { value: [8, 12, 3, 1, 7], name: 'Nam', areaStyle: { opacity: 0.3 }, lineStyle: { color: '#1e40af' } },
        { value: [5, 10, 5, 2, 8], name: 'Nữ', areaStyle: { opacity: 0.3 }, lineStyle: { color: '#d97706' } },
      ]
    }],
  }), [])

  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const columns = React.useMemo(() => [
    { accessorKey: 'hoTen', header: 'Họ tên', cell: (info: any) => info.getValue() },
    { accessorKey: 'trinhDo', header: 'Trình độ', cell: (info: any) => info.getValue() },
    { accessorKey: 'chuyenNganh', header: 'Chuyên ngành', cell: (info: any) => info.getValue() },
    { accessorKey: 'namTotNghiep', header: 'Năm tốt nghiệp', cell: (info: any) => info.getValue() },
  ], [])

  const data = React.useMemo(() => [
    { hoTen: 'Nguyễn Văn A', trinhDo: 'Cử nhân', chuyenNganh: 'Toán học', namTotNghiep: 2020 },
    { hoTen: 'Trần Thị B', trinhDo: 'Thạc sĩ', chuyenNganh: 'Ngữ văn', namTotNghiep: 2018 },
    { hoTen: 'Lê Văn C', trinhDo: 'Cử nhân', chuyenNganh: 'Tiếng Anh', namTotNghiep: 2021 },
    { hoTen: 'Phạm Thị D', trinhDo: 'Tiến sĩ', chuyenNganh: 'Vật lý', namTotNghiep: 2015 },
    { hoTen: 'Hoàng Văn E', trinhDo: 'Thạc sĩ', chuyenNganh: 'Quản lý giáo dục', namTotNghiep: 2016 },
    { hoTen: 'Ngô Thị F', trinhDo: 'Cử nhân', chuyenNganh: 'Kế toán', namTotNghiep: 2019 },
    { hoTen: 'Đặng Văn G', trinhDo: 'Cử nhân', chuyenNganh: 'Hóa học', namTotNghiep: 2020 },
    { hoTen: 'Bùi Thị H', trinhDo: 'Cử nhân', chuyenNganh: 'Toán học', namTotNghiep: 2021 },
    { hoTen: 'Vũ Văn I', trinhDo: 'Thạc sĩ', chuyenNganh: 'Quản lý giáo dục', namTotNghiep: 2017 },
    { hoTen: 'Đỗ Thị K', trinhDo: 'Cử nhân', chuyenNganh: 'Kế toán', namTotNghiep: 2020 },
  ], [])

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
            Danh sách trình độ nhân sự
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TableProperties className="w-4 h-4" />
              <span className="text-sm font-medium">Danh sách trình độ nhân sự</span>
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
        <CardHeader><CardTitle className="text-base">Trình độ nhân sự (Radar Chart)</CardTitle></CardHeader>
        <CardContent><EChartsWrapper option={radarOption} height={400} /></CardContent>
      </Card>
    </div>
  )
})
