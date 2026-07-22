import { browser } from '$app/environment'
import { invalidateGlobalsCache } from '$lib/stores/globals-cache'
import { tenantConfigStore } from '$lib/stores/tenant-config'
import { clearLegalEntityCookie } from './legal-entity'
import { invalidateAllCache } from './request'
import { clearUserKey } from './storage'

/**
 * Drops every piece of client-side state tied to the authenticated user.
 *
 * Several caches outlive a logout because they are plain module-level state:
 * the GET response cache, the globals cache read by the `(app)` layout load,
 * the tenant config store and the per-user storage key. Without this reset a
 * second login inside the same tab keeps rendering the previous user, since
 * the layout load short-circuits on the globals cache and never re-fetches
 * `/user`.
 *
 * Call it on logout *and* right after a successful login — a session can also
 * end without an explicit logout (expiry, 401 redirect), and in that case only
 * the login path gets a chance to clean up.
 */
export function resetClientSession(): void {
  invalidateAllCache()
  invalidateGlobalsCache()
  tenantConfigStore.invalidate()
  clearUserKey()

  if (browser) clearLegalEntityCookie()
}
