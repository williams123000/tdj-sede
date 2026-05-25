'use client'
import { useEffect, useState } from 'react'
import { getReports } from '@/lib/reports'
import type { Report } from '@/types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface InventoryItem {
  key: string
  brand: string
  model: string
  serial?: string
  total: number
  config: number
  install: number
  repair: number
  toner: number
  lastService: string
  reports: Report[]
}

function buildInventory(reports: Report[]): InventoryItem[] {
  const map = new Map<string, InventoryItem>()
  for (const r of reports) {
    const key = r.serial || `${r.brand}__${r.model}`
    const existing = map.get(key)
    if (existing) {
      existing.total++
      ;(existing[r.type as 'config' | 'install' | 'repair' | 'toner'] as number)++
      if (r.service_at > existing.lastService) existing.lastService = r.service_at
      existing.reports.push(r)
    } else {
      map.set(key, {
        key, brand: r.brand, model: r.model, serial: r.serial,
        total: 1, config: 0, install: 0, repair: 0, toner: 0,
        lastService: r.service_at,
        reports: [r],
        [r.type]: 1,
      })
    }
  }
  return Array.from(map.values()).sort((a, b) => b.lastService.localeCompare(a.lastService))
}

const TYPE_META = {
  config:  { label: 'Configuración', color: '#2563eb', bg: '#eff6ff' },
  install: { label: 'Instalación',   color: '#16a34a', bg: '#f0fdf4' },
  repair:  { label: 'Reparación',    color: '#dc2626', bg: '#fef2f2' },
  toner:   { label: 'Toner',         color: '#d97706', bg: '#fffbeb' },
} as const

const BARS = [
  { key: 'config',  color: '#2563eb' },
  { key: 'install', color: '#16a34a' },
  { key: 'repair',  color: '#dc2626' },
  { key: 'toner',   color: '#d97706' },
] as const

function MiniBar({ item }: { item: InventoryItem }) {
  if (item.total === 0) return null
  return (
    <div className="flex h-1.5 rounded-full overflow-hidden gap-px mt-3">
      {BARS.map(b => {
        const count = item[b.key] as number
        if (!count) return null
        const pct = (count / item.total) * 100
        return (
          <div key={b.key} style={{ width: `${pct}%`, background: b.color, borderRadius: 4 }} />
        )
      })}
    </div>
  )
}

function InventoryCard({ item, index }: { item: InventoryItem; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const fmtDate = (dt: string) => {
    try { return format(new Date(dt), 'dd MMM yyyy · HH:mm', { locale: es }) } catch { return dt }
  }

  return (
    <div
      className="rounded-2xl border animate-fade-up overflow-hidden transition-all duration-200"
      style={{
        background: 'var(--surface)',
        borderColor: expanded ? 'var(--border2)' : 'var(--border)',
        animationDelay: `${Math.min(index * 0.05, 0.3)}s`,
      }}
    >
      {/* Card head */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-1">
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{item.brand} {item.model}</div>
            <div className="font-mono text-xs mt-0.5" style={{ color: 'var(--text3)' }}>
              {item.serial ? `SN: ${item.serial}` : 'Sin número de serie'}
            </div>
          </div>
          <span className="text-xl ml-2 flex-shrink-0">🖨️</span>
        </div>

        <MiniBar item={item} />

        <div
          className="flex flex-col gap-0 mt-3 border-t pt-3"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex justify-between text-xs mb-1.5">
            <span style={{ color: 'var(--text2)' }}>Total reportes</span>
            <span className="font-semibold">{item.total}</span>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {BARS.map(b => {
              const count = item[b.key] as number
              if (!count) return null
              const meta = TYPE_META[b.key]
              return (
                <span
                  key={b.key}
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: meta.bg, color: meta.color }}
                >
                  {meta.label} {count}
                </span>
              )
            })}
          </div>
          <div className="flex justify-between text-xs mt-2.5">
            <span style={{ color: 'var(--text2)' }}>Último servicio</span>
            <span className="font-medium">{fmtDate(item.lastService)}</span>
          </div>
        </div>
      </div>

      {/* Toggle historial */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-2.5 text-xs font-medium border-t transition-colors"
        style={{
          borderColor: 'var(--border)',
          color: 'var(--text2)',
          background: expanded ? 'var(--surface2)' : 'transparent',
        }}
      >
        <span>Historial de servicios</span>
        <svg
          width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
          style={{ transition: 'transform 0.25s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Historial expandible */}
      <div style={{ maxHeight: expanded ? `${item.reports.length * 72 + 16}px` : '0', overflow: 'hidden', transition: 'max-height 0.35s ease' }}>
        <div className="px-4 pb-3 flex flex-col gap-1.5">
          {[...item.reports]
            .sort((a, b) => b.service_at.localeCompare(a.service_at))
            .map(r => {
              const meta = TYPE_META[r.type]
              return (
                <div
                  key={r.id}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
                  style={{ background: 'var(--surface2)' }}
                >
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                    style={{ background: meta.bg, color: meta.color }}
                  >
                    {meta.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{r.requester_name}</div>
                    <div className="text-xs truncate" style={{ color: 'var(--text3)' }}>
                      {r.building}{r.floor ? ` · P${r.floor}` : ''}
                      {r.requester_area ? ` · ${r.requester_area}` : ''}
                    </div>
                  </div>
                  <div className="text-xs flex-shrink-0 text-right" style={{ color: 'var(--text3)' }}>
                    {fmtDate(r.service_at).split('·')[0].trim()}
                  </div>
                  {r.pdf_url && (
                    <a
                      href={r.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs flex-shrink-0 font-medium"
                      style={{ color: '#2563eb' }}
                      onClick={e => e.stopPropagation()}
                    >
                      PDF
                    </a>
                  )}
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}

export function InventoryTab() {
  const [allItems, setAllItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getReports()
      .then(r => setAllItems(buildInventory(r)))
      .finally(() => setLoading(false))
  }, [])

  const items = search.trim()
    ? allItems.filter(i =>
        [i.brand, i.model, i.serial ?? ''].join(' ').toLowerCase().includes(search.toLowerCase())
      )
    : allItems

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <span className="text-lg font-medium tracking-tight">Inventario de equipos</span>
        <span className="text-sm" style={{ color: 'var(--text3)' }}>
          {items.length} equipo{items.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Search */}
      <div className="mb-5">
        <input
          type="text"
          placeholder="Buscar por marca, modelo o número de serie…"
          className="w-full sm:w-80 px-3 py-2 rounded-lg border text-sm outline-none transition-colors"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
          onFocus={e => (e.target.style.borderColor = 'var(--border2)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-52 rounded-2xl animate-pulse" style={{ background: 'var(--surface2)' }} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--text2)' }}>
          <div className="text-4xl mb-3 opacity-30">🖨️</div>
          <h3 className="text-base font-medium mb-1" style={{ color: 'var(--text)' }}>
            {search ? 'Sin resultados' : 'Sin equipos'}
          </h3>
          <p className="text-sm">
            {search ? 'Intenta con otra búsqueda.' : 'Aparecerán aquí conforme crees reportes.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item, i) => (
            <InventoryCard key={item.key} item={item} index={i} />
          ))}
        </div>
      )}
    </>
  )
}
