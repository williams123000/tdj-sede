'use client'
import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Report, ReportStatus } from '@/types'
import { TYPE_META, STATUS_META } from '@/types'
import { updateReportStatus, getStatusHistory } from '@/lib/reports'
import type { StatusHistoryEntry } from '@/types'

function StatusBadge({ status }: { status: ReportStatus }) {
  const m = STATUS_META[status]
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
      style={{ background: m.bg, color: m.color }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: m.dot }} />
      {m.label}
    </span>
  )
}

function Field({ label, value, mono }: { label: string; value?: string | number | null; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs" style={{ color: 'var(--text3)' }}>{label}</span>
      <span className={`text-sm ${mono ? 'font-mono text-xs' : ''}`} style={{ color: 'var(--text)' }}>
        {value ?? '—'}
      </span>
    </div>
  )
}

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="text-xs font-semibold uppercase tracking-wide pb-2 border-b"
        style={{ color: 'var(--text3)', borderColor: 'var(--border)' }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function StatusChanger({ reportId, current, onChange }: {
  reportId: string; current: ReportStatus; onChange: () => void
}) {
  const [open, setOpen]       = useState(false)
  const [note, setNote]       = useState('')
  const [selected, setSelected] = useState<ReportStatus>(current)
  const [saving, setSaving]   = useState(false)

  const STATUSES = Object.entries(STATUS_META) as [ReportStatus, typeof STATUS_META[ReportStatus]][]

  async function save() {
    if (selected === current) { setOpen(false); return }
    setSaving(true)
    try {
      await updateReportStatus(reportId, selected, note.trim() || undefined)
      onChange()
      setOpen(false)
      setNote('')
    } finally { setSaving(false) }
  }

  return (
    <div className="relative">
      <button
        onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
        className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border transition-all whitespace-nowrap"
        style={{ borderColor: 'var(--border)', color: 'var(--text2)', background: 'transparent' }}
      >
        <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        Estado
      </button>

      {open && (
        <div
          className="absolute right-0 top-8 z-20 rounded-xl border p-3 w-56 shadow-lg"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text3)' }}>Cambiar estado</div>
          <div className="flex flex-col gap-1 mb-3">
            {STATUSES.map(([s, m]) => (
              <button key={s} onClick={() => setSelected(s)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-sm transition-all"
                style={{
                  background: selected === s ? m.bg : 'transparent',
                  color: selected === s ? m.color : 'var(--text2)',
                }}>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: m.dot }} />
                {m.label}
              </button>
            ))}
          </div>
          <input type="text" placeholder="Nota (opcional)"
            className="w-full px-2.5 py-1.5 rounded-lg border text-xs outline-none mb-2"
            style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
            value={note} onChange={e => setNote(e.target.value)} />
          <div className="flex gap-1.5">
            <button onClick={() => setOpen(false)}
              className="flex-1 px-2 py-1.5 rounded-lg border text-xs"
              style={{ borderColor: 'var(--border)', color: 'var(--text2)' }}>
              Cancelar
            </button>
            <button onClick={save} disabled={saving}
              className="flex-1 px-2 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50"
              style={{ background: 'var(--text)', color: 'var(--bg)' }}>
              {saving ? '…' : 'Guardar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusTimeline({ reportId }: { reportId: string }) {
  const [history, setHistory] = useState<StatusHistoryEntry[] | null>(null)
  const [loading, setLoading] = useState(false)

  async function load() {
    if (history !== null) return
    setLoading(true)
    try { setHistory(await getStatusHistory(reportId)) }
    finally { setLoading(false) }
  }

  return (
    <div className="col-span-full">
      <button onClick={load} className="text-xs font-medium mb-2 flex items-center gap-1"
        style={{ color: 'var(--text3)' }}>
        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        Historial de estados
      </button>
      {loading && <div className="h-4 w-32 rounded animate-pulse" style={{ background: 'var(--surface2)' }} />}
      {history && (
        <div className="flex flex-col gap-0">
          {history.map((h, i) => {
            const m = STATUS_META[h.status]
            return (
              <div key={h.id} className="flex gap-3 items-start">
                <div className="flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0" style={{ background: m.dot }} />
                  {i < history.length - 1 && (
                    <div className="w-px flex-1 min-h-[18px]" style={{ background: 'var(--border)' }} />
                  )}
                </div>
                <div className="pb-3 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium" style={{ color: m.color }}>{m.label}</span>
                    <span className="text-xs" style={{ color: 'var(--text3)' }}>
                      {format(new Date(h.changed_at), "dd MMM · HH:mm", { locale: es })}
                    </span>
                  </div>
                  {h.note && <p className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>{h.note}</p>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

interface Props {
  report: Report
  index: number
  onEdit: () => void
  onDelete: () => void
  onStatusChange: () => void
}

export function ReportCard({ report: r, index, onEdit, onDelete, onStatusChange }: Props) {
  const [expanded,   setExpanded]   = useState(false)
  const [confirming, setConfirming] = useState(false)

  const meta  = TYPE_META[r.type]
  const delay = Math.min(index * 0.04, 0.3)

  const fmtDate = (dt: string) => {
    try { return format(new Date(dt), "dd MMM yyyy · HH:mm", { locale: es }) }
    catch { return dt }
  }

  function handleDelete() {
    if (!confirming) { setConfirming(true); return }
    onDelete()
  }

  return (
    <div
      className="rounded-2xl border transition-all duration-200 animate-fade-up"
      style={{
        background: 'var(--surface)',
        borderColor: expanded ? 'var(--border2)' : 'var(--border)',
        animationDelay: `${delay}s`,
      }}
    >
      {/* ── Header ── */}
      <div className="flex items-start gap-3 px-4 py-3.5 cursor-pointer"
        onClick={() => setExpanded(e => !e)}>

        {/* Icono tipo */}
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0 mt-0.5"
          style={{ background: meta.bg }}>
          {meta.icon}
        </div>

        {/* Info principal — ocupa todo el espacio disponible */}
        <div className="flex-1 min-w-0">
          {/* Línea 1: título + badge estado */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{meta.label} — {r.brand} {r.model}</span>
            <StatusBadge status={r.status} />
          </div>
          {/* Línea 2: meta info */}
          <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--text2)' }}>
            {r.requester_name}
            {r.building && ` · ${r.building}`}
            {r.floor && ` P${r.floor}`}
            {r.technician && ` · 👤 ${r.technician.name}`}
            {' · '}{fmtDate(r.service_at)}
          </div>
          {/* Línea 3: botones de acción — en su propia línea en móvil */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap"
            onClick={e => e.stopPropagation()}>
            {r.pdf_url && (
              <a href={r.pdf_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs font-medium"
                style={{ borderColor: 'var(--border)', color: 'var(--text2)' }}>
                <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                PDF
              </a>
            )}
            <StatusChanger reportId={r.id} current={r.status} onChange={onStatusChange} />
            <button onClick={onEdit}
              className="px-2.5 py-1 rounded-md border text-xs font-medium"
              style={{ borderColor: 'var(--border)', color: 'var(--text2)' }}>
              Editar
            </button>
            <button onClick={handleDelete} onBlur={() => setConfirming(false)}
              className="px-2.5 py-1 rounded-md border text-xs font-medium transition-all"
              style={{
                borderColor: confirming ? '#dc2626' : 'transparent',
                color: '#dc2626',
                background: confirming ? '#fef2f2' : 'transparent',
              }}>
              {confirming ? '¿Confirmar?' : 'Borrar'}
            </button>
          </div>
        </div>

        {/* Chevron */}
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
          style={{
            width: 16, height: 16, flexShrink: 0, color: 'var(--text3)', marginTop: 4,
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s',
          }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* ── Body expandido ── */}
      <div style={{
        maxHeight: expanded ? '1000px' : '0',
        overflow: 'hidden',
        transition: 'max-height 0.35s ease',
        borderTop: expanded ? `1px solid var(--border)` : 'none',
      }}>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <FieldGroup title="Solicitante">
            <Field label="Nombre"    value={r.requester_name} />
            <Field label="Área"      value={r.requester_area} />
            <Field label="Edificio"  value={r.building ? `${r.building}${r.floor ? ` · Piso ${r.floor}` : ''}` : undefined} />
            <Field label="Ubicación" value={r.location} />
          </FieldGroup>

          <FieldGroup title="Equipo">
            <Field label="Marca"           value={r.brand} />
            <Field label="Modelo"          value={r.model} />
            <Field label="Número de serie" value={r.serial} mono />
            <Field label="Fecha y hora"    value={fmtDate(r.service_at)} />
          </FieldGroup>

          <FieldGroup title="Servicio">
            <Field label="Tipo"    value={meta.label} />
            <Field label="Técnico" value={r.technician?.name} />
            <Field label="Estado"  value={STATUS_META[r.status].label} />
          </FieldGroup>

          {r.type === 'toner' && (
            <FieldGroup title="Toner">
              <Field label="Modelo"      value={r.toner_model} />
              <Field label="Cantidad"    value={r.toner_qty} />
              <Field label="Contador"    value={r.toner_counter?.toLocaleString()} mono />
              <Field label="Descripción" value={r.toner_desc} />
            </FieldGroup>
          )}

          {r.comments && (
            <div className="col-span-full rounded-lg p-3" style={{ background: 'var(--surface2)' }}>
              <div className="text-xs mb-1" style={{ color: 'var(--text3)' }}>Comentarios</div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>{r.comments}</p>
            </div>
          )}

          <StatusTimeline reportId={r.id} />
        </div>
      </div>
    </div>
  )
}