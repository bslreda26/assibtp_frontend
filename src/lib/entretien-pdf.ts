import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { APP_NAME, APP_TAGLINE, BRAND_PDF } from '@/lib/brand'
import { formatDate, formatFcfa, numberValue } from '@/lib/format'
import type { EntretienExterne, EntretienLocal } from '@/types/entretien'

const MARGIN = 16
const PAGE_WIDTH = 210
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2

const { black: BLACK, yellow: YELLOW, yellowLight: YELLOW_LIGHT, yellowSoft: YELLOW_SOFT, white: WHITE, muted: TEXT_MUTED, border: BORDER } = BRAND_PDF
const TEXT_DARK = BLACK

type LineRow = {
  label: string
  reference: string
  quantite: number
  prixUnitaire: number
}

type PdfContext = {
  doc: jsPDF
  title: string
  reference: string
  metaRows: [string, string][]
  lines: LineRow[]
  description?: string | null
  filename: string
  totalOverride?: number
}

function getTableFinalY(doc: jsPDF): number {
  return (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY
}

function drawPageBackground(doc: jsPDF) {
  doc.setFillColor(...WHITE)
  doc.rect(0, 0, PAGE_WIDTH, doc.internal.pageSize.getHeight(), 'F')
}

function drawHeader(doc: jsPDF, title: string, reference: string) {
  doc.setFillColor(...BLACK)
  doc.rect(0, 0, PAGE_WIDTH, 50, 'F')

  doc.setFillColor(...YELLOW)
  doc.rect(0, 0, PAGE_WIDTH, 4, 'F')

  doc.setFillColor(...WHITE)
  doc.roundedRect(MARGIN, 12, CONTENT_WIDTH, 32, 3, 3, 'F')
  doc.setDrawColor(...YELLOW)
  doc.setLineWidth(0.6)
  doc.roundedRect(MARGIN, 12, CONTENT_WIDTH, 32, 3, 3, 'S')

  doc.setFillColor(...YELLOW)
  doc.rect(MARGIN, 12, 6, 32, 'F')

  doc.setTextColor(...BLACK)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text(APP_NAME, MARGIN + 14, 24)

  doc.setFontSize(11)
  doc.text(title, MARGIN + 14, 32)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...TEXT_MUTED)
  doc.text(reference, MARGIN + 14, 38)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...BLACK)
  const dateStr = formatDate(new Date().toISOString(), 'dd/MM/yyyy')
  doc.text(`Émis le ${dateStr}`, PAGE_WIDTH - MARGIN - 4, 24, { align: 'right' })
}

function drawSectionTitle(doc: jsPDF, number: string, label: string, y: number): number {
  doc.setFillColor(...YELLOW_LIGHT)
  doc.setDrawColor(...BLACK)
  doc.setLineWidth(0.2)
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 9, 2, 2, 'FD')

  doc.setFillColor(...BLACK)
  doc.circle(MARGIN + 5, y + 4.5, 3.5, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text(number, MARGIN + 5, y + 5.2, { align: 'center' })

  doc.setFontSize(10)
  doc.setTextColor(...TEXT_DARK)
  doc.setTextColor(...TEXT_DARK)
  doc.text(label, MARGIN + 12, y + 6)

  return y + 13
}

function drawInfoGrid(doc: jsPDF, rows: [string, string][], startY: number): number {
  const colWidth = (CONTENT_WIDTH - 6) / 2
  const rowHeight = 11
  const rowsPerCol = Math.ceil(rows.length / 2)
  const boxH = rowsPerCol * rowHeight + 10

  doc.setFillColor(...WHITE)
  doc.setDrawColor(...BORDER)
  doc.roundedRect(MARGIN, startY, CONTENT_WIDTH, boxH, 2, 2, 'FD')

  rows.forEach(([label, value], index) => {
    const col = index % 2
    const row = Math.floor(index / 2)
    const x = MARGIN + 6 + col * (colWidth + 3)
    const y = startY + 8 + row * rowHeight

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...TEXT_MUTED)
    doc.text(label.toUpperCase(), x, y)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...TEXT_DARK)
    const valueLines = doc.splitTextToSize(value, colWidth - 4)
    doc.text(valueLines, x, y + 4.5)
  })

  return startY + boxH + 8
}

