export type ReportType   = 'config' | 'install' | 'repair' | 'toner'
export type ReportStatus = 'pending' | 'in_progress' | 'completed' | 'closed'

export type Building = 'Sede' | 'Anexo' | 'Revolucion' | 'Otro'
export type Brand = 'Brother' | 'Sharp' | 'Otro'  

export interface Technician {
  id: string
  name: string
  email?: string
  phone?: string
  active: boolean
  created_at: string
}

export interface StatusHistoryEntry {
  id: string
  report_id: string
  status: ReportStatus
  note?: string
  changed_at: string
}

export interface Report {
  id: string
  type: ReportType
  status: ReportStatus
  service_at: string

  // Técnico
  technician_id?: string
  technician?: Technician   // join opcional

  // Solicitante
  requester_name: string
  requester_area?: string
  building?: string
  floor?: string
  location?: string

  // Equipo
  brand: string
  model: string
  serial?: string

  // Toner
  toner_model?: string
  toner_qty?: number
  toner_counter?: number
  toner_desc?: string

  // Extra
  comments?: string
  pdf_url?: string

  created_at: string
  updated_at: string
}

export type ReportInsert = Omit<Report, 'id' | 'created_at' | 'updated_at' | 'technician'>

export interface ReportFilters {
  search?: string
  type?: ReportType | ''
  status?: ReportStatus | ''
  technician_id?: string
  dateFrom?: string
  dateTo?: string
}

export interface InventoryItem {
  brand: string
  model: string
  serial: string
  total_reports: number
  config_count: number
  install_count: number
  repair_count: number
  toner_count: number
  last_service: string
}

// ── Meta display ─────────────────────────────────────────────

export const TYPE_META: Record<ReportType, { label: string; icon: string; color: string; bg: string }> = {
  config:  { label: 'Configuración', icon: '⚙️',  color: '#2563eb', bg: '#eff6ff' },
  install: { label: 'Instalación',   icon: '🔧',  color: '#16a34a', bg: '#f0fdf4' },
  repair:  { label: 'Reparación',    icon: '🛠️',  color: '#dc2626', bg: '#fef2f2' },
  toner:   { label: 'Toner',         icon: '🖨️',  color: '#d97706', bg: '#fffbeb' },
}

export const STATUS_META: Record<ReportStatus, { label: string; color: string; bg: string; dot: string }> = {
  pending:     { label: 'Pendiente',   color: '#d97706', bg: '#fffbeb', dot: '#f59e0b' },
  in_progress: { label: 'En proceso',  color: '#2563eb', bg: '#eff6ff', dot: '#3b82f6' },
  completed:   { label: 'Completado',  color: '#16a34a', bg: '#f0fdf4', dot: '#22c55e' },
  closed:      { label: 'Cerrado',     color: '#6b7280', bg: '#f9fafb', dot: '#9ca3af' },
}

// ── Auth ─────────────────────────────────────────────────────

export type UserRole = 'technician' | 'supervisor' | 'admin'

export interface Profile {
  id: string
  full_name: string
  email?: string        // ← directo, sin join
  role: UserRole
  active: boolean
  created_at: string
}

export const ROLE_META: Record<UserRole, { label: string; color: string; bg: string }> = {
  technician: { label: 'Técnico',    color: '#2563eb', bg: '#eff6ff' },
  supervisor: { label: 'Supervisor', color: '#7c3aed', bg: '#f5f3ff' },
  admin:      { label: 'Admin',      color: '#16a34a', bg: '#f0fdf4' },
}


// ── Permissions ──────────────────────────────────────────────

export function can(role: UserRole | undefined, action:
  | 'create_report'
  | 'edit_report'
  | 'delete_report'
  | 'view_all_reports'
  | 'export'
  | 'view_monthly'
  | 'manage_technicians'
  | 'manage_users'
): boolean {
  if (!role) return false
  const perms: Record<string, UserRole[]> = {
    create_report:       ['technician', 'supervisor', 'admin'],
    edit_report:         ['technician', 'supervisor', 'admin'],
    delete_report:       ['supervisor', 'admin'],
    view_all_reports:    ['supervisor', 'admin'],
    export:              ['supervisor', 'admin'],
    view_monthly:        ['supervisor', 'admin'],
    manage_technicians:  ['admin'],
    manage_users:        ['admin'],
  }
  return perms[action]?.includes(role) ?? false
}
