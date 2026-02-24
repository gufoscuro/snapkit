/* eslint-disable @typescript-eslint/no-explicit-any */

import { goto } from '$app/navigation'
import { resolve } from '$app/paths'
import { env } from '$env/dynamic/public'

const API_GATEWAY = env.PUBLIC_API_GATEWAY

export class ApiError extends Error {
  status: number
  data: any
  response: Response

  constructor(message: string, status: number, data: any, response: Response) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
    this.response = response
  }
}

export type ExtendedFetchOptions = RequestInit & {
  url: string
  data?: any
  queryParams?: Record<string, string | number | boolean>
  /** Set to false to prevent automatic redirect to /login on 401. Default: true */
  redirectOnUnauthorized?: boolean
}

export type SafeApiResponse<T> = {
  data: T | null
  error: ApiError | null
}

export async function request<T>(options: ExtendedFetchOptions): Promise<T> {
  let data: any = null
  const { url, ...requestOptions } = options

  const result: Response = await fetch(url, requestOptions)
  const text = await result.text()
  if (text) {
    data = JSON.parse(text)
  }

  if (!result.ok) throw new Error('Request failed')

  return data as T
}

export async function initSanctum(): Promise<void> {
  await fetch(`${API_GATEWAY}/sanctum/csrf-cookie`, {
    credentials: 'include',
  })
}

function getXsrfToken(): string | null {
  if (typeof document === 'undefined') return null

  const match = document.cookie.match(new RegExp('(^| )XSRF-TOKEN=([^;]+)'))

  return match ? decodeURIComponent(match[2]) : null
}

/**
 * Client-side API request with XSRF token support
 * Calls the API gateway directly using PUBLIC_API_GATEWAY
 * Automatically reads the XSRF-TOKEN cookie and includes it as a header
 * @param options - Request options (url should be the API path, e.g., 'sales/order')
 */
export async function apiRequest<T>(options: ExtendedFetchOptions): Promise<T> {
  const { redirectOnUnauthorized = true, ...rest } = options
  let url = `${API_GATEWAY}/api${options.url}`

  if (options.queryParams) {
    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(options.queryParams)) {
      searchParams.append(key, String(value))
    }
    url += `?${searchParams.toString()}`
  }

  const xsrfToken = getXsrfToken()

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
    ...(options.headers || {}),
  }

  const body = rest.data ? JSON.stringify(rest.data) : rest.body ? JSON.stringify(rest.body) : undefined

  const result = await fetch(url, {
    ...rest,
    headers,
    body,
    credentials: 'include',
  })

  let data: any = null
  const text = await result.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { rawText: text }
    }
  }

  if (result.status === 401) {
    if (redirectOnUnauthorized) {
      goto(resolve('/login'))
    }
    throw new ApiError('Unauthorized', result.status, data, result)
  }

  if (!result.ok) {
    throw new ApiError(data?.message || 'Request failed', result.status, data, result)
  }

  return data as T
}

export async function safeApiRequest<T>(
  options: ExtendedFetchOptions,
): Promise<{ data: T | null; error: ApiError | null }> {
  try {
    const data = await apiRequest<T>(options)
    // await new Promise(resolve => setTimeout(resolve, 1500))

    return { data, error: null }
  } catch (error) {
    if (error instanceof ApiError) {
      return { data: null, error }
    }
    return { data: null, error: new ApiError(error?.toString() || 'Unknown error', 0, null, new Response()) }
  }
}
