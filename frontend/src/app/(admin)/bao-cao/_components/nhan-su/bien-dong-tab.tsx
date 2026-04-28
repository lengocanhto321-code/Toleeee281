"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { TableProperties } from "lucide-react"
import { BaoCaoFilters } from "@/types/bao-cao.types"
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender, type SortingState } from '@tanstack/react-table'
import React, { useState } from 'react'

export const NhanSuBienDongTab = React.memo(function NhanSuBienDongTab({ filters }: { filters: BaoCaoFilters }) {
  const lineOption = React.useMemo(() => ({
    tooltip: { trigger: 'axis' },
    legend: { data: ['Tuyển mới', 'Nghỉ việc', 'Tổng nhân sự'] },
    xAxis: { type: 'category', data: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'] },
    yAxis: { type: 'value' },
    series: [
      { name: 'Tuyển mới', type: 'line', data: [2, 3, 1, 5, 2, 4, 3, 2, 1, 3, 2, 1], smooth: true, color: '#1e40af' },
      { name: 'Nghỉ việc', type: 'line', data: [1, 0, 2, 1, 1, 0, 1, 2, 1, 0, 1, 1], smooth: true, color: '#dc2626' },
      { name: 'Tổng nhân sự', type: 'line', data: [40, 43, 42, 46, 47, 51, 53, 53, 52, 55, 56, 56], smooth: true, color: '#059669' },
    ],
  }), [])

  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const columns = React.useMemo(() => [
    { accessorKey: 'thang', header: 'Tháng', cell: (info: any) => info.getValue() },
    { accessorKey: 'tuyenMoi', header: 'Tuyển mới', cell: (info: any) => info.getValue() },
    { accessorKey: 'nghiViec', header: 'Nghỉ việc', cell: (info: any) => info.getValue() },
    { accessorKey: 'tongNhanSu', header: 'Tổng nhân sự', cell: (info: any) => info.getValue() },
  ], [])

  const data = React.useMemo(() => [
    { thang: 'T1', tuyenMoi: 2, nghiViec: 1, tongNhanSu: 40 },
    { thang: 'T2', tuyenMoi: 3, nghiViec: 0, tongNhanSu: 43 },
    { thang: 'T3', tuyenMoi: 1, nghiViec: 2, tongNhanSu: 42 },
    { thang: 'T4', tuyenMoi: 5, nghiViec: 1, tongNhanSu: 46 },
    { thang: 'T5', tuyenMoi: 2, nghiViec: 1, tongNhanSu: 47 },
    { thang: 'T6', tuyenMoi: 4, nghiViec: 0, tongNhanSu: 51 },
    { thang: 'T7', tuyenMoi: 3, nghiViec: 1, tongNhanSu: 53 },
    { thang: 'T8', tuyenMoi: 2, nghiViec: 2, tongNhanSu: 53 },
    { thang: 'T9', tuyenMoi: 1, nghiViec: 1, tongNhanSu: 52 },
    { thang: 'T10', tuyenMoi: 3, nghiViec: 0, tongNhanSu: 55 },
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
            Danh sách biến động nhân sự
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TableProperties className="w-4 h-4" />
              <span className="text-sm font-medium">Danh sách biến động nhân sự</span>
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
        <CardHeader><CardTitle className="text-base">Biến động nhân sự theo tháng</CardTitle></CardHeader>
        <CardContent><EChartsWrapper option={lineOption} height={400} /></CardContent>
      </Card>
    </div>
  )
})
