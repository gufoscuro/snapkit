import { AUTH_COOKIE_NAME } from '$lib/fixtures/constants'
import type { Cookies } from '@sveltejs/kit'

type CookieConfig = import('cookie').CookieSerializeOptions & { path: string }
const COOKIE_CONF: CookieConfig = {
  httpOnly: true,
  path: '/',
  secure: false,
  sameSite: 'lax',
}

/**
 * JWT user object
 */
export type JWTUser = {
  sub: string
  exp: number
  iat: number
  full_name: string
  username: string
  tenant: {
    tenant_id: string
    tenant_url: string
  }
  super_admin: boolean
  roles: Array<string>
}

/**
 * Create an authentication cookie
 * @param cookies {Cookies} - SvelteKit cookies object
 * @param accessToken {string} - JWT access token
 * @param [origin] {string} - Optional origin
 */
export function createAuthCookie(cookies: Cookies, accessToken: string, origin?: string | false) {
  const domain = origin ? getDomain(origin) : undefined

  cookies.set(AUTH_COOKIE_NAME, accessToken, {
    ...COOKIE_CONF,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    domain,
  })
}

/**
 * Delete an authentication cookie
 * @param cookies {Cookies} - SvelteKit cookies object
 * @param [origin] {string} - Optional origin
 */
export function deleteAuthCookie(cookies: Cookies, origin?: string) {
  const domain = origin ? getDomain(origin) : undefined

  cookies.delete(AUTH_COOKIE_NAME, COOKIE_CONF)

  if (domain) {
    cookies.delete(AUTH_COOKIE_NAME, {
      ...COOKIE_CONF,
      domain,
    })
  }
}

/**
 * Decode a JWT token without verification
 * Note: Token verification is handled by the gateway
 */
export function decodeToken(token: string): JWTUser | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(atob(parts[1]))
    return payload as JWTUser
  } catch {
    return null
  }
}

/**
 * Check if a token is expired (with 30 second buffer)
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token)
  if (!decoded) return true

  return decoded.exp * 1000 < Date.now() + 30000
}

function getDomain(origin: string): string {
  if (origin.includes('.ngrok')) return ''

  const hostname = new URL(origin).hostname
  const domain = hostname?.split('.').slice(1).join('.')
  return `.${domain}`
}
