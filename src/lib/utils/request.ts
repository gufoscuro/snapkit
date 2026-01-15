/* eslint-disable @typescript-eslint/no-explicit-any */
export type ExtendedFetchOptions = RequestInit & {
  url: string
  data?: any
}

export async function request<T>(options: ExtendedFetchOptions): Promise<T> {
  const { url, ...requestOptions } = options

  const result: Response = await fetch(url, requestOptions)
  const data = await result.json()

  if (!result.ok) throw new Error('Request failed')

  return data as T
}

export async function apiRequest<T>(options: ExtendedFetchOptions): Promise<T> {
  const baseUrl = '/api'
  const url = `${baseUrl}${options.url}`
  const body = options.data
    ? JSON.stringify(options.data)
    : options.body
      ? JSON.stringify(options.body)
      : undefined

  return request<T>({ ...options, url, body })
}