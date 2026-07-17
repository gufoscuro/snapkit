import { LEGAL_ENTITY_COOKIE_NAME } from '$lib/fixtures/constants'
import type { PaginatedResponse } from '$lib/utils/filters'
import type { Tenant } from '$lib/types/api-types'
import { apiRequest, invalidateAllCache } from './request'
import { getCurrentVanity, getTenantCookie, readTenantHandoff, setTenantCookie } from './tenant'

/**
 * Bootstrapping the tenant of the current origin.
 *
 * Split from `tenant.ts` (pure, testable) because everything here touches the
 * network or the document.
 */

/**
 * Consume the `?t=&le=` handoff, if present, storing both ids as host-only cookies
 * for this origin.
 *
 * Must run **before the first API call** of the page: the ids it stores are what
 * `X-Tenant` is built from, so anything fetched earlier would go out addressed to
 * the wrong tenant (or none) and then sit in the cache under that identity. Hence
 * the root layout load rather than a component's `onMount`.
 *
 * Returns true when a handoff was consumed, so the caller can strip the params.
 */
export function applyTenantHandoff(url: URL): boolean {
  const handoff = readTenantHandoff(url)
  if (!handoff) return false

  setTenantCookie(handoff.tenantId)
  document.cookie = `${LEGAL_ENTITY_COOKIE_NAME}=${handoff.legalEntityId}; path=/; SameSite=Lax`
  // Anything cached before this point was fetched as a different tenant.
  invalidateAllCache()
  return true
}

/**
 * Make sure the origin's tenant is known, resolving it from the vanity when no
 * cookie carries it yet.
 *
 * This is the bookmark case, and it's the one that bites: open `acme.moddo.pro`
 * tomorrow with an expired cookie and no handoff params, and without this we'd send
 * no header — the API would answer from your session and quietly serve **your own
 * tenant's data under Acme's address**. That's the precise confusion the vanity
 * origin exists to prevent, so we resolve it rather than let it slide.
 *
 * Only superadmins can resolve it (only they may list tenants); everyone else is
 * already in their own tenant, where the session default is correct anyway.
 *
 * @returns the tenant uuid for this origin, or null when it can't be established.
 */
export async function ensureOriginTenant(isSuperadmin: boolean): Promise<string | null> {
  const existing = getTenantCookie()
  if (existing) return existing

  const vanity = getCurrentVanity()
  if (!vanity || !isSuperadmin) return null

  try {
    const response = await apiRequest<PaginatedResponse<Tenant>>({
      url: '/tenants',
      queryParams: { search: vanity },
    })
    // `search` is a filter, not a lookup: it can match several tenants (or a
    // near-miss), so only an exact vanity match may be trusted to identify us.
    const match = (response?.data ?? []).find(t => t.vanity === vanity)
    if (!match) return null

    setTenantCookie(match.id)
    invalidateAllCache()
    return match.id
  } catch {
    // A failed lookup must not strand the user: fall back to the session's tenant.
    return null
  }
}
