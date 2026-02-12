/* eslint-disable @typescript-eslint/no-explicit-any */

export type ExtendedFetchOptions = RequestInit & {
  url: string
  data?: any
  queryParams?: Record<string, string | number | boolean>
}

export async function request<T>(options: ExtendedFetchOptions): Promise<T> {
  const { url, ...requestOptions } = options

  const result: Response = await fetch(url, requestOptions)
  const data = await result.json()

  if (!result.ok) throw new Error('Request failed')

  return data as T
}

/**
 * Client-side API request that goes through the SvelteKit proxy
 * Uses cookies for authentication (automatically sent by browser)
 * @param options - Request options (url should be the API path, e.g., 'sales/order')
 */
export async function apiRequest<T>(options: ExtendedFetchOptions): Promise<T> {
  let url = `/api/proxy/${options.url}`

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
    credentials: 'include', // Include cookies
  })

  if (result.status === 401) {
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }

  // Only parse JSON if response has content (e.g., DELETE requests may return empty body)
  let data = null
  const text = await result.text()
  if (text) {
    data = JSON.parse(text)
  }

  if (!result.ok) {
    throw new Error(data?.message || 'Request failed')
  }

  return data as T
}
