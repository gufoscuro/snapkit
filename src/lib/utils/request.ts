/* eslint-disable @typescript-eslint/no-explicit-any */

import { goto } from '$app/navigation'
import { resolve } from '$app/paths'
import { env } from '$env/dynamic/public'
import { parseJSON, stringifyJSON } from './json'

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
  /** Force a fresh request, removing the cached entry for this URL if present. Only applies to GET requests. */
  invalidateCache?: boolean
}

const MAX_CACHE_SIZE = 20
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

type CacheEntry = { data: unknown; timestamp: number }
const apiCache = new Map<string, CacheEntry>()

function getBaseUrl(url: string): string {
  return url.split('?')[0]
}

function getParentPath(path: string): string | null {
  const lastSlash = path.lastIndexOf('/')
  if (lastSlash <= 0) return null
  return path.substring(0, lastSlash)
}

export function invalidateCacheByBasePath(url: string): void {
  const basePath = getBaseUrl(url)

  // Collect the mutation path and all ancestor paths.
  // e.g. PUT /foo/bar/123/flags → invalidates /foo/bar/123/flags, /foo/bar/123, /foo/bar
  const pathsToInvalidate = new Set<string>()
  let current: string | null = basePath
  while (current) {
    pathsToInvalidate.add(current)
    current = getParentPath(current)
  }

  for (const key of apiCache.keys()) {
    if (pathsToInvalidate.has(getBaseUrl(key))) {
      apiCache.delete(key)
    }
  }
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
  const { redirectOnUnauthorized = true, invalidateCache = false, ...rest } = options

  let url = `${API_GATEWAY}/api${options.url}`
  let data: any = null

  if (options.queryParams) {
    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(options.queryParams)) {
      searchParams.append(key, String(value))
    }
    url += `?${searchParams.toString()}`
  }

  const isGet = !rest.method || rest.method.toUpperCase() === 'GET'

  if (isGet) {
    if (invalidateCache) {
      apiCache.delete(url)
    } else {
      const cached = apiCache.get(url)
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.data as T
      }
      if (cached) apiCache.delete(url)
    }
  } else {
    invalidateCacheByBasePath(url)
  }

  const xsrfToken = getXsrfToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
    ...(options.headers || {}),
  }

  const body = rest.data ? stringifyJSON(rest.data) : rest.body ? stringifyJSON(rest.body) : undefined

  const result = await fetch(url, {
    ...rest,
    headers,
    body,
    credentials: 'include',
  })

  const text = await result.text()

  if (text) data = parseJSON(text) || text

  if (result.status === 401) {
    if (redirectOnUnauthorized) goto(resolve('/login'))

    throw new ApiError('Unauthorized', result.status, data, result)
  }

  if (!result.ok) {
    if (result.status === 422) throw new ApiError('Validation Error', result.status, data, result)

    throw new ApiError(data?.message || 'Request failed', result.status, data, result)
  }

  if (isGet) {
    if (apiCache.size >= MAX_CACHE_SIZE) {
      const oldest = apiCache.keys().next().value as string
      apiCache.delete(oldest)
    }
    apiCache.set(url, { data, timestamp: Date.now() })
  }

  return data as T
}

/**
 * Client-side API request for multipart/form-data uploads (e.g. file uploads).
 * Unlike apiRequest, this does NOT set Content-Type so the browser can set it
 * automatically with the correct multipart boundary.
 */
