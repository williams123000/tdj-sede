import { supabase } from './supabase'
import type { Report, ReportInsert, ReportFilters, ReportStatus, StatusHistoryEntry } from '@/types'

export async function getReports(filters: ReportFilters = {}): Promise<Report[]> {
  let query = supabase
    .from('reports')
    .select('*, technician:technicians(id, name, email, phone, active, created_at)')
    .order('service_at', { ascending: false })

  if (filters.type)          query = query.eq('type', filters.type)
  if (filters.status)        query = query.eq('status', filters.status)
  if (filters.technician_id) query = query.eq('technician_id', filters.technician_id)
  if (filters.dateFrom)      query = query.gte('service_at', filters.dateFrom)
  if (filters.dateTo)        query = query.lte('service_at', filters.dateTo + 'T23:59:59')
  if (filters.search) {
    query = query.or(
      `requester_name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,model.ilike.%${filters.search}%,building.ilike.%${filters.search}%,serial.ilike.%${filters.search}%,requester_area.ilike.%${filters.search}%`
    )
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function createReport(report: ReportInsert, pdfFile?: File): Promise<Report> {
  let pdf_url: string | undefined

  if (pdfFile) {
    const fileName = `${Date.now()}-${pdfFile.name.replace(/\s/g, '_')}`
    const { error: uploadError } = await supabase.storage.from('report-pdfs').upload(fileName, pdfFile)
    if (uploadError) throw uploadError
    const { data: urlData } = supabase.storage.from('report-pdfs').getPublicUrl(fileName)
    pdf_url = urlData.publicUrl
  }

  const { data, error } = await supabase
    .from('reports')
    .insert({ ...report, pdf_url })
    .select('*, technician:technicians(id, name, email, phone, active, created_at)')
    .single()

  if (error) throw error

  // Registrar en historial de estados
  await supabase.from('report_status_history').insert({
    report_id: data.id,
    status: data.status,
    note: 'Reporte creado',
  })

  return data
}

export async function updateReport(id: string, report: Partial<ReportInsert>, pdfFile?: File): Promise<Report> {
  let pdf_url: string | undefined

  if (pdfFile) {
    const fileName = `${Date.now()}-${pdfFile.name.replace(/\s/g, '_')}`
    const { error: uploadError } = await supabase.storage.from('report-pdfs').upload(fileName, pdfFile)
    if (uploadError) throw uploadError
    const { data: urlData } = supabase.storage.from('report-pdfs').getPublicUrl(fileName)
    pdf_url = urlData.publicUrl
  }

  const { data, error } = await supabase
    .from('reports')
    .update({ ...report, ...(pdf_url ? { pdf_url } : {}) })
    .eq('id', id)
    .select('*, technician:technicians(id, name, email, phone, active, created_at)')
    .single()

  if (error) throw error
  return data
}

export async function updateReportStatus(id: string, status: ReportStatus, note?: string): Promise<void> {
  const { error } = await supabase.from('reports').update({ status }).eq('id', id)
  if (error) throw error

  await supabase.from('report_status_history').insert({ report_id: id, status, note })
}

export async function getStatusHistory(reportId: string): Promise<StatusHistoryEntry[]> {
  const { data, error } = await supabase
    .from('report_status_history')
    .select('*')
    .eq('report_id', reportId)
    .order('changed_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function deleteReport(id: string): Promise<void> {
  const { error } = await supabase.from('reports').delete().eq('id', id)
  if (error) throw error
}

export async function getStats() {
  const { data, error } = await supabase.from('reports').select('type, status, service_at')
  if (error) throw error

  const today = new Date().toISOString().split('T')[0]
  const counts = { config: 0, install: 0, repair: 0, toner: 0, total: 0, today: 0, pending: 0, in_progress: 0 }

  for (const r of data ?? []) {
    counts.total++
    counts[r.type as keyof typeof counts] = (counts[r.type as keyof typeof counts] as number) + 1
    if (r.service_at?.startsWith(today)) counts.today++
    if (r.status === 'pending')     counts.pending++
    if (r.status === 'in_progress') counts.in_progress++
  }

  return counts
}

export async function getMonthlyReport(year: number, month: number) {
  const from = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const to = `${year}-${String(month).padStart(2, '0')}-${lastDay}T23:59:59`

  const { data, error } = await supabase
    .from('reports')
    .select('*, technician:technicians(id, name)')
    .gte('service_at', from)
    .lte('service_at', to)
    .order('service_at', { ascending: true })

  if (error) throw error
  return data ?? []
}