function drawDescriptionBlock(doc: jsPDF, description: string, startY: number): number {
  const padding = 6
  const textLines = doc.splitTextToSize(description, CONTENT_WIDTH - padding * 2 - 4)
  const boxH = textLines.length * 4.5 + padding * 2 + 4

  doc.setFillColor(...YELLOW_LIGHT)
  doc.setDrawColor(...BORDER)
  doc.roundedRect(MARGIN, startY, CONTENT_WIDTH, boxH, 2, 2, 'FD')

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...TEXT_DARK)
  doc.text(textLines, MARGIN + padding, startY + padding + 4)

  return startY + boxH + 8
}

function drawSummaryBox(doc: jsPDF, total: number, lineCount: number, startY: number) {
  const boxW = 88
  const boxH = 32
  const x = PAGE_WIDTH - MARGIN - boxW

  doc.setFillColor(...YELLOW)
  doc.roundedRect(x, startY, boxW, boxH, 3, 3, 'F')
  doc.setFillColor(...WHITE)
  doc.roundedRect(x + 2, startY + 2, boxW - 4, boxH - 4, 2, 2, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...TEXT_MUTED)
  doc.text('RÉCAPITULATIF', x + 6, startY + 9)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...TEXT_DARK)
  doc.text(`${lineCount} ligne${lineCount > 1 ? 's' : ''}`, x + 6, startY + 16)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...BLACK)
  doc.text('TOTAL TTC', x + 6, startY + 23)

  doc.setFontSize(13)
  doc.setTextColor(...TEXT_DARK)
  doc.text(formatFcfa(total), x + boxW - 6, startY + 26, { align: 'right' })
}

function drawFooter(doc: jsPDF) {
  const pageH = doc.internal.pageSize.getHeight()
  const footerY = pageH - 14

  doc.setFillColor(...YELLOW_LIGHT)
  doc.rect(0, footerY - 4, PAGE_WIDTH, 18, 'F')
  doc.setDrawColor(...YELLOW)
  doc.setLineWidth(0.8)
  doc.line(0, footerY - 4, PAGE_WIDTH, footerY - 4)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...TEXT_MUTED)
  doc.text(
    `Document généré le ${formatDate(new Date().toISOString(), 'dd/MM/yyyy à HH:mm')}`,
    MARGIN,
    footerY + 2
  )
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BLACK)
  doc.text(`${APP_NAME} — ${APP_TAGLINE}`, PAGE_WIDTH - MARGIN, footerY + 2, {
    align: 'right',
  })
}

