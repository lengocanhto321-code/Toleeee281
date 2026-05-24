import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const FONT_REGULAR = 'NotoSans'
const FONT_BOLD = 'NotoSansBold'

let fontLoaded = false

async function ensureFont(doc: jsPDF) {
  if (fontLoaded) return
  try {
    const [regularRes, boldRes] = await Promise.all([
      fetch('/fonts/NotoSans-Regular.ttf'),
      fetch('/fonts/NotoSans-Bold.ttf'),
    ])
    const [regularBuf, boldBuf] = await Promise.all([
      regularRes.arrayBuffer(),
      boldRes.arrayBuffer(),
    ])
    doc.addFileToVFS('NotoSans-Regular.ttf', arrayBufferToBase64(regularBuf))
    doc.addFont('NotoSans-Regular.ttf', FONT_REGULAR, 'normal')
    doc.addFileToVFS('NotoSans-Bold.ttf', arrayBufferToBase64(boldBuf))
    doc.addFont('NotoSans-Bold.ttf', FONT_BOLD, 'bold')
    fontLoaded = true
  } catch {
    console.warn('Failed to load Vietnamese font for PDF, using helvetica fallback')
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

export interface ReportExportData {
  title: string
  subtitle?: string
  headers: string[]
  rows: (string | number)[][]
  stats?: { label: string; value: string | number }[]
  chartImages?: string[]
}

export interface ReportSection {
  id: string
  categoryLabel: string
  label: string
  stats: { label: string; value: string | number }[]
  headers: string[]
  rows: (string | number)[][]
}

export interface MultiSectionReport {
  title: string
  subtitle?: string
  sections: ReportSection[]
}

const CATEGORY_COLORS: Record<string, { primary: string; light: string; accent: string }> = {
  'Nhân sự': { primary: '#1e40af', light: '#dbeafe', accent: '#3b82f6' },
  'Chấm công': { primary: '#047857', light: '#d1fae5', accent: '#10b981' },
  'Lương': { primary: '#b45309', light: '#fef3c7', accent: '#f59e0b' },
  'Khen thưởng': { primary: '#7c3aed', light: '#ede9fe', accent: '#8b5cf6' },
  'Xu hướng': { primary: '#dc2626', light: '#fee2e2', accent: '#ef4444' },
}

function getCatColor(label: string) {
  return CATEGORY_COLORS[label] || { primary: '#334155', light: '#f1f5f9', accent: '#64748b' }
}

function hexToRgb(hex: string): [number, number, number] {
  const cleaned = hex.replace('#', '')
  const r = parseInt(cleaned.substring(0, 2), 16)
  const g = parseInt(cleaned.substring(2, 4), 16)
  const b = parseInt(cleaned.substring(4, 6), 16)
  return [r, g, b]
}

function formatVND(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value.replace(/[.,]/g, '')) : value
  if (isNaN(num)) return String(value)
  return new Intl.NumberFormat('vi-VN').format(num)
}

export function generateMultiSheetExcel(report: MultiSectionReport, filename: string) {
  const wb = XLSX.utils.book_new()

  const overviewRows: (string | number)[][] = [['Mục', 'Chỉ số', 'Giá trị']]
  for (const section of report.sections) {
    for (const s of section.stats) {
      overviewRows.push([section.label, s.label, String(s.value)])
    }
  }
  const wsOverview = XLSX.utils.aoa_to_sheet([
    [report.title],
    report.subtitle ? [report.subtitle] : [],
    [],
    ...overviewRows,
  ])
  wsOverview['!cols'] = [{ wch: 28 }, { wch: 22 }, { wch: 20 }]
  XLSX.utils.book_append_sheet(wb, wsOverview, 'Tổng quan')

  const usedNames = new Set<string>(['Tổng quan'])

  for (const section of report.sections) {
    if (section.headers.length === 0 || section.rows.length === 0) continue
    let sheetName = section.label.substring(0, 31).replace(/[\\/?*\[\]:]/g, '')
    if (usedNames.has(sheetName)) {
      const suffix = ` (${section.categoryLabel.substring(0, 10)})`
      sheetName = (section.label + suffix).substring(0, 31).replace(/[\\/?*\[\]:]/g, '')
      if (usedNames.has(sheetName)) {
        let idx = 2
        while (usedNames.has(`${sheetName} ${idx}`)) idx++
        sheetName = `${sheetName} ${idx}`.substring(0, 31)
      }
    }
    usedNames.add(sheetName)
    const sheetData: (string | number)[][] = [
      [`${section.categoryLabel} — ${section.label}`],
      [],
      ...section.stats.map(s => [s.label, String(s.value)]),
      [],
      section.headers,
      ...section.rows,
    ]
    const ws = XLSX.utils.aoa_to_sheet(sheetData)
    ws['!cols'] = section.headers.map((_, i) => ({ wch: i === 0 ? 28 : 18 }))
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
  }

  XLSX.writeFile(wb, `${filename}.xlsx`)
}

export async function generateStyledPDF(report: MultiSectionReport, filename: string) {
  const doc = new jsPDF('p', 'mm', 'a4')
  await ensureFont(doc)

  const fontFamily = fontLoaded ? FONT_REGULAR : 'helvetica'
  const fontFamilyBold = fontLoaded ? FONT_BOLD : 'helvetica'
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 14
  const contentW = pageW - margin * 2
  let yOffset = 0

  const addHeader = () => {
    doc.setFillColor(15, 23, 42)
    doc.rect(0, 0, pageW, 38, 'F')

    doc.setFillColor(59, 130, 246)
    doc.rect(0, 36, pageW, 2, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont(fontFamilyBold, 'bold')
    doc.text(report.title, margin, 16)

    if (report.subtitle) {
      doc.setFontSize(9)
      doc.setFont(fontFamily, 'normal')
      doc.setTextColor(148, 163, 184)
      doc.text(report.subtitle, margin, 24)
    }

    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.text(
      `Xuất lúc: ${new Date().toLocaleString('vi-VN')}`,
      pageW - margin,
      32,
      { align: 'right' }
    )

    doc.setTextColor(0, 0, 0)
    yOffset = 46
  }

  addHeader()

  for (let si = 0; si < report.sections.length; si++) {
    const section = report.sections[si]
    const color = getCatColor(section.categoryLabel)

    const neededHeight = 16 + (section.stats.length > 0 ? 20 : 0) + (section.rows.length > 0 ? 20 + section.rows.length * 7 : 0)
    if (yOffset + neededHeight > 270) {
      doc.addPage()
      addHeader()
    }

    doc.setFillColor(color.primary)
    doc.roundedRect(margin, yOffset, contentW, 8, 1.5, 1.5, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.setFont(fontFamilyBold, 'bold')
    doc.text(
      `${section.categoryLabel.toUpperCase()} / ${section.label}`,
      margin + 4,
      yOffset + 5.5
    )
    yOffset += 12

    if (section.stats.length > 0) {
      const statsPerRow = 4
      const statW = contentW / statsPerRow
      const statH = 14

      for (let i = 0; i < section.stats.length; i++) {
        const col = i % statsPerRow
        const row = Math.floor(i / statsPerRow)
        const x = margin + col * statW
        const y = yOffset + row * (statH + 2)

        if (y + statH > 270) {
          doc.addPage()
          addHeader()
          yOffset = 46 + row * (statH + 2)
        }

        doc.setFillColor(color.light)
        doc.roundedRect(x + 1, yOffset + row * (statH + 2), statW - 2, statH, 1.5, 1.5, 'F')

        doc.setFontSize(7)
        doc.setFont(fontFamily, 'normal')
        doc.setTextColor(100, 116, 139)
        doc.text(section.stats[i].label, x + 4, yOffset + row * (statH + 2) + 5)

        doc.setFontSize(13)
        doc.setFont(fontFamilyBold, 'bold')
        doc.setTextColor(15, 23, 42)
        doc.text(String(section.stats[i].value), x + 4, yOffset + row * (statH + 2) + 11)
      }

      const statRows = Math.ceil(section.stats.length / statsPerRow)
      yOffset += statRows * (statH + 2) + 4
    }

    if (section.headers.length > 0 && section.rows.length > 0) {
      if (yOffset > 240) {
        doc.addPage()
        addHeader()
      }

      autoTable(doc, {
        startY: yOffset,
        head: [section.headers],
        body: section.rows.map(r => r.map(String)),
        theme: 'striped',
        headStyles: {
          fillColor: hexToRgb(color.primary),
          textColor: 255,
          fontSize: 7.5,
          fontStyle: 'bold',
          font: fontFamilyBold,
          cellPadding: 3,
        },
        bodyStyles: {
          fontSize: 7.5,
          font: fontFamily,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: hexToRgb(color.light),
        },
        margin: { left: margin, right: margin },
        tableWidth: contentW,
      })
      yOffset = (doc as any).lastAutoTable.finalY + 8
    }

    yOffset += 4
  }

  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setDrawColor(226, 232, 240)
    doc.line(margin, 287, pageW - margin, 287)
    doc.setFontSize(7)
    doc.setFont(fontFamily, 'normal')
    doc.setTextColor(148, 163, 184)
    doc.text(`Trang ${i}/${pageCount}`, margin, 292)
    doc.text('THPT Thăng Long', pageW - margin, 292, { align: 'right' })
  }

  doc.save(`${filename}.pdf`)
}

export function buildMultiSectionPreviewHtml(report: MultiSectionReport): string {
  const sectionsHtml = report.sections.map(section => {
    const color = getCatColor(section.categoryLabel)

    const statsHtml = section.stats.length > 0
      ? `<div class="stats-grid">
          ${section.stats.map(s =>
            `<div class="stat-card" style="border-color:${color.accent}30;background:${color.light}">
              <div class="stat-label">${s.label}</div>
              <div class="stat-value" style="color:${color.primary}">${s.value}</div>
            </div>`
          ).join('')}
        </div>`
      : ''

    const tableHtml = section.headers.length > 0 && section.rows.length > 0
      ? `<table class="data-table">
          <thead><tr>${section.headers.map(h =>
            `<th style="background:${color.primary}">${h}</th>`
          ).join('')}</tr></thead>
          <tbody>${section.rows.slice(0, 50).map((row, ri) =>
            `<tr style="background:${ri % 2 === 0 ? '#fff' : color.light + '60'}">${row.map(cell =>
              `<td>${cell}</td>`
            ).join('')}</tr>`
          ).join('')}</tbody>
        </table>`
      : ''

    return `<div class="report-section">
      <div class="section-header" style="background:${color.primary}">
        <span class="section-cat">${section.categoryLabel.toUpperCase()}</span>
        <span class="section-divider"></span>
        <span class="section-title">${section.label}</span>
      </div>
      <div class="section-body">
        ${statsHtml}
        ${tableHtml}
      </div>
    </div>`
  }).join('')

  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Be Vietnam Pro', -apple-system, sans-serif;
    color: #0f172a;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .page-header {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    padding: 32px 40px 28px;
    position: relative;
    overflow: hidden;
  }
  .page-header::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
  }
  .page-header h1 {
    font-size: 26px;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.02em;
    margin-bottom: 6px;
  }
  .page-header .subtitle {
    font-size: 13px;
    color: #94a3b8;
    font-weight: 400;
  }
  .page-header .meta {
    position: absolute;
    top: 32px;
    right: 40px;
    text-align: right;
  }
  .page-header .meta-label {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #475569;
    margin-bottom: 2px;
  }
  .page-header .meta-value {
    font-size: 11px;
    color: #94a3b8;
    font-family: 'JetBrains Mono', monospace;
  }

  .content { padding: 28px 40px; }

  .report-section {
    margin-bottom: 28px;
    page-break-inside: avoid;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }
  .report-section:last-child { margin-bottom: 0; }

  .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 18px;
    color: #fff;
  }
  .section-cat {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    opacity: 0.8;
  }
  .section-divider {
    width: 1px;
    height: 14px;
    background: rgba(255,255,255,0.3);
  }
  .section-title {
    font-size: 14px;
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  .section-body { padding: 16px 18px; }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 8px;
    margin-bottom: 14px;
  }
  .stat-card {
    border: 1px solid;
    border-radius: 8px;
    padding: 10px 14px;
  }
  .stat-label {
    font-size: 10px;
    color: #64748b;
    margin-bottom: 3px;
    font-weight: 500;
  }
  .stat-value {
    font-size: 20px;
    font-weight: 800;
    letter-spacing: -0.02em;
    font-family: 'JetBrains Mono', monospace;
  }

  .data-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 11px;
    margin-top: 8px;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
  }
  .data-table th {
    color: #fff;
    font-weight: 600;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 8px 12px;
    text-align: left;
  }
  .data-table td {
    padding: 7px 12px;
    border-top: 1px solid #f1f5f9;
    color: #334155;
  }
  .data-table tr:last-child td { border-bottom: none; }

  .footer {
    margin-top: 32px;
    padding: 14px 40px;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 9px;
    color: #94a3b8;
    font-family: 'JetBrains Mono', monospace;
  }

  @media print {
    body { -webkit-print-color-adjust: exact; }
    .report-section { page-break-inside: avoid; break-inside: avoid; }
  }
