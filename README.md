<div align="center">

# 🖨️ PrintLog

**Sistema de gestión de reportes para empresas de impresoras**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38BDF8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com)

*Registra servicios, gestiona técnicos, controla inventario y genera reportes mensuales — todo en un solo lugar.*

</div>

---

## ¿Qué es PrintLog?

PrintLog es una aplicación web interna diseñada para empresas de soporte técnico de impresoras. Permite registrar cada intervención (configuración, instalación, reparación o cambio de toner), asignarla a un técnico, rastrear su estado en tiempo real y obtener reportes mensuales exportables.

Construida con un stack moderno orientado a velocidad de desarrollo y facilidad de despliegue: **Next.js 14** en el frontend, **Supabase** como base de datos y autenticación, y **Vercel** como plataforma de hosting.

---

## Características

### 📋 Gestión de reportes
- Registro de cuatro tipos de servicio: **Configuración**, **Instalación**, **Reparación** y **Toner**
- Captura de datos del solicitante: nombre, área, edificio, piso y ubicación
- Datos del equipo: marca, modelo y número de serie
- Sección específica para toner: modelo, cantidad, contador al cambio y descripción
- Adjuntar un **PDF por reporte** (almacenado en Supabase Storage)
- Campo de comentarios libres
- Búsqueda y filtrado por tipo, estado y técnico asignado

### 🔄 Estados con historial
Cada reporte pasa por un flujo de estados con línea de tiempo auditable:

```
Pendiente → En proceso → Completado → Cerrado
```

El cambio de estado se hace directamente desde la tarjeta del reporte, con nota opcional. El historial queda registrado con fecha y hora exactas.

### 👤 Técnicos
- Alta, edición y desactivación de técnicos
- Asignación de técnico al crear o editar un reporte
- Filtrado de reportes por técnico

### 🗂️ Inventario automático
Vista agrupada por equipo (marca + modelo + serie) que muestra cuántos servicios de cada tipo ha recibido cada impresora y la fecha del último servicio.

### 📊 Reporte mensual
- Navegación mes a mes
- Resumen total con promedio diario
- Desglose por tipo de servicio con barras proporcionales
- Desglose por estado
- Actividad por técnico con porcentaje del total
- Tabla detallada de todos los reportes del mes
- Exportación a CSV con un click

### 📥 Exportaciones
- Descarga de CSV filtrado por rango de fechas y tipo de reporte
- Compatible con Excel y Google Sheets
- Atajos rápidos: hoy, esta semana, este mes

### 🔐 Autenticación y roles

| Rol | Permisos |
|-----|----------|
| **Técnico** | Crear y editar reportes, cambiar estados |
| **Supervisor** | Todo lo anterior + ver inventario, exportar, acceder al reporte mensual |
| **Admin** | Acceso completo + gestionar técnicos y usuarios |

- Login con correo y contraseña
- Solo el Admin puede crear nuevas cuentas (no hay registro público)
- Las tabs del menú se muestran u ocultan según el rol
- RLS (Row Level Security) en Supabase: la base de datos rechaza peticiones no autorizadas

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 14 (App Router) |
| Lenguaje | TypeScript 5 |
| Estilos | Tailwind CSS 3 |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth |
| Storage | Supabase Storage (PDFs) |
| Deploy | Vercel |
| Fuentes | DM Sans + DM Mono |

---

## Estructura del proyecto

```
src/
├── app/
│   ├── layout.tsx              # Root layout con fuentes y AuthProvider
│   ├── page.tsx                # Página principal (protegida)
│   ├── globals.css             # Variables CSS, animaciones globales
│   └── login/
│       └── page.tsx            # Página de login
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx          # Navegación responsiva con menú hamburguesa en móvil
│   │   └── Dashboard.tsx       # Contenedor principal con guardias de rol
│   ├── reports/
│   │   ├── StatsBar.tsx        # Tarjetas de estadísticas en tiempo real
│   │   ├── ReportsTab.tsx      # Lista de reportes con filtros
│   │   ├── ReportCard.tsx      # Tarjeta expandible con historial de estados
│   │   ├── ReportModal.tsx     # Modal crear / editar reporte
│   │   ├── InventoryTab.tsx    # Inventario agrupado por equipo
│   │   └── DownloadsTab.tsx    # Exportación CSV con filtros
│   ├── technicians/
│   │   └── TechniciansTab.tsx  # CRUD de técnicos
│   ├── monthly/
│   │   └── MonthlyTab.tsx      # Reporte mensual con gráficas y tabla
│   └── users/
│       └── UsersTab.tsx        # Gestión de usuarios (solo Admin)
│
├── hooks/
│   ├── useAuth.tsx             # Sesión reactiva con AuthProvider/Context
│   ├── useReports.ts           # Hook para datos de reportes con refetch
│   └── useTabStore.tsx         # Estado de navegación entre tabs
│
├── lib/
│   ├── supabase.ts             # Cliente Supabase (browser)
│   ├── supabase-server.ts      # Cliente Supabase (server)
│   ├── auth.ts                 # Login, logout, perfiles, gestión de usuarios
│   ├── reports.ts              # CRUD reportes, historial de estados, stats
│   ├── technicians.ts          # CRUD técnicos
│   ├── export.ts               # Generador de CSV
│   └── events.ts               # Pub/sub para sincronizar refetch entre componentes
│
├── types/
│   └── index.ts                # Tipos TypeScript + metadatos de display + permisos
│
└── middleware.ts               # Paso libre (protección de rutas vía cliente)
```

---

## Configuración local

### Prerequisitos
- Node.js 18+
- Cuenta en [Supabase](https://supabase.com) (plan gratuito funciona)
- Cuenta en [Vercel](https://vercel.com) (para deploy)


## Tipos de reporte

| Tipo | Icono | Datos adicionales |
|------|-------|-------------------|
| Configuración | ⚙️ | — |
| Instalación | 🔧 | — |
| Reparación | 🛠️ | — |
| Toner | 🖨️ | Modelo, cantidad, contador al cambio, descripción |

Todos los reportes guardan: técnico asignado, solicitante (nombre, área, edificio, piso, ubicación), equipo (marca, modelo, serie), fecha/hora, estado, PDF adjunto y comentarios.

---

## Roadmap

Funcionalidades planeadas para próximas versiones:

- [ ] **Catálogo de equipos** — alta de impresoras con foto, fecha de compra y garantía
- [ ] **QR por equipo** — escanear el QR abre el formulario con el equipo prellenado
- [ ] **Firma digital** — el solicitante firma en pantalla al recibir el servicio
- [ ] **Folio automático** — número consecutivo por año (ej. `2025-0042`)
- [ ] **Notificaciones por correo** — confirmación automática al cerrar un reporte
- [ ] **Alertas de consumo** — equipos con alto consumo de toner marcados automáticamente
- [ ] **Dashboard con gráficas** — vista ejecutiva con tendencias y equipos críticos

---

<div align="center">

Construido por Williams Chan Pescador usando [Next.js](https://nextjs.org) + [Supabase](https://supabase.com)

</div>