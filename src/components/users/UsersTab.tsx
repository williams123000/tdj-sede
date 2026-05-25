'use client'
import { useState, useEffect, useCallback } from 'react'
import { getAllProfiles, adminCreateUser, updateProfileRole, toggleProfileActive } from '@/lib/auth'
import type { Profile, UserRole } from '@/types'
import { ROLE_META } from '@/types'

const inputCls = "w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors"
const inputStyle = { background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }

function CreateUserModal({ open, onClose, onCreated }: {
  open: boolean; onClose: () => void; onCreated: () => void
}) {
  const [fullName, setFullName] = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [role,     setRole]     = useState<UserRole>('technician')
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')

  useEffect(() => {
    if (!open) return
    setFullName(''); setEmail(''); setPassword(''); setRole('technician'); setError('')
  }, [open])

  async function save() {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Todos los campos son requeridos'); return
    }
    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return }
    setSaving(true); setError('')
    try {
      await adminCreateUser(email.trim(), password, fullName.trim(), role)
      onCreated()
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Error al crear usuario')
    } finally { setSaving(false) }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-md rounded-2xl border"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)', animation: 'fadeUp 0.25s ease both' }}>

        <div className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'var(--border)' }}>
          <span className="font-medium">Nuevo usuario</span>
          <button onClick={onClose} style={{ color: 'var(--text2)' }}>✕</button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--text2)' }}>
              Nombre completo <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input className={inputCls} style={inputStyle} placeholder="Juan García"
              value={fullName} onChange={e => setFullName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--text2)' }}>
              Correo electrónico <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input type="email" className={inputCls} style={inputStyle} placeholder="juan@empresa.com"
              value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--text2)' }}>
              Contraseña temporal <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input type="password" className={inputCls} style={inputStyle} placeholder="Mínimo 8 caracteres"
              value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--text2)' }}>Rol</label>
            <select className={inputCls} style={inputStyle} value={role}
              onChange={e => setRole(e.target.value as UserRole)}>
              <option value="technician">Técnico</option>
              <option value="supervisor">Supervisor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Role description */}
          <div className="rounded-lg px-3 py-2.5 text-xs" style={{ background: 'var(--surface2)', color: 'var(--text2)' }}>
            {role === 'technician' && '👤 Puede crear reportes y cambiar estados. Solo ve sus propios reportes.'}
            {role === 'supervisor' && '👁 Ve todos los reportes, puede exportar y acceder al reporte mensual.'}
            {role === 'admin'      && '⚙️ Acceso completo: gestiona técnicos, usuarios y toda la información.'}
          </div>

          {error && (
            <div className="text-xs px-3 py-2 rounded-lg" style={{ background: '#fef2f2', color: '#dc2626' }}>{error}</div>
          )}
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg border text-sm"
            style={{ borderColor: 'var(--border)', color: 'var(--text2)' }}>Cancelar</button>
          <button onClick={save} disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
            style={{ background: 'var(--text)', color: 'var(--bg)' }}>
            {saving ? 'Creando…' : 'Crear usuario'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function UsersTab() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading,  setLoading]  = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try { setProfiles(await getAllProfiles()) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  async function changeRole(id: string, role: UserRole) {
    await updateProfileRole(id, role)
    load()
  }

  async function toggleActive(p: Profile) {
    await toggleProfileActive(p.id, !p.active)
    load()
  }

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <span className="text-lg font-medium tracking-tight">Usuarios</span>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
          style={{ background: 'var(--text)', color: 'var(--bg)' }}
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nuevo usuario
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'var(--surface2)' }} />)}
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          {profiles.map((p, i) => {
            const rm = ROLE_META[p.role]
            return (
              <div key={p.id}
                className="flex items-center gap-4 px-5 py-4 border-b last:border-0 transition-colors"
                style={{
                  borderColor: 'var(--border)',
                  opacity: p.active ? 1 : 0.5,
                  animationDelay: `${i * 0.04}s`,
                }}
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                  style={{ background: rm.bg, color: rm.color }}>
                  {p.full_name.slice(0, 2).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{p.full_name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: rm.bg, color: rm.color }}>
                      {rm.label}
                    </span>
                    {!p.active && (
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: 'var(--surface2)', color: 'var(--text3)' }}>
                        Inactivo
                      </span>
                    )}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>
                    {p.email ?? p.id.slice(0, 8) + '…'}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
                  <select
                    className="px-2.5 py-1.5 rounded-lg border text-xs outline-none"
                    style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
                    value={p.role}
                    onChange={e => changeRole(p.id, e.target.value as UserRole)}
                  >
                    <option value="technician">Técnico</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    onClick={() => toggleActive(p)}
                    className="px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all"
                    style={{
                      borderColor: 'var(--border)',
                      color: p.active ? '#d97706' : '#16a34a',
                    }}
                  >
                    {p.active ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <CreateUserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => { setModalOpen(false); load() }}
      />
    </>
  )
}
