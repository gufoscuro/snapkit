import { invalidateAll } from '$app/navigation'
import { LEGAL_ENTITY_COOKIE_NAME } from '$lib/fixtures/constants'
import { invalidateAllCache } from './request'

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
 * Removes the legal-entity cookie.
 *
 * Used when the session ends: the cookie is what keys the globals cache, so
 * leaving it behind would let a freshly logged-in user inherit the previous
 * user's legal entity.
 */
export function clearLegalEntityCookie(): void {
  document.cookie = `${LEGAL_ENTITY_COOKIE_NAME}=; path=/; SameSite=Lax; max-age=0`
}

/**
 * Writes the legal-entity ID cookie and optionally invalidates all load functions
 * so the app re-fetches data scoped to the new entity.
 */
export async function switchLegalEntity(entityId: string, { reload = true }: { reload?: boolean } = {}) {
  const existing = getLegalEntityCookie()
  if (existing === entityId) return

  document.cookie = `${LEGAL_ENTITY_COOKIE_NAME}=${entityId}; path=/; SameSite=Lax`

  // The in-memory API cache is keyed by URL but the legal entity comes from a
  // cookie, so cached entries from the previous entity would otherwise be
  // returned to code running under the new one.
  invalidateAllCache()

  if (reload) {
    await invalidateAll()
  }
}
