import { supabase } from './supabase'
import type { UserRole, Profile } from '@/types'

// ── Session ──────────────────────────────────────────────────

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// ── Profile ──────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) return null
  return data
}

export async function getAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at')
  if (error) throw error
  return data ?? []
}

// ── Admin: crear usuario ──────────────────────────────────────
// Crea el usuario en Supabase Auth + perfil con rol
export async function adminCreateUser(
  email: string,
  password: string,
  fullName: string,
  role: UserRole
) {
  // signUp desde el cliente crea la cuenta y dispara el trigger
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role },
      // No envía email de confirmación (configura en Supabase Dashboard
      // Auth → Settings → desactiva "Enable email confirmations" para uso interno)
    },
  })
  if (error) throw error
  return data
}

export async function updateProfileRole(userId: string, role: UserRole) {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
  if (error) throw error
}

export async function toggleProfileActive(userId: string, active: boolean) {
  const { error } = await supabase
    .from('profiles')
    .update({ active })
    .eq('id', userId)
  if (error) throw error
}
