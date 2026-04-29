import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export interface ReportExportData {
  title: string
  subtitle?: string
  headers: string[]
  rows: (string | number)[][]
  stats?: { label: string; value: string | number }[]
}

export function generateExcel(data: ReportExportData, filename: string) {
  const wb = XLSX.utils.book_new()

  if (data.stats && data.stats.length > 0) {
    const statsRows = data.stats.map(s => [s.label, String(s.value)])
    const wsStats = XLSX.utils.aoa_to_sheet([
      [data.title],
      data.subtitle ? [data.subtitle] : [],
      [],
      ['Chỉ số', 'Giá trị'],
      ...statsRows,
    ])
    wsStats['!cols'] = [{ wch: 25 }, { wch: 20 }]
    XLSX.utils.book_append_sheet(wb, wsStats, 'Thống kê')
  }

  const wsData = XLSX.utils.aoa_to_sheet([
    [data.title],
    data.subtitle ? [data.subtitle] : [],
    [],
    data.headers,
    ...data.rows,
  ])
  wsData['!cols'] = data.headers.map(() => ({ wch: 18 }))
  XLSX.utils.book_append_sheet(wb, wsData, 'Dữ liệu')

  XLSX.writeFile(wb, `${filename}.xlsx`)
}

export function generatePDF(data: ReportExportData, filename: string) {
  const doc = new jsPDF()

  doc.setFontSize(16)
  doc.text(data.title, 14, 20)

  if (data.subtitle) {
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(data.subtitle, 14, 28)
    doc.setTextColor(0)
  }

  let yOffset = data.subtitle ? 36 : 30
  if (data.stats && data.stats.length > 0) {
    doc.setFontSize(11)
    doc.text('Tổng quan:', 14, yOffset)
    yOffset += 6

    const statsRows = data.stats.map(s => [s.label, String(s.value)])
    autoTable(doc, {
      startY: yOffset,
      head: [['Chỉ số', 'Giá trị']],
      body: statsRows,
      theme: 'grid',
      headStyles: { fillColor: [30, 64, 175], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    })
    yOffset = (doc as any).lastAutoTable.finalY + 10
  }

  if (data.headers.length > 0 && data.rows.length > 0) {
    doc.setFontSize(11)
    doc.text('Chi tiết:', 14, yOffset)
    yOffset += 6

    autoTable(doc, {
      startY: yOffset,
      head: [data.headers],
      body: data.rows.map(row => row.map(String)),
      theme: 'striped',
      headStyles: { fillColor: [30, 64, 175], textColor: 255, fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
      alternateRowStyles: { fillColor: [240, 245, 255] },
    })
  }

  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(
      `Trang ${i}/${pageCount} | Xuất lúc ${new Date().toLocaleString('vi-VN')}`,
      14,
      doc.internal.pageSize.height - 10
    )
  }

  doc.save(`${filename}.pdf`)
}
