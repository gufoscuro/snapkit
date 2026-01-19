import { deleteAuthCookie } from '$lib/server/auth'
import { json } from '@sveltejs/kit'

/** @type {import('./$types').RequestHandler} */
export async function POST({ cookies, request }): Promise<Response> {
  const currentOrigin = request.headers.get('origin') || ''

  deleteAuthCookie(cookies, currentOrigin)

  return json({})
}
