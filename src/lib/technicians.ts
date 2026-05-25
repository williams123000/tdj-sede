import { supabase } from './supabase'
import type { Technician } from '@/types'

export async function getTechnicians(onlyActive = true): Promise<Technician[]> {
  let query = supabase.from('technicians').select('*').order('name')
  if (onlyActive) query = query.eq('active', true)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function createTechnician(t: Pick<Technician, 'name' | 'email' | 'phone'>): Promise<Technician> {
  const { data, error } = await supabase.from('technicians').insert(t).select().single()
  if (error) throw error
  return data
}

export async function updateTechnician(id: string, t: Partial<Pick<Technician, 'name' | 'email' | 'phone' | 'active'>>): Promise<Technician> {
  const { data, error } = await supabase.from('technicians').update(t).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteTechnician(id: string): Promise<void> {
  const { error } = await supabase.from('technicians').delete().eq('id', id)
  if (error) throw error
}
