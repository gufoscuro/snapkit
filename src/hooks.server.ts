import { AUTH_COOKIE_NAME } from '$lib/fixtures/constants'
import { decodeToken } from '$lib/server/auth'
import { redirect, type Handle } from '@sveltejs/kit'

const PUBLIC_ROUTES = ['/login', '/api/login', '/api/logout']

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
}

export const handle: Handle = async ({ event, resolve }) => {
  const { cookies, url } = event

  // Get token from cookie or Authorization header
  const authToken =
    cookies.get(AUTH_COOKIE_NAME) ||
    event.request.headers.get('Authorization')?.replace('Bearer ', '')

  // Allow public routes without auth
  if (isPublicRoute(url.pathname)) {
    return await resolve(event)
  }

  if (authToken) {
    const user = decodeToken(authToken)

    if (user) {
      event.locals.user = user
      event.locals.token = authToken
    } else {
      // Invalid token, redirect to login
      throw redirect(302, '/login')
    }
  } else {
    // No token, redirect to login
    throw redirect(302, '/login')
  }

  return await resolve(event)
}