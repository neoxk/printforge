import type { AuthSession } from '@printforge/ui'
import { readStoredSession, writeStoredSession } from '../Session'

type ApiRequestInit = RequestInit & {
  skipAuth?: boolean
}

async function refreshSession(session: AuthSession): Promise<AuthSession> {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: session.refreshToken }),
  })

  if (!response.ok) {
    writeStoredSession(null)
    throw new Error('Your session expired. Please sign in again.')
  }

  const nextSession = (await response.json()) as AuthSession
  writeStoredSession(nextSession)
  return nextSession
}

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { error?: string }
    return payload.error ?? `Request failed with status ${response.status}`
  } catch {
    return `Request failed with status ${response.status}`
  }
}

export async function apiRequest<T>(path: string, init: ApiRequestInit = {}): Promise<T> {
  const { skipAuth, headers, body, ...requestInit } = init
  let session = readStoredSession()

  const baseHeaders: Record<string, string> = {
    ...(body ? { 'Content-Type': 'application/json' } : {}),
    ...(skipAuth || !session?.accessToken ? {} : { Authorization: `Bearer ${session.accessToken}` }),
  }

  const response = await fetch(path, {
    ...requestInit,
    body,
    headers: { ...baseHeaders, ...headers },
  })

  if (response.status === 401 && !skipAuth && session?.refreshToken) {
    session = await refreshSession(session)

    const retryResponse = await fetch(path, {
      ...requestInit,
      body,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        Authorization: `Bearer ${session.accessToken}`,
        ...headers,
      },
    })

    if (!retryResponse.ok) {
      throw new Error(await extractErrorMessage(retryResponse))
    }

    return retryResponse.status === 204 ? (undefined as T) : ((await retryResponse.json()) as T)
  }

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response))
  }

  return response.status === 204 ? (undefined as T) : ((await response.json()) as T)
}
