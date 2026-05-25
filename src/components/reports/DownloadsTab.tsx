'use client'
import { useEffect, useState } from 'react'
import { getReports } from '@/lib/reports'
import { exportToCSV } from '@/lib/export'
import type { Report, ReportType } from '@/types'

function today() { return new Date().toISOString().split('T')[0] }
function daysAgo(n: number) {
  const d = new Date(); d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}
function monthStart() {
  const d = new Date(); d.setDate(1)
  return d.toISOString().split('T')[0]
}

const inputCls = "px-3 py-2 rounded-lg border text-sm outline-none transition-colors"
const inputStyle = { background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }

const TYPE_LABELS: Record<string, string> = {
  config: 'Configuración', install: 'Instalación', repair: 'Reparación', toner: 'Toner',
}

// ---------- Panel de exportación general ----------
function GeneralExportPanel() {
  const [from, setFrom]     = useState('')
  const [to, setTo]         = useState('')
  const [type, setType]     = useState<ReportType | ''>('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<{ count: number; byType: Record<string, number> } | null>(null)
  const [msg, setMsg]       = useState('')

  function setRange(preset: 'day' | 'week' | 'month') {
    const map = { day: [today(), today()], week: [daysAgo(6), today()], month: [monthStart(), today()] }
    const [f, t] = map[preset]
    setFrom(f); setTo(t); setPreview(null); setMsg('')
  }

  async function handlePreview() {
    setLoading(true); setMsg(''); setPreview(null)
    try {
      const reports = await getReports({ type: type || undefined, dateFrom: from, dateTo: to })
      const byType: Record<string, number> = {}
      reports.forEach(r => { byType[r.type] = (byType[r.type] ?? 0) + 1 })
      setPreview({ count: reports.length, byType })
    } finally {
      setLoading(false)
    }
  }

  async function handleDownload() {
    setLoading(true); setMsg('')
    try {
      const reports = await getReports({ type: type || undefined, dateFrom: from, dateTo: to })
      if (!reports.length) { setMsg('Sin reportes en ese rango de fechas.'); return }
      exportToCSV(reports, `reportes-${from || 'todos'}-a-${to || 'hoy'}.csv`)
      setMsg(`${reports.length} reporte${reports.length !== 1 ? 's' : ''} exportado${reports.length !== 1 ? 's' : ''} ✓`)
      setPreview(null)
    } catch (e: unknown) {
      setMsg('Error: ' + (e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border p-6 flex flex-col gap-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div>
        <div className="text-sm font-medium mb-1">Exportación general</div>
        <p className="text-sm" style={{ color: 'var(--text2)' }}>
          Descarga todos los reportes filtrados por fecha y tipo en formato CSV, compatible con Excel y Google Sheets.
        </p>
      </div>

      {/* Quick ranges */}
      <div className="flex gap-2 flex-wrap">
        {([['day','Hoy'],['week','Esta semana'],['month','Este mes']] as const).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setRange(k)}
            className="px-3 py-1.5 rounded-lg border text-sm font-medium transition-all"
            style={{ borderColor: 'var(--border)', color: 'var(--text2)', background: 'transparent' }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium" style={{ color: 'var(--text2)' }}>Fecha inicio</label>
          <input type="date" className={inputCls} style={inputStyle}
            value={from} onChange={e => { setFrom(e.target.value); setPreview(null) }} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium" style={{ color: 'var(--text2)' }}>Fecha fin</label>
          <input type="date" className={inputCls} style={inputStyle}
            value={to} onChange={e => { setTo(e.target.value); setPreview(null) }} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium" style={{ color: 'var(--text2)' }}>Tipo</label>
          <select className={inputCls} style={inputStyle}
            value={type} onChange={e => { setType(e.target.value as ReportType | ''); setPreview(null) }}>
            <option value="">Todos</option>
            <option value="config">Configuración</option>
            <option value="install">Instalación</option>
            <option value="repair">Reparación</option>
            <option value="toner">Toner</option>
          </select>
        </div>
      </div>

      {/* Preview result */}
      {preview && (
        <div className="rounded-xl p-3 flex flex-wrap gap-3 items-center" style={{ background: 'var(--surface2)' }}>
          <span className="text-sm font-medium">{preview.count} reporte{preview.count !== 1 ? 's' : ''} encontrado{preview.count !== 1 ? 's' : ''}</span>
          <div className="flex gap-1.5 flex-wrap">
            {Object.entries(preview.byType).map(([t, n]) => (
              <span key={t} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--border)', color: 'var(--text2)' }}>
                {TYPE_LABELS[t] ?? t}: {n}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handlePreview}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all disabled:opacity-50"
          style={{ borderColor: 'var(--border)', color: 'var(--text2)', background: 'transparent' }}
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          Vista previa
        </button>
        <button
          onClick={handleDownload}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
          style={{ background: 'var(--text)', color: 'var(--bg)' }}
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          {loading ? 'Generando…' : 'Descargar CSV'}
        </button>
        {msg && (
          <span className="text-sm" style={{ color: msg.includes('Error') ? '#dc2626' : '#16a34a' }}>
            {msg}
          </span>
        )}
      </div>
    </div>
  )
}

// ---------- Panel de exportación por equipo ----------
interface EquipItem { key: string; brand: string; model: string; serial?: string; reports: Report[] }

function EquipmentExportPanel() {
  const [items, setItems] = useState<EquipItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [exporting, setExporting] = useState<string | null>(null)
  const [msg, setMsg] = useState<Record<string, string>>({})

  useEffect(() => {
    getReports().then(reports => {
      const map = new Map<string, EquipItem>()
      for (const r of reports) {
        const key = r.serial || `${r.brand}__${r.model}`
        const ex = map.get(key)
        if (ex) ex.reports.push(r)
        else map.set(key, { key, brand: r.brand, model: r.model, serial: r.serial, reports: [r] })
      }
      setItems(Array.from(map.values()).sort((a, b) => a.brand.localeCompare(b.brand)))
    }).finally(() => setLoading(false))
  }, [])

  const filtered = search.trim()
    ? items.filter(i => [i.brand, i.model, i.serial ?? ''].join(' ').toLowerCase().includes(search.toLowerCase()))
    : items

  async function exportEquip(item: EquipItem) {
    setExporting(item.key)
    const filename = `${item.brand}-${item.model}${item.serial ? '-' + item.serial : ''}.csv`
      .replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '')
    exportToCSV(item.reports, filename)
    setMsg(m => ({ ...m, [item.key]: `${item.reports.length} reportes ✓` }))
    setTimeout(() => setMsg(m => { const n = { ...m }; delete n[item.key]; return n }), 3000)
    setExporting(null)
  }

  return (
    <div className="rounded-2xl border p-6 flex flex-col gap-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div>
        <div className="text-sm font-medium mb-1">Exportar por equipo</div>
        <p className="text-sm" style={{ color: 'var(--text2)' }}>
          Descarga el historial completo de un equipo específico en CSV.
        </p>
      </div>

      <input
        type="text"
        placeholder="Buscar equipo…"
        className={inputCls + ' w-full sm:w-72'}
        style={inputStyle}
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map(i => <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: 'var(--surface2)' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm py-4 text-center" style={{ color: 'var(--text3)' }}>
          {search ? 'Sin resultados.' : 'Sin equipos registrados.'}
        </p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {filtered.map(item => (
            <div
              key={item.key}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
              style={{ background: 'var(--surface2)' }}
            >
              <span className="text-base">🖨️</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{item.brand} {item.model}</div>
                <div className="text-xs font-mono" style={{ color: 'var(--text3)' }}>
                  {item.serial ? `SN: ${item.serial}` : 'Sin serie'} · {item.reports.length} reporte{item.reports.length !== 1 ? 's' : ''}
                </div>
              </div>
              {msg[item.key] ? (
                <span className="text-xs font-medium" style={{ color: '#16a34a' }}>{msg[item.key]}</span>
              ) : (
                <button
                  onClick={() => exportEquip(item)}
                  disabled={exporting === item.key}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all disabled:opacity-50 flex-shrink-0"
                  style={{ borderColor: 'var(--border)', color: 'var(--text2)', background: 'var(--surface)' }}
                >
                  <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  CSV
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------- Tab principal ----------
export function DownloadsTab() {
  return (
    <>
      <div className="mb-5">
        <span className="text-lg font-medium tracking-tight">Descargar reportes</span>
      </div>
      <div className="flex flex-col gap-4">
        <GeneralExportPanel />
        <EquipmentExportPanel />
      </div>
    </>
  )
}
