'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await signIn(email, password)
      window.location.href = '/'
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Correo o contraseña incorrectos')
    } finally { setLoading(false) }
  }

  const inputCls = "w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg)' }}>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full animate-pulse-dot"
              style={{ background: 'var(--text)' }} />
            <span className="text-xl font-semibold tracking-tight">TDJ Insurgentes Sede</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text3)' }}>
            Gestión de reportes de impresoras
          </p>
        </div>

        <div className="rounded-2xl border p-6"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h1 className="text-base font-medium mb-5">Iniciar sesión</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--text2)' }}>
                Correo electrónico
              </label>
              <input
                type="email" required autoFocus
                placeholder="tu@empresa.com"
                className={inputCls}
                style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--border2)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                value={email} onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--text2)' }}>
                Contraseña
              </label>
              <input
                type="password" required
                placeholder="••••••••"
                className={inputCls}
                style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--border2)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                value={password} onChange={e => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-xs px-3 py-2.5 rounded-lg"
                style={{ background: '#fef2f2', color: '#dc2626' }}>
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-40 mt-1"
              style={{ background: 'var(--text)', color: 'var(--bg)' }}
            >
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: 'var(--text3)' }}>
          ¿Sin acceso? Contacta al administrador del sistema.
        </p>
      </div>
    </div>
  )
}