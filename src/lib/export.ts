import type { Report } from '@/types'
import { TYPE_META } from '@/types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function exportToCSV(reports: Report[], filename = 'reportes-printlog.csv') {
  const headers = [
    'Tipo', 'Fecha', 'Hora',
    'Nombre', 'Área', 'Edificio', 'Piso', 'Ubicación',
    'Marca', 'Modelo', 'Número de Serie',
    'Modelo Toner', 'Cant. Toner', 'Contador', 'Desc. Toner',
    'Comentarios', 'PDF',
  ]

  const rows = reports.map(r => {
    const d = new Date(r.service_at)
    return [
      TYPE_META[r.type]?.label ?? r.type,
      format(d, 'dd/MM/yyyy', { locale: es }),
      format(d, 'HH:mm', { locale: es }),
      r.requester_name,
      r.requester_area ?? '',
      r.building ?? '',
      r.floor ?? '',
      r.location ?? '',
      r.brand,
      r.model,
      r.serial ?? '',
      r.toner_model ?? '',
      r.toner_qty ?? '',
      r.toner_counter ?? '',
      r.toner_desc ?? '',
      r.comments ?? '',
      r.pdf_url ?? '',
    ].map(v => `"${String(v).replace(/"/g, '""')}"`)
  })

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
