'use client'
import { useTabStore } from '@/hooks/useTabStore'
import { useAuth } from '@/hooks/useAuth'
import { can } from '@/types'
import { StatsBar }      from '@/components/reports/StatsBar'
import { ReportsTab }    from '@/components/reports/ReportsTab'
import { InventoryTab }  from '@/components/reports/InventoryTab'
import { DownloadsTab }  from '@/components/reports/DownloadsTab'
import { TechniciansTab } from '@/components/technicians/TechniciansTab'
import { MonthlyTab }    from '@/components/monthly/MonthlyTab'
import { UsersTab }      from '@/components/users/UsersTab'

export function Dashboard() {
  const { tab }     = useTabStore()
  const { profile, loading } = useAuth()
  const role = profile?.role

  if (loading) {
    return (
      <div className="flex flex-col gap-3 mt-4">
        {[1,2,3].map(i => (
          <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: 'var(--surface2)' }} />
        ))}
      </div>
    )
  }

  // Guard: si no tiene permiso, muestra acceso denegado
  function guard(action: Parameters<typeof can>[1], component: React.ReactNode) {
    if (!can(role, action)) {
      return (
        <div className="text-center py-24" style={{ color: 'var(--text2)' }}>
          <div className="text-4xl mb-3 opacity-30">🔒</div>
          <h3 className="text-base font-medium mb-1" style={{ color: 'var(--text)' }}>Acceso restringido</h3>
          <p className="text-sm">No tienes permisos para ver esta sección.</p>
        </div>
      )
    }
    return component
  }

  return (
    <>
      <StatsBar />
      {tab === 'reportes'   && <ReportsTab />}
      {tab === 'inventario' && guard('view_all_reports',    <InventoryTab />)}
      {tab === 'descargas'  && guard('export',              <DownloadsTab />)}
      {tab === 'tecnicos'   && guard('manage_technicians',  <TechniciansTab />)}
      {tab === 'mensual'    && guard('view_monthly',        <MonthlyTab />)}
      {tab === 'usuarios'   && guard('manage_users',        <UsersTab />)}
    </>
  )
}
