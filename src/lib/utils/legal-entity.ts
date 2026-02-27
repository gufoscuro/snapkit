import { invalidateAll } from '$app/navigation'
import { LEGAL_ENTITY_COOKIE_NAME } from '$lib/fixtures/constants'

/**
 * Reads the current legal-entity ID stored in the cookie.
 */
export function getLegalEntityCookie(): string | undefined {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith(`${LEGAL_ENTITY_COOKIE_NAME}=`))
    ?.split('=')[1]
}

/**
 * Writes the legal-entity ID cookie and optionally invalidates all load functions
 * so the app re-fetches data scoped to the new entity.
 */
export async function switchLegalEntity(entityId: string, { reload = true }: { reload?: boolean } = {}) {
  const existing = getLegalEntityCookie()
  if (existing === entityId) return

  document.cookie = `${LEGAL_ENTITY_COOKIE_NAME}=${entityId}; path=/; SameSite=Lax`

  if (reload) {
    await invalidateAll()
  }
}
