import { readStoredSession, writeStoredSession } from './Session'
import type {
  AuthSession,
  IntegrationStatus,
  ProductRecord,
  SyncProductsResponse,
} from '@printforge/ui'
import type { DesignerView } from '@printforge/ui/designer'

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

async function apiRequest<T>(path: string, init: ApiRequestInit = {}): Promise<T> {
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

    return (await retryResponse.json()) as T
  }

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response))
  }

  return (await response.json()) as T
}

export async function firstTimeRequest(): Promise<boolean> {
  const { firstTime } = await apiRequest<{ firstTime: boolean }>('/api/auth/firstTime', {
    skipAuth: true,
  })
  return firstTime
}

export function loginRequest(email: string, password: string) {
  return apiRequest<AuthSession>('/api/auth/login', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({ email, password }),
  })
}

export function registerRequest(payload: {
  name: string
  email: string
  password: string
  companyName: string
}) {
  return apiRequest<AuthSession>('/api/auth/register', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({
      name: payload.name,
      tenantName: payload.companyName,
      email: payload.email,
      password: payload.password,
    }),
  })
}

export function getIntegrationRequest() {
  return apiRequest<IntegrationStatus>('/api/integration')
}

export function saveIntegrationRequest(payload: IntegrationStatus) {
  return apiRequest<IntegrationStatus>('/api/integration', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function syncProductsRequest() {
  return apiRequest<SyncProductsResponse>('/api/integration/sync', { method: 'POST' })
}

export function getProductsRequest() {
  return apiRequest<ProductRecord[]>('/api/products')
}

export type ProductPrintAreasResponse = {
  productId: string
  views: DesignerView[]
}

export function getProductPrintAreasRequest(productId: string) {
  return apiRequest<ProductPrintAreasResponse>(`/api/products/${productId}/print-areas`)
}

export function saveProductPrintAreasRequest(productId: string, views: DesignerView[]) {
  return apiRequest<ProductPrintAreasResponse>(`/api/products/${productId}/print-areas`, {
    method: 'PUT',
    body: JSON.stringify({ views }),
  })
}