export async function apiUploadRequest<T>(options: {
  url: string
  method?: string
  body: FormData
  redirectOnUnauthorized?: boolean
}): Promise<T> {
  const { url, method = 'POST', body, redirectOnUnauthorized = true } = options
  const fullUrl = `${API_GATEWAY}/api${url}`

  const xsrfToken = getXsrfToken()
  const headers: HeadersInit = {
    Accept: 'application/json',
    ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
  }

  const result = await fetch(fullUrl, { method, headers, body, credentials: 'include' })
  const text = await result.text()
  const data: any = text ? parseJSON(text) || text : null

  if (result.status === 401) {
    if (redirectOnUnauthorized) goto(resolve('/login'))
    throw new ApiError('Unauthorized', result.status, data, result)
  }

  if (!result.ok) {
    if (result.status === 422) throw new ApiError('Validation Error', result.status, data, result)
    throw new ApiError(data?.message || 'Request failed', result.status, data, result)
  }

  invalidateCacheByBasePath(fullUrl)

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

// --- Typed API Client ---

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/** Options for requests without a body (GET, DELETE). */
type ClientOptions = Omit<ExtendedFetchOptions, 'url' | 'method' | 'data' | 'body'>

/** Options for requests with a typed body (POST, PUT, PATCH). */
type ClientOptionsWithBody<TBody = unknown> = ClientOptions & {
  data?: TBody
}

/** Options for file upload requests. */
type UploadOptions = {
  body: FormData
  redirectOnUnauthorized?: boolean
}

type ApiClient = {
  get: <TResponse = unknown>(url: string, options?: ClientOptions) => Promise<TResponse>
  delete: <TResponse = unknown>(url: string, options?: ClientOptions) => Promise<TResponse>
  post: <TResponse = unknown, TBody = unknown>(
    url: string,
    options?: ClientOptionsWithBody<TBody>,
  ) => Promise<TResponse>
  put: <TResponse = unknown, TBody = unknown>(url: string, options?: ClientOptionsWithBody<TBody>) => Promise<TResponse>
  patch: <TResponse = unknown, TBody = unknown>(
    url: string,
    options?: ClientOptionsWithBody<TBody>,
  ) => Promise<TResponse>
  upload: <TResponse = unknown>(url: string, options: UploadOptions & { method?: string }) => Promise<TResponse>
  safe: {
    get: <TResponse = unknown>(url: string, options?: ClientOptions) => Promise<SafeApiResponse<TResponse>>
    delete: <TResponse = unknown>(url: string, options?: ClientOptions) => Promise<SafeApiResponse<TResponse>>
    post: <TResponse = unknown, TBody = unknown>(
      url: string,
      options?: ClientOptionsWithBody<TBody>,
    ) => Promise<SafeApiResponse<TResponse>>
    put: <TResponse = unknown, TBody = unknown>(
      url: string,
      options?: ClientOptionsWithBody<TBody>,
    ) => Promise<SafeApiResponse<TResponse>>
    patch: <TResponse = unknown, TBody = unknown>(
      url: string,
      options?: ClientOptionsWithBody<TBody>,
    ) => Promise<SafeApiResponse<TResponse>>
  }
}

function buildRequestOptions<TBody>(
  method: HttpMethod,
  url: string,
  prefix: string,
  options?: ClientOptions | ClientOptionsWithBody<TBody>,
): ExtendedFetchOptions {
  return { ...options, url: `${prefix}${url}`, method }
}

/**
 * Creates a typed API client with method-specific functions.
 *
 * Usage:
 *   const api = createApiClient()
 *   const order = await api.get<Order>('/sales/order/123')
 *   const created = await api.post<Order, CreateOrderBody>('/sales/order', { data: body })
 *   const { data, error } = await api.safe.get<Order[]>('/sales/order')
 *
 * The client delegates to apiRequest / safeApiRequest internally,
 * so caching and cache invalidation work exactly as before.
 *
 * @param basePrefix - Optional path prefix prepended to every URL (e.g. '/sales')
 */
export function createApiClient(basePrefix?: string): ApiClient {
  const prefix = basePrefix ?? ''

  return {
    get: <TResponse = unknown>(url: string, options?: ClientOptions) =>
      apiRequest<TResponse>(buildRequestOptions('GET', url, prefix, options)),

    delete: <TResponse = unknown>(url: string, options?: ClientOptions) =>
      apiRequest<TResponse>(buildRequestOptions('DELETE', url, prefix, options)),

    post: <TResponse = unknown, TBody = unknown>(url: string, options?: ClientOptionsWithBody<TBody>) =>
      apiRequest<TResponse>(buildRequestOptions('POST', url, prefix, options)),

    put: <TResponse = unknown, TBody = unknown>(url: string, options?: ClientOptionsWithBody<TBody>) =>
      apiRequest<TResponse>(buildRequestOptions('PUT', url, prefix, options)),

    patch: <TResponse = unknown, TBody = unknown>(url: string, options?: ClientOptionsWithBody<TBody>) =>
      apiRequest<TResponse>(buildRequestOptions('PATCH', url, prefix, options)),

    upload: <TResponse = unknown>(url: string, options: UploadOptions & { method?: string }) =>
      apiUploadRequest<TResponse>({ url: `${prefix}${url}`, ...options }),

    safe: {
      get: <TResponse = unknown>(url: string, options?: ClientOptions) =>
        safeApiRequest<TResponse>(buildRequestOptions('GET', url, prefix, options)),

      delete: <TResponse = unknown>(url: string, options?: ClientOptions) =>
        safeApiRequest<TResponse>(buildRequestOptions('DELETE', url, prefix, options)),

      post: <TResponse = unknown, TBody = unknown>(url: string, options?: ClientOptionsWithBody<TBody>) =>
        safeApiRequest<TResponse>(buildRequestOptions('POST', url, prefix, options)),

      put: <TResponse = unknown, TBody = unknown>(url: string, options?: ClientOptionsWithBody<TBody>) =>
        safeApiRequest<TResponse>(buildRequestOptions('PUT', url, prefix, options)),

      patch: <TResponse = unknown, TBody = unknown>(url: string, options?: ClientOptionsWithBody<TBody>) =>
        safeApiRequest<TResponse>(buildRequestOptions('PATCH', url, prefix, options)),
    },
  }
}

/** Default API client instance — use this for all API calls. */
export const api = createApiClient()
