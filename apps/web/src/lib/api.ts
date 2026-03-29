import type { ApiResult } from '@parislivr/types'

const BASE = `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/v1`

async function request<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    })
    return res.json() as Promise<ApiResult<T>>
  } catch {
    // API non disponible (mode statique / pas de backend)
    return { data: null, error: { code: 'NETWORK_ERROR', message: 'API non disponible' } }
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
}