</style>
</head>
<body>
  <div class="page-header">
    <h1>${report.title}</h1>
    ${report.subtitle ? `<div class="subtitle">${report.subtitle}</div>` : ''}
    <div class="meta">
      <div class="meta-label">Xuất báo cáo</div>
      <div class="meta-value">${new Date().toLocaleString('vi-VN')}</div>
    </div>
  </div>
  <div class="content">
    ${sectionsHtml}
  </div>
  <div class="footer">
    <span>THPT Thang Long</span>
    <span>Trang tong hop</span>
  </div>
</body>
</html>`
}

export function buildPreviewHtml(data: ReportExportData): string {
  const report: MultiSectionReport = {
    title: data.title,
    subtitle: data.subtitle,
    sections: [{
      id: 'main',
      categoryLabel: 'Báo cáo',
      label: data.title,
      stats: data.stats || [],
      headers: data.headers,
      rows: data.rows,
    }],
  }
  return buildMultiSectionPreviewHtml(report)
}

export function generateExcel(data: ReportExportData, filename: string) {
  const report: MultiSectionReport = {
    title: data.title,
    subtitle: data.subtitle,
    sections: [{
      id: 'main',
      categoryLabel: 'Báo cáo',
      label: data.title,
      stats: data.stats || [],
      headers: data.headers,
      rows: data.rows,
    }],
  }
  generateMultiSheetExcel(report, filename)
}

export async function generatePDF(data: ReportExportData, filename: string) {
  const report: MultiSectionReport = {
    title: data.title,
    subtitle: data.subtitle,
    sections: [{
      id: 'main',
      categoryLabel: 'Báo cáo',
      label: data.title,
      stats: data.stats || [],
      headers: data.headers,
      rows: data.rows,
    }],
  }
  generateStyledPDF(report, filename)
}

export async function generatePDFFromHtml(_htmlContent: string, filename: string) {
  console.warn('generatePDFFromHtml is deprecated — use generateStyledPDF or generatePDF instead')
  generateStyledPDF({ title: 'Bao cao', sections: [] }, filename)
}

export function captureVisibleCharts(): string[] {
  const canvases = document.querySelectorAll<HTMLCanvasElement>(
    '[data-slot="bao-cao-content"] canvas'
  )
  const images: string[] = []
  canvases.forEach((canvas) => {
    try {
      if (canvas.width > 0 && canvas.height > 0) {
        images.push(canvas.toDataURL('image/png'))
      }
    } catch {}
  })
  return images
}
