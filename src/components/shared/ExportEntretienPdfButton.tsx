import { FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { exportEntretienExternePdf, exportEntretienLocalPdf } from '@/lib/entretien-pdf'
import type { EntretienExterne, EntretienLocal } from '@/types/entretien'

type Props =
  | { type: 'local'; entretien: EntretienLocal }
  | { type: 'externe'; entretien: EntretienExterne }

export function ExportEntretienPdfButton({ type, entretien }: Props) {
  if (entretien.statut !== 'TERMINE') return null

  const handleExport = () => {
    if (type === 'local') exportEntretienLocalPdf(entretien)
    else exportEntretienExternePdf(entretien)
  }

  return (
    <Button variant="outline" onClick={handleExport}>
      <FileDown className="size-4" />
      Exporter PDF
    </Button>
  )
}
