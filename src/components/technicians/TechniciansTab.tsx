'use client'
import { useState, useEffect, useCallback } from 'react'
import { getTechnicians, createTechnician, updateTechnician, deleteTechnician } from '@/lib/technicians'
import type { Technician } from '@/types'

const inputCls = "w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors"
const inputStyle = { background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }

function TechModal({
  open, tech, onClose, onSaved,
}: {
  open: boolean; tech?: Technician; onClose: () => void; onSaved: () => void
}) {
  const [name, setName]   = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  useEffect(() => {
    if (!open) return
    setName(tech?.name ?? ''); setEmail(tech?.email ?? ''); setPhone(tech?.phone ?? '')
    setError('')
  }, [open, tech])

  async function save() {
    if (!name.trim()) { setError('El nombre es requerido'); return }
    setSaving(true); setError('')
    try {
      if (tech) await updateTechnician(tech.id, { name: name.trim(), email: email.trim(), phone: phone.trim() })
      else      await createTechnician({ name: name.trim(), email: email.trim(), phone: phone.trim() })
      onSaved()
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Error al guardar')
    } finally { setSaving(false) }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md rounded-2xl border"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)', animation: 'fadeUp 0.25s ease both' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'var(--border)' }}>
          <span className="font-medium">{tech ? 'Editar técnico' : 'Nuevo técnico'}</span>
          <button onClick={onClose} style={{ color: 'var(--text2)' }}>✕</button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--text2)' }}>
              Nombre <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input className={inputCls} style={inputStyle} placeholder="Juan García"
              value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--text2)' }}>Correo</label>
            <input type="email" className={inputCls} style={inputStyle} placeholder="juan@empresa.com"
              value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--text2)' }}>Teléfono</label>
            <input className={inputCls} style={inputStyle} placeholder="+52 55 1234 5678"
              value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          {error && (
            <div className="text-sm px-3 py-2 rounded-lg" style={{ background: '#fef2f2', color: '#dc2626' }}>{error}</div>
          )}
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg border text-sm"
            style={{ borderColor: 'var(--border)', color: 'var(--text2)' }}>Cancelar</button>
          <button onClick={save} disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
            style={{ background: 'var(--text)', color: 'var(--bg)' }}>
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function TechniciansTab() {
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Technician | undefined>()
  const [showInactive, setShowInactive] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try { setTechnicians(await getTechnicians(false)) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  async function toggleActive(t: Technician) {
    await updateTechnician(t.id, { active: !t.active })
    load()
  }

  async function remove(id: string) {
    if (!confirm('¿Eliminar este técnico? Se desvinculará de los reportes existentes.')) return
    await deleteTechnician(id)
    load()
  }

  const visible = technicians.filter(t => showInactive || t.active)

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <span className="text-lg font-medium tracking-tight">Técnicos</span>
        <div className="flex gap-2">
          <button
            onClick={() => setShowInactive(s => !s)}
            className="px-3 py-2 rounded-lg border text-sm transition-all"
            style={{
              borderColor: 'var(--border)',
              color: showInactive ? 'var(--text)' : 'var(--text3)',
              background: showInactive ? 'var(--surface2)' : 'transparent',
            }}
          >
            {showInactive ? 'Ocultar inactivos' : 'Ver inactivos'}
          </button>
          <button
            onClick={() => { setEditing(undefined); setModalOpen(true) }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ background: 'var(--text)', color: 'var(--bg)' }}
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nuevo técnico
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: 'var(--surface2)' }} />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--text2)' }}>
          <div className="text-4xl mb-3 opacity-30">👤</div>
          <h3 className="text-base font-medium mb-1" style={{ color: 'var(--text)' }}>Sin técnicos</h3>
          <p className="text-sm">Agrega técnicos para asignarlos a los reportes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visible.map((t, i) => (
            <div
              key={t.id}
              className="rounded-2xl border p-5 animate-fade-up"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
                animationDelay: `${Math.min(i * 0.05, 0.3)}s`,
                opacity: t.active ? 1 : 0.5,
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-medium text-sm flex items-center gap-2">
                    {t.name}
                    {!t.active && (
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--surface2)', color: 'var(--text3)' }}>
                        Inactivo
                      </span>
                    )}
                  </div>
                  {t.email && <div className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{t.email}</div>}
                  {t.phone && <div className="text-xs" style={{ color: 'var(--text3)' }}>{t.phone}</div>}
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: 'var(--surface2)' }}>
                  👤
                </div>
              </div>

              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => { setEditing(t); setModalOpen(true) }}
                  className="px-2.5 py-1 rounded-lg border text-xs font-medium transition-all"
                  style={{ borderColor: 'var(--border)', color: 'var(--text2)' }}
                >
                  Editar
                </button>
                <button
                  onClick={() => toggleActive(t)}
                  className="px-2.5 py-1 rounded-lg border text-xs font-medium transition-all"
                  style={{ borderColor: 'var(--border)', color: t.active ? '#d97706' : '#16a34a' }}
                >
                  {t.active ? 'Desactivar' : 'Activar'}
                </button>
                <button
                  onClick={() => remove(t.id)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                  style={{ color: '#dc2626' }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <TechModal
        open={modalOpen}
        tech={editing}
        onClose={() => setModalOpen(false)}
        onSaved={() => { setModalOpen(false); load() }}
      />
    </>
  )
}
