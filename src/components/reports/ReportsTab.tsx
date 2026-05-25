'use client'
import { useState, useEffect } from 'react'
import { useReports } from '@/hooks/useReports'
import { getTechnicians } from '@/lib/technicians'
import { ReportCard } from './ReportCard'
import { ReportModal } from './ReportModal'
import { notifyReportsChange } from '@/lib/events'
import type { Report, ReportFilters, ReportType, ReportStatus, Technician } from '@/types'

export function ReportsTab() {
  const [filters, setFilters] = useState<ReportFilters>({})
  const [modalOpen, setModalOpen] = useState(false)
  const [editReport, setEditReport] = useState<Report | undefined>()
  const [technicians, setTechnicians] = useState<Technician[]>([])

  useEffect(() => { getTechnicians().then(setTechnicians).catch(console.error) }, [])

  const { reports, loading, error, refetch, remove } = useReports(filters)

  function openNew() { setEditReport(undefined); setModalOpen(true) }
  function openEdit(r: Report) { setEditReport(r); setModalOpen(true) }

  function onSaved() {
    setModalOpen(false)
    refetch()
    notifyReportsChange()
  }

  async function onDelete(id: string) {
    await remove(id)
    notifyReportsChange()
  }

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <span className="text-lg font-medium tracking-tight">Reportes</span>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
          style={{ background: 'var(--text)', color: 'var(--bg)' }}
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nuevo reporte
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap mb-6">
        <input
          type="text"
          placeholder="Buscar nombre, edificio, modelo…"
          className="flex-1 min-w-[160px] px-3 py-2 rounded-lg border text-sm outline-none"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
          onFocus={e => (e.currentTarget.style.borderColor = 'var(--border2)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
        />
        <select
          className="px-3 py-2 rounded-lg border text-sm outline-none"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
          onChange={e => setFilters(f => ({ ...f, type: e.target.value as ReportType | '' }))}
        >
          <option value="">Todos los tipos</option>
          <option value="config">Configuración</option>
          <option value="install">Instalación</option>
          <option value="repair">Reparación</option>
          <option value="toner">Toner</option>
        </select>
        <select
          className="px-3 py-2 rounded-lg border text-sm outline-none"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value as ReportStatus | '' }))}
        >
          <option value="">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="in_progress">En proceso</option>
          <option value="completed">Completado</option>
          <option value="closed">Cerrado</option>
        </select>
        {technicians.length > 0 && (
          <select
            className="px-3 py-2 rounded-lg border text-sm outline-none"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
            onChange={e => setFilters(f => ({ ...f, technician_id: e.target.value || undefined }))}
          >
            <option value="">Todos los técnicos</option>
            {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        )}
      </div>

      {error && (
        <div className="text-sm px-4 py-3 rounded-lg mb-4" style={{ background: '#fef2f2', color: '#dc2626' }}>
          Error: {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-2.5">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: 'var(--surface2)' }} />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--text2)' }}>
          <div className="text-4xl mb-3 opacity-30">📋</div>
          <h3 className="text-base font-medium mb-1" style={{ color: 'var(--text)' }}>Sin reportes</h3>
          <p className="text-sm">Crea tu primer reporte con el botón de arriba.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {reports.map((r, i) => (
            <ReportCard key={r.id} report={r} index={i}
              onEdit={() => openEdit(r)}
              onDelete={() => onDelete(r.id)}
              onStatusChange={refetch}
            />
          ))}
        </div>
      )}

      <ReportModal open={modalOpen} report={editReport}
        onClose={() => setModalOpen(false)} onSaved={onSaved} />
    </>
  )
}
