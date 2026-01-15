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

export async function apiRequest<T>(options: ExtendedFetchOptions): Promise<T> {
  const baseUrl = '/api'
  // TODO - remove hardcoded URL and token
  let url = `https://arke.arkestaging.com/api/${options.url}`

  if (options.queryParams) {
    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(options.queryParams)) {
      searchParams.append(key, String(value))
    }
    url += `?${searchParams.toString()}`
  }
  const headers = 
  {
    ...options.headers ? options.headers : {},
    Authorization: `Bearer eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0NmJjZDZhZi0wYjg0LTQyNTItYjMzNi03YjExNzAwNTA2MWYiLCJleHAiOjE3Njg3NTIxMTEsImlhdCI6MTc2ODQ5MjkxMSwiZnVsbF9uYW1lIjoiQXJrZSBUZWFtIiwidXNlcm5hbWUiOiJ0ZWFtIiwidGVuYW50Ijp7InRlbmFudF9pZCI6IjJlMTY3NDU5LWNhODktNGViOC04YmJkLTQ4ZTBkNGJjY2M5NyIsInRlbmFudF91cmwiOiJhcmtlIn0sInN1cGVyX2FkbWluIjp0cnVlLCJyb2xlcyI6WyJhZG1pbiJdfQ.nxvhfXmXjW91D_CY-YivAEI1D3OuM3D0LXQHOiHS2L2EIy5N5Wv5zkjjsotGCQc3MgiNFyNciEidsJihmdew70VHcUEF2CYjm3SOkNBl_nOXrr-BaSq_cszW-eA-2863kk5l7fYc2HAOwNg48jMxnnPGE_IUIb_2JagWK9QbZnvbtUE0OdrzMIlsnhSBiOSwTyj_HYTcAuGfc61wg9LNKVHiNdSxNFrgfm6QetfGcdJdaQJ6vayTl3oW1ArA36akuPXWRlzmxCIUQDPPO6B31nfb8iBIQfwXXWlSA9fV9e19JQq93WsdXYyTGAgG3Rr6FPBWlJv37Gxk0jVnBL3FZQ`,
  }
  const body = options.data
    ? JSON.stringify(options.data)
    : options.body
      ? JSON.stringify(options.body)
      : undefined

  return request<T>({ ...options, url, body, headers })
}