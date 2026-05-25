'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getProfile } from '@/lib/auth'
import type { Profile } from '@/types'
import type { Session } from '@supabase/supabase-js'

interface AuthState {
  session: Session | null
  profile: Profile | null
  loading: boolean
}

const AuthContext = createContext<AuthState>({ session: null, profile: null, loading: true })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ session: null, profile: null, loading: true })

  const loadProfile = useCallback(async (session: Session | null) => {
    if (!session) {
      setState({ session: null, profile: null, loading: false })
      return
    }
    const profile = await getProfile(session.user.id)
    setState({ session, profile, loading: false })
  }, [])

  useEffect(() => {
    // Initial session
    supabase.auth.getSession().then(({ data: { session } }) => loadProfile(session))

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      loadProfile(session)
    })

    return () => subscription.unsubscribe()
  }, [loadProfile])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
