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
