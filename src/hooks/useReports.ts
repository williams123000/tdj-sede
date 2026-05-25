'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { getReports, getStats, deleteReport as deleteReportDb } from '@/lib/reports'
import type { Report, ReportFilters } from '@/types'

export function useReports(filters: ReportFilters = {}) {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Serialize filters to a stable string for dep comparison
  const filtersKey = JSON.stringify(filters)
  const filtersRef = useRef(filters)
  filtersRef.current = filters

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getReports(filtersRef.current)
      setReports(data)
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Error al cargar reportes')
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey])

  useEffect(() => { fetch() }, [fetch])

  const remove = async (id: string) => {
    await deleteReportDb(id)
    setReports(prev => prev.filter(r => r.id !== id))
  }

  return { reports, loading, error, refetch: fetch, remove }
}

export function useStats() {
  const [stats, setStats] = useState({ config: 0, install: 0, repair: 0, toner: 0, total: 0, today: 0, pending: 0, in_progress: 0 })
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getStats()
      setStats(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { stats, loading, refetch: fetch }
}
