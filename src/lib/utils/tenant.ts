import {
  ADMIN_TARGET_LEGAL_ENTITY_PARAM,
  ADMIN_TARGET_TENANT_PARAM,
  LEGAL_ENTITY_HANDOFF_PARAM,
  TENANT_COOKIE_NAME,
  TENANT_HANDOFF_PARAM,
} from '$lib/fixtures/constants'

/**
 * Tenant resolution.
 *
 * The app is served per tenant on a vanity subdomain (`acme.moddo.pro`), but the
 * API lives on a fixed host (`api.moddo.pro`) and so can't infer the tenant from
 * its own hostname — we tell it, via `X-Tenant: <tenant-uuid>`.
 *
 * **The origin is the source of truth.** The tenant uuid is derived from whichever
 * vanity host the page is served on, never from a stored "impersonation mode" flag.
 * That's deliberate: a flag has to be set on entry and cleared on exit, and every
 * missed clear means acting on the wrong tenant. An origin can't be forgotten —
 * and because the backing cookie is host-only, two tenants open in two tabs stay
 * separate for free.
 *
 * The rule is uniform, with no special case for impersonation: everyone sends the
 * uuid of the tenant owning the current origin. A regular user's own tenant matches
 * and the API answers; a superadmin on someone else's vanity is gated server-side.
 */

/**
 * The vanity slug of the host the page is served from — `acme` for
 * `acme.moddo.pro` or `acme.moddo.local:5173`.
 *
 * Returns null when the host has no vanity label to give: bare `localhost`, an IP
 * literal, or an apex domain. Null means "we don't know the tenant", which callers
 * must treat as "send no header and let the session decide" — never as a default
 * tenant.
 */
export function getVanityFromHost(hostname: string): string | null {
  const host = hostname.trim().toLowerCase()
  if (host.length === 0) return null

  // An IPv4/IPv6 literal has no subdomain structure to read.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(':') || host.startsWith('[')) return null

  const labels = host.split('.')
  // Need at least `<vanity>.<something>` — a bare `localhost` carries no tenant.
  if (labels.length < 2) return null

  const vanity = labels[0]
  if (vanity.length === 0) return null
  // `www.moddo.pro` is the marketing host, not a tenant named "www".
  if (vanity === 'www') return null

  return vanity
}

/** The vanity of the current browser origin, or null outside the browser. */
export function getCurrentVanity(): string | null {
  if (typeof window === 'undefined') return null
  return getVanityFromHost(window.location.hostname)
}

/** Reads the tenant uuid stored for the current origin. */
export function getTenantCookie(): string | null {
  if (typeof document === 'undefined') return null
  const value = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${TENANT_COOKIE_NAME}=`))
    ?.split('=')[1]
  return value && value.length > 0 ? value : null
}

/**
 * Stores the tenant uuid for the current origin.
 *
 * No `Domain` attribute, on purpose: that makes the cookie **host-only**, so
 * `acme.moddo.pro` and `moddo.moddo.pro` can never read each other's. Adding a
 * `Domain=.moddo.pro` here would silently merge every tenant into one shared
 * value and undo the isolation this whole design rests on.
 */
export function setTenantCookie(tenantId: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${TENANT_COOKIE_NAME}=${tenantId}; path=/; SameSite=Lax`
}

/** Drops the tenant uuid for the current origin (logout). */
export function clearTenantCookie() {
  if (typeof document === 'undefined') return
  document.cookie = `${TENANT_COOKIE_NAME}=; path=/; SameSite=Lax; max-age=0`
}

/**
 * Whether the user is acting inside a tenant that isn't their own — i.e. a
 * superadmin shadowing someone else.
 *
 * Derived by comparing two facts we already hold, never read from a URL flag or a
 * stored mode: a claim like `?shadow=true` can be typed by anyone, survives in a
 * bookmark, and — worse — can be *absent* when it should be there. This can't be
 * wrong, and it stays right in a tab left open for days.
 *
 * Falls back to false when either side is unknown: without a resolved origin
 * tenant we send no header at all, so the session decides and the user is by
 * definition in their own tenant.
 */
