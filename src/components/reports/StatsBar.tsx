'use client'
import { useEffect } from 'react'
import { useStats } from '@/hooks/useReports'
import { onReportsChange } from '@/lib/events'

function StatCard({
  label, value, color, delay, badge, badgeBg, badgeColor,
}: {
  label: string; value: number; color?: string; delay?: string
  badge?: string; badgeBg?: string; badgeColor?: string
}) {
  return (
    <div
      className={`rounded-xl border p-4 animate-fade-up ${delay ?? ''}`}
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text3)' }}>
        {label}
      </div>
      <div className="text-3xl font-medium tracking-tight font-mono" style={{ color: color ?? 'var(--text)' }}>
        {value}
      </div>
      {badge && (
        <div className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: badgeBg, color: badgeColor }}>
          {badge}
        </div>
      )}
    </div>
  )
}

export function StatsBar() {
  const { stats, refetch } = useStats()
  useEffect(() => onReportsChange(refetch), [refetch])

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
      <StatCard label="Total"       value={stats.total}       delay="delay-1" />
      <StatCard label="Config."     value={stats.config}      delay="delay-2" color="#2563eb" />
      <StatCard label="Instalación" value={stats.install}     delay="delay-3" color="#16a34a" />
      <StatCard label="Reparación"  value={stats.repair}      delay="delay-4" color="#dc2626" />
      <StatCard label="Toner"       value={stats.toner}       delay="delay-5" color="#d97706"
        badge={`${stats.today} hoy`} badgeBg="#fffbeb" badgeColor="#d97706" />
      <StatCard label="Pendientes"  value={stats.pending}     delay="delay-5" color="#d97706"
        badge="⚠" badgeBg="#fffbeb" badgeColor="#d97706" />
      <StatCard label="En proceso"  value={stats.in_progress} delay="delay-5" color="#2563eb"
        badge="●" badgeBg="#eff6ff" badgeColor="#2563eb" />
    </div>
  )
}
