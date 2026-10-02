export const AUTH_COOKIE_NAME = 'authorization'
export const LEGAL_ENTITY_COOKIE_NAME = 'le-id'
/** Tenant uuid backing the `X-Tenant` header. Host-only, like `le-id`: the
 * browser keeps each vanity subdomain's value separate, which is what stops one
 * tenant's session bleeding into another's tab. */
export const TENANT_COOKIE_NAME = 't-id'
export const LANGUAGE_COOKIE_NAME = 'paraglide_lang'

/** Handoff query params written when jumping to another tenant's vanity origin.
 * They exist only because a host-only cookie can't be written for a different
 * host — the destination reads them, stores them, and strips them from the URL. */
export const TENANT_HANDOFF_PARAM = 't'
export const LEGAL_ENTITY_HANDOFF_PARAM = 'le'

/** Query params naming the tenant/legal entity whose config the admin page edits,
 * when it isn't the origin's. Unlike the handoff params above these are never
 * consumed into cookies: they scope the admin page's own requests and nothing
 * else, so the rest of the app keeps acting on the origin's tenant. */
export const ADMIN_TARGET_TENANT_PARAM = 'tenant'
export const ADMIN_TARGET_LEGAL_ENTITY_PARAM = 'entity'