export function isShadowing(homeTenantId: string | null | undefined, originTenantId: string | null): boolean {
  if (!homeTenantId || !originTenantId) return false
  return homeTenantId !== originTenantId
}

/** Absolute URL of a vanity's origin, preserving the current scheme and port. */
export function buildVanityOrigin(vanity: string, location: { protocol: string; hostname: string; port: string }) {
  const labels = location.hostname.split('.')
  // Swap only the first label so the rest of the domain (and any dev suffix like
  // `.moddo.local`) survives untouched.
  const host = [vanity, ...labels.slice(1)].join('.')
  const port = location.port ? `:${location.port}` : ''
  return `${location.protocol}//${host}${port}`
}

export type TenantHandoff = {
  vanity: string
  tenantId: string
  legalEntityId: string
  /** Path to land on, defaults to the app root. */
  path?: string
}

/**
 * URL that moves the user to another tenant's origin, carrying the ids the
 * destination needs to bootstrap.
 *
 * The params are a handoff, not a mode switch: a host-only cookie can't be written
 * for a different host, so the ids have to travel through the URL. The destination
 * stores them and strips them (see {@link readTenantHandoff}), leaving a clean,
 * shareable address whose meaning comes from the origin alone.
 */
export function buildTenantHandoffUrl(
  handoff: TenantHandoff,
  location: { protocol: string; hostname: string; port: string },
): string {
  const origin = buildVanityOrigin(handoff.vanity, location)
  const path = handoff.path && handoff.path.startsWith('/') ? handoff.path : `/${handoff.path ?? ''}`
  const params = new URLSearchParams({
    [TENANT_HANDOFF_PARAM]: handoff.tenantId,
    [LEGAL_ENTITY_HANDOFF_PARAM]: handoff.legalEntityId,
  })
  return `${origin}${path}?${params.toString()}`
}

/** The handoff ids present on a URL, if any. */
export function readTenantHandoff(url: URL): { tenantId: string; legalEntityId: string } | null {
  const tenantId = url.searchParams.get(TENANT_HANDOFF_PARAM)
  const legalEntityId = url.searchParams.get(LEGAL_ENTITY_HANDOFF_PARAM)
  if (!tenantId || !legalEntityId) return null
  return { tenantId, legalEntityId }
}

export type AdminTarget = {
  tenantId: string
  legalEntityId: string
}

/**
 * The tenant/legal entity the admin page was asked to edit, if any.
 *
 * This is the one place another tenant is reached *without* moving to its vanity
 * origin — for when that origin isn't reachable (no DNS, local dev). It stays
 * honest to the rule above because it's not a mode: the target is named in the
 * admin URL, applied only to the admin page's own requests via
 * {@link tenantRequestOptions}, and never written to a cookie. Leave `/admin` and it's gone.
 */
export function readAdminTarget(url: URL): AdminTarget | null {
  const tenantId = url.searchParams.get(ADMIN_TARGET_TENANT_PARAM)
  const legalEntityId = url.searchParams.get(ADMIN_TARGET_LEGAL_ENTITY_PARAM)
  if (!tenantId || !legalEntityId) return null
  return { tenantId, legalEntityId }
}

/** Query string (with leading `?`) that points the admin page at a target. */
export function buildAdminTargetSearch(target: AdminTarget): string {
  const params = new URLSearchParams({
    [ADMIN_TARGET_TENANT_PARAM]: target.tenantId,
    [ADMIN_TARGET_LEGAL_ENTITY_PARAM]: target.legalEntityId,
  })
  return `?${params.toString()}`
}

/**
 * Request options for a call addressed to another tenant than the origin's.
 * Empty when there's no override, so callers can spread it unconditionally.
 *
 * The other tenant is reached by sending **no** `X-Tenant` — neither the origin's
 * (wrong tenant) nor the target's — and letting the API resolve it from the
 * legal entity in the path. `tenantId` is only the signal that an override applies.
 */
export function tenantRequestOptions(tenantId: string | null | undefined): { omitTenant?: boolean } {
  return tenantId ? { omitTenant: true } : {}
}
