'use client'
import { useEffect, useRef, useState } from 'react'
import { createReport, updateReport } from '@/lib/reports'
import { getTechnicians } from '@/lib/technicians'
import type { Report, ReportInsert, ReportType, ReportStatus, Technician, Building, Brand} from '@/types'

interface Props {
  open: boolean
  report?: Report
  onClose: () => void
  onSaved: () => void
}

const inputCls = "w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors"
const inputStyle = { background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium" style={{ color: 'var(--text2)' }}>
        {label}{required && <span style={{ color: '#dc2626' }}> *</span>}
      </label>
      {children}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-semibold uppercase tracking-wide pb-2 border-b"
      style={{ color: 'var(--text3)', borderColor: 'var(--border)' }}>
      {children}
    </div>
  )
}

export function ReportModal({ open, report, onClose, onSaved }: Props) {
  const isEdit = !!report
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  // Form fields
  const [type,          setType]          = useState<ReportType>('config')
  const [status,        setStatus]        = useState<ReportStatus>('completed')
  const [serviceAt,     setServiceAt]     = useState('')
  const [technicianId,  setTechnicianId]  = useState('')
  const [name,          setName]          = useState('')
  const [area,          setArea]          = useState('')
  const [building,      setBuilding]      = useState('')
  const [floor,         setFloor]         = useState('')
  const [location,      setLocation]      = useState('')
  const [brand,         setBrand]         = useState('')
  const [model,         setModel]         = useState('')
  const [serial,        setSerial]        = useState('')
  const [tonerModel,    setTonerModel]    = useState('')
  const [tonerQty,      setTonerQty]      = useState('')
  const [tonerCounter,  setTonerCounter]  = useState('')
  const [tonerDesc,     setTonerDesc]     = useState('')
  const [comments,      setComments]      = useState('')

  useEffect(() => {
    getTechnicians().then(setTechnicians).catch(console.error)
  }, [])

  useEffect(() => {
    if (!open) return
    if (report) {
      setType(report.type); setStatus(report.status)
      setServiceAt(report.service_at?.slice(0, 16) ?? '')
      setTechnicianId(report.technician_id ?? '')
      setName(report.requester_name); setArea(report.requester_area ?? '')
      setBuilding(report.building ?? ''); setFloor(report.floor ?? '')
      setLocation(report.location ?? ''); setBrand(report.brand)
      setModel(report.model); setSerial(report.serial ?? '')
      setTonerModel(report.toner_model ?? ''); setTonerQty(report.toner_qty?.toString() ?? '')
      setTonerCounter(report.toner_counter?.toString() ?? ''); setTonerDesc(report.toner_desc ?? '')
      setComments(report.comments ?? '')
    } else {
      const now = new Date()
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
      setType('config'); setStatus('completed'); setServiceAt(now.toISOString().slice(0, 16))
      setTechnicianId(''); setName(''); setArea(''); setBuilding(''); setFloor('')
      setLocation(''); setBrand(''); setModel(''); setSerial('')
      setTonerModel(''); setTonerQty(''); setTonerCounter(''); setTonerDesc(''); setComments('')
    }
    setPdfFile(null); setError('')
  }, [open, report])

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  async function handleSave() {
    if (!name.trim())  { setError('El nombre del solicitante es requerido'); return }
    if (!brand.trim() || !model.trim()) { setError('Marca y modelo son requeridos'); return }

    setSaving(true); setError('')

    const payload: ReportInsert = {
      type, status, service_at: serviceAt,
      technician_id: technicianId || undefined,
      requester_name: name.trim(), requester_area: area.trim(),
      building: building.trim(), floor: floor.trim(), location: location.trim(),
      brand: brand.trim(), model: model.trim(), serial: serial.trim(),
      toner_model:   type === 'toner' ? tonerModel.trim()        : undefined,
      toner_qty:     type === 'toner' && tonerQty ? parseInt(tonerQty) : undefined,
      toner_counter: type === 'toner' && tonerCounter ? parseInt(tonerCounter) : undefined,
      toner_desc:    type === 'toner' ? tonerDesc.trim()          : undefined,
      comments: comments.trim(),
    }

    try {
      if (isEdit && report) await updateReport(report.id, payload, pdfFile ?? undefined)
      else                  await createReport(payload, pdfFile ?? undefined)
      onSaved()
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Error al guardar')
    } finally { setSaving(false) }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 modal-backdrop"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl border overflow-y-auto"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)', maxHeight: '92vh', animation: 'fadeUp 0.3s ease both' }}
      >
        {/* Head */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <span className="text-base font-medium">{isEdit ? 'Editar reporte' : 'Nuevo reporte'}</span>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
            style={{ color: 'var(--text2)' }}>✕</button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-6">

          {/* Tipo, estado, fecha */}
          <div className="flex flex-col gap-4">
            <SectionTitle>Tipo de servicio</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Tipo" required>
                <select className={inputCls} style={inputStyle} value={type} onChange={e => setType(e.target.value as ReportType)}>
                  <option value="config">Configuración</option>
                  <option value="install">Instalación</option>
                  <option value="repair">Reparación</option>
                  <option value="toner">Toner</option>
                </select>
              </Field>
              <Field label="Estado">
                <select className={inputCls} style={inputStyle} value={status} onChange={e => setStatus(e.target.value as ReportStatus)}>
                  <option value="pending">Pendiente</option>
                  <option value="in_progress">En proceso</option>
                  <option value="completed">Completado</option>
                  <option value="closed">Cerrado</option>
                </select>
              </Field>
              <Field label="Fecha y hora" required>
                <input type="datetime-local" className={inputCls} style={inputStyle} value={serviceAt} onChange={e => setServiceAt(e.target.value)} />
              </Field>
            </div>
          </div>

          {/* Técnico */}
          {technicians.length > 0 && (
            <div className="flex flex-col gap-4">
              <SectionTitle>Técnico asignado</SectionTitle>
              <Field label="Técnico">
                <select className={inputCls} style={inputStyle} value={technicianId} onChange={e => setTechnicianId(e.target.value)}>
                  <option value="">Sin asignar</option>
                  {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </Field>
            </div>
          )}

          {/* Solicitante */}
          <div className="flex flex-col gap-4">
            <SectionTitle>Datos del solicitante</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Nombre" required>
                <input className={inputCls} style={inputStyle} placeholder="Nombre completo" value={name} onChange={e => setName(e.target.value)} />
              </Field>
              <Field label="Área">
                <input className={inputCls} style={inputStyle} placeholder="Ala Norte" value={area} onChange={e => setArea(e.target.value)} />
              </Field>
              <Field label="Edificio">
                <select className={inputCls} style={inputStyle} value={building} onChange={e => setBuilding(e.target.value)}>
                  <option value="">Seleccionar edificio</option>
                  <option value="Sede">Sede</option>
                  <option value="Anexo">Anexo</option>
                  <option value="Revolucion">Revolucion</option>
                  </select>
              </Field>
              <Field label="Piso">
                <input className={inputCls} style={inputStyle} placeholder="3" value={floor} onChange={e => setFloor(e.target.value)} />
              </Field>
              <Field label="Ubicación">
                <input className={inputCls} style={inputStyle} placeholder="Sede, Piso 3" value={location} onChange={e => setLocation(e.target.value)} />
              </Field>
            </div>
          </div>

          {/* Equipo */}
          <div className="flex flex-col gap-4">
            <SectionTitle>Datos del equipo</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Marca" required>
                <select className={inputCls} style={inputStyle} value={brand} onChange={e => setBrand(e.target.value)}>
                  <option value="">Seleccionar marca</option>
                  <option value="Sharp">Sharp</option>
                  <option value="Brother" >Brother</option>
                  </select>

              </Field>
              <Field label="Modelo" required>
                <input className={inputCls} style={inputStyle} placeholder="MX-B350P" value={model} onChange={e => setModel(e.target.value)} />
              </Field>
              <Field label="Número de serie">
                <input className={`${inputCls} font-mono`} style={inputStyle} placeholder="1F000000" value={serial} onChange={e => setSerial(e.target.value)} />
              </Field>
            </div>
          </div>

          {/* Toner */}
          {type === 'toner' && (
            <div className="flex flex-col gap-4">
              <SectionTitle>Datos del toner</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="Modelo de toner">
                  <input className={inputCls} style={inputStyle} placeholder="CF258A" value={tonerModel} onChange={e => setTonerModel(e.target.value)} />
                </Field>
                <Field label="Cantidad">
                  <input type="number" min="1" className={inputCls} style={inputStyle} placeholder="1" value={tonerQty} onChange={e => setTonerQty(e.target.value)} />
                </Field>
                <Field label="Contador al cambio">
                  <input type="number" className={`${inputCls} font-mono`} style={inputStyle} placeholder="12500" value={tonerCounter} onChange={e => setTonerCounter(e.target.value)} />
                </Field>
              </div>
              <Field label="Descripción del toner">
                <textarea className={inputCls} style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
                  placeholder="Negro, rendimiento 3000 páginas…" value={tonerDesc} onChange={e => setTonerDesc(e.target.value)} />
              </Field>
            </div>
          )}

          {/* PDF */}
          <div className="flex flex-col gap-4">
            <SectionTitle>Documento adjunto</SectionTitle>
            <div
              className="rounded-lg border-2 border-dashed py-4 px-5 text-center cursor-pointer text-sm transition-all"
              style={{
                borderColor: pdfFile || report?.pdf_url ? '#16a34a' : 'var(--border)',
                background: pdfFile || report?.pdf_url ? '#f0fdf4' : 'transparent',
                color: pdfFile || report?.pdf_url ? '#16a34a' : 'var(--text2)',
              }}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept=".pdf" className="hidden"
                onChange={e => setPdfFile(e.target.files?.[0] ?? null)} />
              {pdfFile ? `✔ ${pdfFile.name}` : report?.pdf_url ? '✔ PDF adjunto (click para reemplazar)' : '📎 Adjuntar PDF (opcional)'}
            </div>
          </div>

          {/* Comentarios */}
          <div className="flex flex-col gap-4">
            <SectionTitle>Comentarios</SectionTitle>
            <textarea className={inputCls}
              style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
              placeholder="Observaciones, detalles adicionales…"
              value={comments} onChange={e => setComments(e.target.value)} />
          </div>

          {error && (
            <div className="text-sm px-3 py-2 rounded-lg" style={{ background: '#fef2f2', color: '#dc2626' }}>{error}</div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex justify-end gap-2 px-6 py-4 border-t"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <button onClick={onClose}
            className="px-4 py-2 rounded-lg border text-sm font-medium"
            style={{ borderColor: 'var(--border)', color: 'var(--text2)' }}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
            style={{ background: 'var(--text)', color: 'var(--bg)' }}>
            {saving ? 'Guardando…' : 'Guardar reporte'}
          </button>
        </div>
      </div>
    </div>
  )
}
