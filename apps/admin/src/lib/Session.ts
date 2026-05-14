import type { AuthSession } from '../types/domain'

const STORAGE_KEY = 'printforge-admin-session'

function hasWindow() {
  return typeof window !== 'undefined'
}

export function readStoredSession(): AuthSession | null {
  if (!hasWindow()) {
    return null
  }

  const rawSession = window.localStorage.getItem(STORAGE_KEY)

  if (!rawSession) {
    return null
  }

  try {
    return JSON.parse(rawSession) as AuthSession
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function writeStoredSession(session: AuthSession | null) {
  if (!hasWindow()) {
    return
  }

  if (!session) {
    window.localStorage.removeItem(STORAGE_KEY)
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}
