/* eslint-disable @typescript-eslint/no-explicit-any */
import { env } from '$env/dynamic/private'
import { redirect } from '@sveltejs/kit'
import type { RequestEvent } from '@sveltejs/kit'

const API_GATEWAY_URL = env?.API_GATEWAY_URL || 'http://localhost:3000'

export type ExtendedFetchOptions = RequestInit & {
  url: string
  data?: any
  queryParams?: Record<string, string | number | boolean>
}

/**
 * Server-side API request to the gateway
 * @param event - SvelteKit request event (provides auth token from locals)
 * @param options - Request options (url should be the API path, e.g., 'sales/order')
 */
export async function apiRequest<T>(
  event: RequestEvent,
  options: ExtendedFetchOptions
): Promise<T> {
  const token = event.locals.token

  if (!token) {
    throw redirect(302, '/login')
  }

  let url = `${API_GATEWAY_URL}/${options.url}`

  if (options.queryParams) {
    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(options.queryParams)) {
      searchParams.append(key, String(value))
    }
    url += `?${searchParams.toString()}`
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  }

  const body = options.data
    ? JSON.stringify(options.data)
    : options.body
      ? JSON.stringify(options.body)
      : undefined

  const result = await fetch(url, {
    ...options,
    headers,
    body,
  })

  if (result.status === 401) {
    throw redirect(302, '/login')
  }

  const data = await result.json()

  if (!result.ok) {
    throw new Error(data?.message || 'Request failed')
  }

  return data as T
}

/**
 * Get the API gateway URL (for use in proxy endpoints)
 */
export function getApiGatewayUrl(): string {
  return API_GATEWAY_URL
}
