// Simple pub/sub para sincronizar refetch entre componentes sin una librería de estado global

type Listener = () => void
const listeners = new Set<Listener>()

export function onReportsChange(fn: Listener) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function notifyReportsChange() {
  listeners.forEach(fn => fn())
}
