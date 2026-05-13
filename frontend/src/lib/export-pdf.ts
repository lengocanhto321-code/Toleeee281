import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface ExportPDFOptions {
  title: string
  subtitle?: string
  filters?: Record<string, string>
  columns: { header: string; key: string }[]
  data: Record<string, any>[]
  filename?: string
}

export function exportToPDF({
  title,
  subtitle,
  filters,
  columns,
  data,
  filename,
}: ExportPDFOptions) {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(16)
  doc.text("Truong THPT Thang Long", 14, 20)
  doc.setFontSize(14)
  doc.text(title, 14, 30)

  if (subtitle) {
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(subtitle, 14, 37)
    doc.setTextColor(0)
  }

  // Date
  doc.setFontSize(9)
  doc.text(`Ngay xuat: ${new Date().toLocaleDateString("vi-VN")}`, 14, subtitle ? 44 : 37)

  // Filters
  let startY = subtitle ? 50 : 43
  if (filters) {
    doc.setFontSize(9)
    Object.entries(filters).forEach(([key, value]) => {
      doc.text(`${key}: ${value}`, 14, startY)
      startY += 5
    })
    startY += 3
  }

  // Table
  autoTable(doc, {
    startY,
    head: [columns.map((c) => c.header)],
    body: data.map((row) =>
      columns.map((c) => {
        const val = row[c.key]
        if (typeof val === "number" && c.key.toLowerCase().includes("luong")) {
          return formatCurrency(val)
        }
        if (typeof val === "number" && c.key.toLowerCase().includes("tien")) {
          return formatCurrency(val)
        }
        return String(val ?? "")
      })
    ),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [99, 102, 241], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 14, right: 14 },
  })

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(`Trang ${i} / ${pageCount}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10)
  }

  const fname = filename || title.toLowerCase().replace(/\s+/g, "-")
  doc.save(`${fname}.pdf`)
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value)
}
