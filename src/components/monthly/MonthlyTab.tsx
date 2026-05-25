'use client'
import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getMonthlyReport } from '@/lib/reports'
import { exportToCSV } from '@/lib/export'
import type { Report } from '@/types'
import { TYPE_META, STATUS_META } from '@/types'

function Pill({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium"
      style={{ background: bg, color }}>
      {label}
    </span>
  )
}

function SummaryRow({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b text-sm last:border-0"
      style={{ borderColor: 'var(--border)' }}>
      <span style={{ color: 'var(--text2)' }}>{label}</span>
      <span className="font-medium font-mono" style={{ color: color ?? 'var(--text)' }}>{value}</span>
    </div>
  )
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100)
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ background: 'var(--surface2)', height: 6 }}>
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

function buildSummary(reports: Report[]) {
  const byType: Record<string, number> = {}
  const byStatus: Record<string, number> = {}
  const byTechnician: Record<string, { name: string; count: number }> = {}
  const byDay: Record<string, number> = {}

  for (const r of reports) {
    byType[r.type] = (byType[r.type] ?? 0) + 1
    byStatus[r.status] = (byStatus[r.status] ?? 0) + 1

    const techId = r.technician_id ?? 'none'
    const techName = (r.technician as { name?: string } | undefined)?.name ?? 'Sin asignar'
    if (!byTechnician[techId]) byTechnician[techId] = { name: techName, count: 0 }
    byTechnician[techId].count++

    const day = r.service_at.slice(0, 10)
    byDay[day] = (byDay[day] ?? 0) + 1
  }

  const techList = Object.values(byTechnician).sort((a, b) => b.count - a.count)
  const maxTech = Math.max(...techList.map(t => t.count), 1)

  return { byType, byStatus, techList, maxTech, byDay, total: reports.length }
}

export function MonthlyTab() {
  const now = new Date()
  const [year,  setYear]  = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try { setReports(await getMonthlyReport(year, month)) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [year, month])

  useEffect(() => { load() }, [load])

  const summary = buildSummary(reports)

  const monthLabel = format(new Date(year, month - 1, 1), 'MMMM yyyy', { locale: es })

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  function handleExport() {
    exportToCSV(reports, `reporte-mensual-${year}-${String(month).padStart(2,'0')}.csv`)
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <span className="text-lg font-medium tracking-tight">Reporte mensual</span>
        <button
          onClick={handleExport}
          disabled={reports.length === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-30"
          style={{ background: 'var(--text)', color: 'var(--bg)' }}
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Exportar CSV
        </button>
      </div>

      {/* Month selector */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={prevMonth}
          className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all hover:opacity-70"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span className="text-base font-medium capitalize min-w-[160px] text-center tracking-tight">{monthLabel}</span>
        <button onClick={nextMonth}
          className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all hover:opacity-70"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-48 rounded-2xl animate-pulse" style={{ background: 'var(--surface2)' }} />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-24" style={{ color: 'var(--text2)' }}>
          <div className="text-4xl mb-3 opacity-30">📊</div>
          <h3 className="text-base font-medium mb-1" style={{ color: 'var(--text)' }}>Sin reportes en {monthLabel}</h3>
          <p className="text-sm">Prueba con otro mes.</p>
        </div>
      ) : (
        <>
          {/* Cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">

            {/* Total */}
            <div className="rounded-2xl border p-5 animate-fade-up delay-1"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text3)' }}>
                Resumen del mes
              </div>
              <div className="text-5xl font-medium tracking-tight font-mono mb-1">{summary.total}</div>
              <div className="text-sm mb-4" style={{ color: 'var(--text3)' }}>reportes en total</div>
              <SummaryRow label="Días con actividad"
                value={Object.keys(summary.byDay).length} />
              <SummaryRow label="Promedio diario"
                value={Math.round(summary.total / Math.max(Object.keys(summary.byDay).length, 1))} />
            </div>

            {/* Por tipo */}
            <div className="rounded-2xl border p-5 animate-fade-up delay-2"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text3)' }}>
                Por tipo de servicio
              </div>
              {Object.entries(TYPE_META).map(([type, m]) => {
                const count = summary.byType[type] ?? 0
                return (
                  <div key={type} className="mb-3 last:mb-0">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{m.icon} {m.label}</span>
                      <span className="font-mono font-medium" style={{ color: m.color }}>{count}</span>
                    </div>
                    <Bar value={count} max={summary.total} color={m.color} />
                  </div>
                )
              })}
            </div>

            {/* Por estado */}
            <div className="rounded-2xl border p-5 animate-fade-up delay-3"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text3)' }}>
                Por estado
              </div>
              {Object.entries(STATUS_META).map(([status, m]) => {
                const count = summary.byStatus[status] ?? 0
                if (!count) return null
                return (
                  <div key={status} className="mb-3 last:mb-0">
                    <div className="flex justify-between text-sm mb-1">
                      <Pill label={m.label} color={m.color} bg={m.bg} />
                      <span className="font-mono font-medium">{count}</span>
                    </div>
                    <Bar value={count} max={summary.total} color={m.dot} />
                  </div>
                )
              })}
            </div>

            {/* Por técnico */}
            {summary.techList.length > 0 && (
              <div className="rounded-2xl border p-5 animate-fade-up delay-4 sm:col-span-2 lg:col-span-3"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: 'var(--text3)' }}>
                  Actividad por técnico
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {summary.techList.map(t => (
                    <div key={t.name}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium">👤 {t.name}</span>
                        <span className="font-mono font-medium">{t.count}</span>
                      </div>
                      <Bar value={t.count} max={summary.maxTech} color="var(--text)" />
                      <div className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
                        {Math.round((t.count / summary.total) * 100)}% del total
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tabla detallada */}
          <div className="rounded-2xl border overflow-hidden animate-fade-up delay-5"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <span className="text-sm font-medium">Detalle de reportes</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'var(--surface2)' }}>
                    {['Fecha', 'Tipo', 'Estado', 'Técnico', 'Solicitante', 'Equipo', 'Edificio'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wide"
                        style={{ color: 'var(--text3)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r, i) => {
                    const tm = TYPE_META[r.type]
                    const sm = STATUS_META[r.status]
                    return (
                      <tr key={r.id} className="border-t transition-colors"
                        style={{
                          borderColor: 'var(--border)',
                          background: i % 2 === 0 ? 'transparent' : 'var(--surface2)',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                        onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'var(--surface2)')}
                      >
                        <td className="px-4 py-2.5 whitespace-nowrap font-mono text-xs" style={{ color: 'var(--text2)' }}>
                          {format(new Date(r.service_at), 'dd MMM · HH:mm', { locale: es })}
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: tm.bg, color: tm.color }}>
                            {tm.icon} {tm.label}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                            style={{ background: sm.bg, color: sm.color }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: sm.dot }} />
                            {sm.label}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap text-xs" style={{ color: 'var(--text2)' }}>
                          {(r.technician as { name?: string } | undefined)?.name ?? '—'}
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap text-xs">{r.requester_name}</td>
                        <td className="px-4 py-2.5 whitespace-nowrap text-xs">{r.brand} {r.model}</td>
                        <td className="px-4 py-2.5 whitespace-nowrap text-xs" style={{ color: 'var(--text2)' }}>
                          {r.building ?? '—'}{r.floor ? ` P${r.floor}` : ''}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  )
}
