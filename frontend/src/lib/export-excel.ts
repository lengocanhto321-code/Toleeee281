import * as XLSX from "xlsx"
import { saveAs } from "file-saver"

interface ExportExcelOptions {
  sheets: {
    name: string
    data: Record<string, any>[]
  }[]
  filename: string
}

export function exportToExcel({ sheets, filename }: ExportExcelOptions) {
  const workbook = XLSX.utils.book_new()

  sheets.forEach((sheet) => {
    const worksheet = XLSX.utils.json_to_sheet(sheet.data)

    // Auto-size columns
    if (sheet.data.length > 0) {
      const cols = Object.keys(sheet.data[0]).map((key) => {
        const maxLen = Math.max(
          key.length,
          ...sheet.data.map((row) => String(row[key] ?? "").length)
        )
        return { wch: Math.min(maxLen + 2, 40) }
      })
      worksheet["!cols"] = cols
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name)
  })

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
  saveAs(blob, `${filename}.xlsx`)
}
