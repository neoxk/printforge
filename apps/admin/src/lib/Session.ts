import type { AuthSession } from '@printforge/ui'

const STORAGE_KEY = 'printforge-admin-session'

function hasWindow() {
  return typeof globalThis !== 'undefined'
}

export function readStoredSession(): AuthSession | null {
  if (!hasWindow()) return null

  const rawSession = globalThis.localStorage.getItem(STORAGE_KEY)
  if (!rawSession) return null

  try {
    return JSON.parse(rawSession) as AuthSession
  } catch {
    globalThis.localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function writeStoredSession(session: AuthSession | null) {
  if (!hasWindow()) return

  if (!session) {
    globalThis.localStorage.removeItem(STORAGE_KEY)
    return
  }

  globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}
