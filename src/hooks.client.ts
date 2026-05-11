import { dev } from '$app/environment'
import { overrideItemIdKeyNameBeforeInitialisingDndZones } from 'svelte-dnd-action'

overrideItemIdKeyNameBeforeInitialisingDndZones('_dndId')

export const handleError = ({ error, event }) => {
  if (dev) {
    console.error(`[Client Error] ${event.url}`, error)
  } else {
    // TODO: Log to Sentry
  }

  return {
    message: (error as Error)?.message || 'An unexpected error occurred',
  }
}
