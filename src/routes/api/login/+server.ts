import { env } from '$env/dynamic/private'
import { createAuthCookie, decodeToken, type JWTUser } from '$lib/server/auth'
import { error, json } from '@sveltejs/kit'
import type { RequestEvent } from './$types.js'

const API_GATEWAY_URL = env?.API_GATEWAY_URL || 'http://localhost:3000'

/** @type {import('./$types').RequestHandler} */
export async function POST(event: RequestEvent) {
  const { request, cookies } = event
  const currentOrigin = request.headers.get('origin') || ''

  try {
    const { username, password } = await request.json()
    if (!username || !password) return error(400, 'missing username or password')

    console.log(`[login] Attempting login for user: ${username}`)
    console.log(`[login] Gateway URL: ${API_GATEWAY_URL}/login`)

    // Call the gateway's login endpoint
    const response = await fetch(`${API_GATEWAY_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })

    console.log(`[login] Gateway response status: ${response.status}`)

    if (!response.ok) {
      const errorBody = await response.text()
      console.error(`[login] Gateway error response: ${errorBody}`)
      if (response.status === 401) return error(401, 'Invalid credentials')
      return error(response.status, `Login failed: ${errorBody}`)
    }

    const data = await response.json()
    console.log(`[login] Gateway response keys: ${Object.keys(data).join(', ')}`)

    // Gateway returns snake_case: access_token
    const accessToken = data.access_token || data.accessToken
    if (!accessToken) {
      console.error('[login] No access token in response:', data)
      return error(500, 'No access token received')
    }

    // Decode the token to get user info (gateway already verified it)
    const user: JWTUser | null = decodeToken(accessToken)
    if (!user) return error(500, 'Invalid token received')

    // Set the auth cookie
    createAuthCookie(cookies, accessToken, user?.super_admin && currentOrigin)

    console.log(`[login] Login successful for user: ${user.username}`)
    return json({ accessToken, user })
  } catch (exception: unknown) {
    console.error('[login] Login error:', exception)
    throw error(400, 'Login failed')
  }
}
