'use client'
import { useTabStore, type Tab } from '@/hooks/useTabStore'
import { useAuth } from '@/hooks/useAuth'
import { signOut } from '@/lib/auth'
import { can, ROLE_META } from '@/types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function Navbar() {
  const { tab, setTab }  = useTabStore()
  const { profile }      = useAuth()
  const router           = useRouter()
  const role             = profile?.role
  const [menuOpen, setMenuOpen] = useState(false)

  const TABS: { id: Tab; label: string; show: boolean }[] = [
    { id: 'reportes',   label: 'Reportes',   show: true },
    { id: 'inventario', label: 'Inventario', show: can(role, 'view_all_reports') },
    { id: 'tecnicos',   label: 'Técnicos',   show: can(role, 'manage_technicians') },
    { id: 'usuarios',   label: 'Usuarios',   show: can(role, 'manage_users') },
    { id: 'mensual',    label: 'Mensual',    show: can(role, 'view_monthly') },
    { id: 'descargas',  label: 'Descargar',  show: can(role, 'export') },
  ]

  const visibleTabs = TABS.filter(t => t.show)
  const rm = role ? ROLE_META[role] : null

  async function handleSignOut() {
    await signOut()
    window.location.href = '/login'
  }

  function selectTab(id: Tab) {
    setTab(id)
    setMenuOpen(false)
  }

  return (
    <>
      <nav
        className="sticky top-0 z-50 border-b"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 h-14 gap-3">

          {/* Logo */}
          <div className="flex items-center gap-2 text-sm font-semibold tracking-tight flex-shrink-0">
            <span className="w-2 h-2 rounded-full animate-pulse-dot"
              style={{ background: 'var(--text)' }} />
            TDJ Insurgentes Sede
          </div>

          {/* Tabs — desktop */}
          <div className="hidden md:flex gap-1 flex-1 justify-center">
            {visibleTabs.map(t => (
              <button
                key={t.id}
                onClick={() => selectTab(t.id)}
                className="nav-tab px-3 py-1.5 rounded-lg text-sm font-normal transition-all duration-200 whitespace-nowrap"
                data-active={tab === t.id ? 'true' : 'false'}
                style={
                  tab === t.id
                    ? { background: 'var(--text)', color: 'var(--bg)' }
                    : { background: 'transparent', color: 'var(--text2)' }
                }
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* User info — desktop */}
            {profile && (
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-medium leading-tight">{profile.full_name}</span>
                {rm && (
                  <span className="text-xs font-medium leading-tight" style={{ color: rm.color }}>
                    {rm.label}
                  </span>
                )}
              </div>
            )}

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              title="Cerrar sesión"
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
              style={{ background: 'var(--surface2)', color: 'var(--text2)' }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>

            {/* Hamburger — mobile */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--surface2)', color: 'var(--text2)' }}
            >
              {menuOpen ? (
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              ) : (
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M3 12h18M3 6h18M3 18h18"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t px-4 py-3 flex flex-col gap-1"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>

            {/* User info mobile */}
            {profile && rm && (
              <div className="flex items-center gap-2 px-3 py-2 mb-1 rounded-lg"
                style={{ background: 'var(--surface2)' }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{ background: rm.bg, color: rm.color }}>
                  {profile.full_name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-medium">{profile.full_name}</div>
                  <div className="text-xs" style={{ color: rm.color }}>{rm.label}</div>
                </div>
              </div>
            )}

            {visibleTabs.map(t => (
              <button
                key={t.id}
                onClick={() => selectTab(t.id)}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all"
                style={
                  tab === t.id
                    ? { background: 'var(--text)', color: 'var(--bg)', fontWeight: 500 }
                    : { color: 'var(--text2)' }
                }
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </nav>
    </>
  )
}