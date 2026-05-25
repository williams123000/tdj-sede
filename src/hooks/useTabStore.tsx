'use client'
import { createContext, useContext, useState } from 'react'

export type Tab = 'reportes' | 'inventario' | 'descargas' | 'tecnicos' | 'mensual' | 'usuarios'

const TabContext = createContext<{ tab: Tab; setTab: (t: Tab) => void }>({
  tab: 'reportes', setTab: () => {},
})

export function TabProvider({ children }: { children: React.ReactNode }) {
  const [tab, setTab] = useState<Tab>('reportes')
  return <TabContext.Provider value={{ tab, setTab }}>{children}</TabContext.Provider>
}

export function useTabStore() { return useContext(TabContext) }
