'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { TabProvider } from '@/hooks/useTabStore'
import { Navbar } from '@/components/layout/Navbar'
import { Dashboard } from '@/components/layout/Dashboard'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        window.location.href = '/login'
      }
    })
  }, [])

  return (
    <TabProvider>
      <Navbar />
      <main className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8">
        <Dashboard />
      </main>
    </TabProvider>
  )
}