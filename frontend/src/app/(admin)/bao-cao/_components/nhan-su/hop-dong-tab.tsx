"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EChartsWrapper } from "@/components/ui/echarts-wrapper"
import { TableProperties } from "lucide-react"
import { BaoCaoFilters } from "@/types/bao-cao.types"
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender, type SortingState } from '@tanstack/react-table'
import { useState } from 'react'

export function HopDongTab({ filters }: { filters: BaoCaoFilters }) {
  const pieOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', right: 10, top: 'center' },
    series: [{
      type: 'pie', radius: ['30%', '60%'],
      data: [
        { value: 25, name: 'Hợp đồng xác định thời hạn', itemStyle: { color: '#1e40af' } },
        { value: 15, name: 'Hợp đồng không xác định thời hạn', itemStyle: { color: '#059669' } },
        { value: 3, name: 'Hợp đồng thử việc', itemStyle: { color: '#d97706' } },
        { value: 2, name: 'Hợp đồng thời vụ', itemStyle: { color: '#7c3aed' } },
      ],
    }],
  }

  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const columns = [
    { accessorKey: 'hoTen', header: 'Họ tên', cell: (info: any) => info.getValue() },
    { accessorKey: 'loaiHopDong', header: 'Loại hợp đồng', cell: (info: any) => info.getValue() },
    { accessorKey: 'ngayBatDau', header: 'Ngày bắt đầu', cell: (info: any) => info.getValue() },
    { accessorKey: 'ngayKetThuc', header: 'Ngày kết thúc', cell: (info: any) => info.getValue() },
  ]

  const data = [
    { hoTen: 'Nguyễn Văn A', loaiHopDong: 'Xác định thời hạn', ngayBatDau: '01/01/2024', ngayKetThuc: '31/12/2025' },
    { hoTen: 'Trần Thị B', loaiHopDong: 'Không xác định thời hạn', ngayBatDau: '01/06/2023', ngayKetThuc: 'N/A' },
    { hoTen: 'Lê Văn C', loaiHopDong: 'Xác định thời hạn', ngayBatDau: '15/08/2024', ngayKetThuc: '14/08/2026' },
    { hoTen: 'Phạm Thị D', loaiHopDong: 'Không xác định thời hạn', ngayBatDau: '01/09/2022', ngayKetThuc: 'N/A' },
    { hoTen: 'Hoàng Văn E', loaiHopDong: 'Không xác định thời hạn', ngayBatDau: '01/01/2020', ngayKetThuc: 'N/A' },
    { hoTen: 'Ngô Thị F', loaiHopDong: 'Xác định thời hạn', ngayBatDau: '01/03/2024', ngayKetThuc: '28/02/2026' },
    { hoTen: 'Đặng Văn G', loaiHopDong: 'Thử việc', ngayBatDau: '01/12/2024', ngayKetThuc: '30/05/2025' },
    { hoTen: 'Bùi Thị H', loaiHopDong: 'Xác định thời hạn', ngayBatDau: '01/09/2024', ngayKetThuc: '31/08/2026' },
    { hoTen: 'Vũ Văn I', loaiHopDong: 'Không xác định thời hạn', ngayBatDau: '01/01/2021', ngayKetThuc: 'N/A' },
    { hoTen: 'Đỗ Thị K', loaiHopDong: 'Xác định thời hạn', ngayBatDau: '15/10/2024', ngayKetThuc: '14/10/2026' },
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
            Danh sách hợp đồng nhân sự
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TableProperties className="w-4 h-4" />
              <span className="text-sm font-medium">Danh sách hợp đồng nhân sự</span>
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
        <CardHeader><CardTitle className="text-base">Nhân sự theo loại hợp đồng</CardTitle></CardHeader>
        <CardContent><EChartsWrapper option={pieOption} height={400} /></CardContent>
      </Card>
    </div>
  )
}
