import { serverError } from '$lib/hooks/server-errors'
import { paraglideMiddleware } from '$lib/paraglide/server'
import { type Handle, type HandleServerError } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'

// const PUBLIC_ROUTES = ['/login', '/api/login', '/api/logout', '/healthz']

// function isPublicRoute(pathname: string): boolean {
//   return PUBLIC_ROUTES.some(route => pathname.startsWith(route))
// }

/**
 * i18n middleware - handles locale detection and HTML lang attribute
 */
const i18nHandle: Handle = ({ event, resolve }) => {
  return paraglideMiddleware(event.request, ({ request: localizedRequest, locale }) => {
    event.request = localizedRequest

    return resolve(event, {
      transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale),
    })
  })
}

/**
 * Auth middleware - handles authentication and route protection
 */
const authHandle: Handle = async ({ event, resolve }) => {
  // const { cookies, url } = event

  // const authToken =
  //   cookies.get(AUTH_COOKIE_NAME) ||
  //   event.request.headers.get('Authorization')?.replace('Bearer ', '')

  // if (isPublicRoute(url.pathname)) {
  //   return resolve(event)
  // }

  // if (authToken) {
  //   const user = decodeToken(authToken)

  //   if (user) {
  //     event.locals.user = user
  //     event.locals.token = authToken
  //   } else {
  //     throw redirect(302, '/login')
  //   }
  // } else {
  //   throw redirect(302, '/login')
  // }

  return resolve(event)
}

export const handle = sequence(i18nHandle, authHandle)
export const handleError: HandleServerError = serverError
