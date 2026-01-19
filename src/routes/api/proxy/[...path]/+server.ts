import { AUTH_COOKIE_NAME } from '$lib/fixtures/constants'
import { getApiGatewayUrl } from '$lib/server/request'
import { error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

async function handleRequest(event: Parameters<RequestHandler>[0]): Promise<Response> {
  const { params, request, cookies, url } = event
  const token = cookies.get(AUTH_COOKIE_NAME)

  if (!token) {
    return error(401, 'Unauthorized')
  }

  const gatewayUrl = getApiGatewayUrl()
  const targetPath = params.path
  const queryString = url.search

  const targetUrl = `${gatewayUrl}/${targetPath}${queryString}`

  const headers = new Headers()
  headers.set('Authorization', `Bearer ${token}`)
  headers.set('Content-Type', 'application/json')

  // Forward some headers from the original request
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    headers.set('X-Forwarded-For', forwardedFor)
  }

  const host = request.headers.get('host')
  if (host) {
    headers.set('X-Forwarded-Host', host)
  }

  let body: string | undefined
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      body = await request.text()
    } catch {
      // No body
    }
  }

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body,
  })

  // Forward the response
  const responseHeaders = new Headers()
  response.headers.forEach((value, key) => {
    // Skip headers that shouldn't be forwarded
    if (!['content-encoding', 'transfer-encoding', 'content-length'].includes(key.toLowerCase())) {
      responseHeaders.set(key, value)
    }
  })

  const responseBody = await response.text()

  return new Response(responseBody, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  })
}

export const GET: RequestHandler = handleRequest
export const POST: RequestHandler = handleRequest
export const PUT: RequestHandler = handleRequest
export const PATCH: RequestHandler = handleRequest
export const DELETE: RequestHandler = handleRequest
