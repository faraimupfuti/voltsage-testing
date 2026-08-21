import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const BLUE: [number, number, number] = [27, 23, 255]
const INK: [number, number, number] = [15, 23, 42]
const INK_MUTED: [number, number, number] = [71, 85, 105]
const INK_FAINT: [number, number, number] = [148, 163, 184]
const BORDER: [number, number, number] = [226, 232, 240]
const SURFACE: [number, number, number] = [248, 250, 252]

let cachedLogo: string | null | undefined

async function loadLogoDataUrl(): Promise<string | null> {
  if (cachedLogo !== undefined) return cachedLogo
  try {
    const res = await fetch('/logo.png')
    const blob = await res.blob()
    cachedLogo = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch {
    cachedLogo = null
  }
  return cachedLogo
}

export interface ReportMetric { label: string; value: string; unit?: string }
export interface ReportTable { title: string; head: string[]; body: (string | number)[][] }
export interface SizingReportOptions {
  toolName: string
  subtitle: string
  location?: string
  mode?: 'standard' | 'advanced'
  metrics: ReportMetric[]
  highlight?: string
  chartImage?: string | null
  chartCaption?: string
  tables?: ReportTable[]
  disclaimer?: string
}

export async function generateSizingReportPDF(opts: SizingReportOptions) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 48
  let y = 50

  const logo = await loadLogoDataUrl()

  // ---- Header band ----
  if (logo) {
    try {
      const props = doc.getImageProperties(logo)
      const h = 26
      const w = (props.width / props.height) * h
      doc.addImage(logo, 'PNG', margin, y - 16, w, h)
    } catch {
      /* if the logo can't be embedded, continue without it */
    }
  } else {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(15)
    doc.setTextColor(...INK)
    doc.text('VOLTSAGE', margin, y)
  }
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...INK_FAINT)
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  doc.text(dateStr, pageW - margin, y - 4, { align: 'right' })
  doc.setFontSize(8)
  doc.text('Sizing Report', pageW - margin, y + 8, { align: 'right' })

  y += 26
  doc.setDrawColor(...BLUE)
  doc.setLineWidth(1.4)
  doc.line(margin, y, pageW - margin, y)
  y += 30

  // ---- Title block ----
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(19)
  doc.setTextColor(...INK)
  doc.text(opts.toolName, margin, y)
  y += 17
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...INK_MUTED)
  const subtitleLines = doc.splitTextToSize(opts.subtitle, pageW - margin * 2)
  doc.text(subtitleLines, margin, y)
  y += subtitleLines.length * 12 + 6

  doc.setFontSize(8.5)
  doc.setTextColor(...INK_FAINT)
  const metaBits: string[] = []
  if (opts.location) metaBits.push(`Location: ${opts.location}`)
  if (opts.mode) metaBits.push(`Mode: ${opts.mode === 'advanced' ? 'Advanced' : 'Standard'}`)
  if (metaBits.length) { doc.text(metaBits.join('   ·   '), margin, y); y += 14 }
  y += 14

  // ---- Results metrics grid ----
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10.5)
  doc.setTextColor(...INK)
  doc.text('RESULTS', margin, y)
  y += 5
  doc.setDrawColor(...BORDER)
  doc.setLineWidth(0.8)
  doc.line(margin, y, pageW - margin, y)
  y += 22

  const colGap = 20
  const colW = (pageW - margin * 2 - colGap) / 2
  opts.metrics.forEach((m, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = margin + col * (colW + colGap)
    const yy = y + row * 44
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...INK_FAINT)
    doc.text(m.label.toUpperCase(), x, yy)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.setTextColor(...BLUE)
    doc.text(`${m.value}${m.unit ? ' ' + m.unit : ''}`, x, yy + 16)
  })
  const metricRows = Math.ceil(opts.metrics.length / 2)
  y += metricRows * 44 + 6

  if (opts.highlight) {
    doc.setFillColor(...SURFACE)
    const boxH = 26
    doc.roundedRect(margin, y, pageW - margin * 2, boxH, 5, 5, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...INK_MUTED)
    doc.text(opts.highlight, margin + 12, y + 16)
    y += boxH + 20
  } else {
    y += 12
  }

  // ---- Chart image ----
  if (opts.chartImage) {
    if (y > pageH - 200) { doc.addPage(); y = 50 }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.setTextColor(...INK)
    doc.text((opts.chartCaption || '24-HOUR LOAD PROFILE').toUpperCase(), margin, y)
    y += 5
    doc.setDrawColor(...BORDER)
    doc.line(margin, y, pageW - margin, y)
    y += 14
    try {
      const imgW = pageW - margin * 2
      const imgH = imgW * 0.32
      doc.addImage(opts.chartImage, 'PNG', margin, y, imgW, imgH)
      y += imgH + 24
    } catch {
      /* skip chart if it fails to embed */
    }
  }

  // ---- Tables ----
  for (const t of opts.tables || []) {
    if (!t.body.length) continue
    if (y > pageH - 140) { doc.addPage(); y = 50 }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.setTextColor(...INK)
    doc.text(t.title.toUpperCase(), margin, y)
    y += 8
    autoTable(doc, {
      startY: y,
      head: [t.head],
      body: t.body,
      margin: { left: margin, right: margin },
      styles: { font: 'helvetica', fontSize: 8, textColor: INK_MUTED, lineColor: BORDER, lineWidth: 0.5, cellPadding: 5 },
      headStyles: { fillColor: INK, textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
      alternateRowStyles: { fillColor: SURFACE },
    })
    // @ts-expect-error jspdf-autotable augments doc at runtime
    y = doc.lastAutoTable.finalY + 26
  }

  // ---- Disclaimer ----
  if (y > pageH - 90) { doc.addPage(); y = 50 }
  doc.setDrawColor(...BORDER)
  doc.line(margin, y, pageW - margin, y)
  y += 16
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  doc.setTextColor(...INK_FAINT)
  const disclaimer = opts.disclaimer ||
    'Final system sizing and equipment selection should be reviewed and verified by a qualified Engineer or Solar Design Professional before installation. This report is generated for preliminary planning purposes only.'
  const discLines = doc.splitTextToSize(disclaimer, pageW - margin * 2)
  doc.text(discLines, margin, y)

  // ---- Footer on every page ----
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...INK_FAINT)
    doc.text('VoltSage Solutions', margin, pageH - 24)
    doc.text(`Page ${i} of ${pageCount}`, pageW - margin, pageH - 24, { align: 'right' })
  }

  const fileSlug = opts.toolName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  doc.save(`voltsage-${fileSlug}-report.pdf`)
}