function buildEntretienPdf(ctx: PdfContext) {
  const { doc, lines, description, filename } = ctx
  const lineSum = lines.reduce((sum, l) => sum + l.quantite * l.prixUnitaire, 0)
  const total = ctx.totalOverride ?? lineSum

  drawPageBackground(doc)
  drawHeader(doc, ctx.title, ctx.reference)

  let y = 56

  y = drawSectionTitle(doc, '1', 'Informations générales', y)
  y = drawInfoGrid(doc, ctx.metaRows, y)

  if (description?.trim()) {
    y = drawSectionTitle(doc, '2', 'Description des travaux', y)
    y = drawDescriptionBlock(doc, description.trim(), y)
  }

  const sectionNum = description?.trim() ? '3' : '2'
  y = drawSectionTitle(doc, sectionNum, 'Détail des prestations et coûts', y)

  autoTable(doc, {
    startY: y,
    head: [['N°', 'Désignation', 'Réf.', 'Qté', 'Prix unit.', 'Montant']],
    body: lines.map((l, i) => [
      String(i + 1),
      l.label,
      l.reference,
      String(l.quantite),
      formatFcfa(l.prixUnitaire),
      formatFcfa(l.quantite * l.prixUnitaire),
    ]),
    foot: [['', '', '', '', 'TOTAL GÉNÉRAL', formatFcfa(total)]],
    styles: {
      fontSize: 9,
      cellPadding: { top: 3, right: 3, bottom: 3, left: 3 },
      textColor: TEXT_DARK,
      lineColor: BORDER,
      lineWidth: 0.15,
    },
    headStyles: {
      fillColor: BLACK,
      textColor: WHITE,
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 8,
    },
    bodyStyles: {
      fillColor: WHITE,
    },
    alternateRowStyles: {
      fillColor: YELLOW_LIGHT,
    },
    footStyles: {
      fillColor: YELLOW_SOFT,
      textColor: TEXT_DARK,
      fontStyle: 'bold',
      fontSize: 10,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 52 },
      2: { cellWidth: 24, halign: 'center' },
      3: { cellWidth: 12, halign: 'center' },
      4: { cellWidth: 32, halign: 'right' },
      5: { cellWidth: 34, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: MARGIN, right: MARGIN },
    theme: 'grid',
  })

  y = getTableFinalY(doc) + 8
  drawSummaryBox(doc, total, lines.length, y)

  drawFooter(doc)
  doc.save(filename)
}

function buildMetaRows(
  entretien: EntretienLocal | EntretienExterne,
  extras: [string, string][]
): [string, string][] {
  return [
    ['Référence', `N° ${entretien.id}`],
    ['Date d\'entretien', formatDate(entretien.dateEntretien)],
    ['Statut', entretien.statut === 'TERMINE' ? 'Terminé' : entretien.statut],
    ...extras,
  ]
}

export function exportEntretienLocalPdf(entretien: EntretienLocal) {
  const lines: LineRow[] =
    entretien.lignes?.map((l) => ({
      label: l.piece?.nom ?? `Pièce #${l.pieceId}`,
      reference: l.piece?.reference ?? '—',
      quantite: l.quantite,
      prixUnitaire: numberValue(l.piece?.prixUnitaire),
    })) ?? []

  const total = lines.reduce((sum, l) => sum + l.quantite * l.prixUnitaire, 0)

  buildEntretienPdf({
    doc: new jsPDF(),
    title: 'Bon d\'entretien local',
    reference: `Document officiel — ${formatDate(entretien.dateEntretien)}`,
    metaRows: buildMetaRows(entretien, [
      ['Grue', entretien.grue?.nom ?? `#${entretien.grueId}`],
      ['Technicien', entretien.technicien ?? '—'],
      ['Type', 'Entretien interne (stock)'],
      ['Coût total', formatFcfa(total)],
    ]),
    lines,
    description: entretien.description,
    filename: `entretien-local-${entretien.id}.pdf`,
    totalOverride: total,
  })
}

export function exportEntretienExternePdf(entretien: EntretienExterne) {
  const lines: LineRow[] =
    entretien.lignes?.map((l) => ({
      label: l.descriptionPiece,
      reference: '—',
      quantite: l.quantite,
      prixUnitaire: numberValue(l.prixUnitaire),
    })) ?? []

  buildEntretienPdf({
    doc: new jsPDF(),
    title: 'Bon d\'entretien externe',
    reference: `Document officiel — ${formatDate(entretien.dateEntretien)}`,
    metaRows: buildMetaRows(entretien, [
      ['Grue', entretien.grue?.nom ?? `#${entretien.grueId}`],
      ['Fournisseur', entretien.fournisseur?.nom ?? `#${entretien.fournisseurId}`],
      ['Type', 'Entretien externe'],
      ['Coût total', formatFcfa(numberValue(entretien.coutTotal))],
    ]),
    lines,
    description: entretien.description,
    filename: `entretien-externe-${entretien.id}.pdf`,
    totalOverride: numberValue(entretien.coutTotal) || undefined,
  })
}
