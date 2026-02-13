/* eslint-disable @typescript-eslint/no-explicit-any */

import { dev } from '$app/environment'
import type { HandleServerError, RequestEvent } from '@sveltejs/kit'

export const serverError: HandleServerError = async ({
  error,
  event,
  status,
  message,
}: {
  error: any
  event: RequestEvent
  status: number
  message: string
}) => {
  status = error?.response?.status || status

  let parsedResponse = null
  let responseHeaders = {}

  try {
    if (error?.response?.headers instanceof Headers)
      responseHeaders = Object.fromEntries([...error.response.headers.entries()])
  } catch (e) {
    console.error('Failed to extract Headers:', e)
  }

  try {
    if (error?.response && typeof error.response.json === 'function') parsedResponse = await error.response.json()
  } catch (e) {
    console.error('Failed to parse response JSON:', e)
    parsedResponse = {
      parseError: true,
      message: 'Could not parse response as JSON',
      status: error?.response?.status,
      statusText: error?.response?.statusText,
    }
  }

  error.parsedResponse = parsedResponse
  error.headers = responseHeaders

  if (dev) console.error(error)
  else if (status !== 404) {
    const ip_address = event?.request?.headers?.get('x-forwarded-for') || event.getClientAddress()
    const { type, stack } = error || {}
    const { sub } = event?.locals?.user || {}

    console.error({
      user: sub,
      error,
      parsedResponse,
      responseHeaders,
      message,
      ip_address,
      status,
      stack,
      type,
    })
  }

  if (error?.response) {
    return {
      status,
      message: error.response.statusText || 'Generic API error',
    }
  }

  return {
    status,
    message: error?.text || 'Something went wrong!',
  }
}
