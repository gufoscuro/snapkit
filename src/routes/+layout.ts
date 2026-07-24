import { applyTenantHandoff } from '$lib/utils/tenant-session'
import type { LayoutLoad } from './$types'

export const ssr = false

/**
 * Runs before every other load, which is the point: the handoff writes the cookies
 * `X-Tenant` is built from, so it must land before the page's first API call rather
 * than in a component's onMount — otherwise the first requests go out as the wrong
 * tenant and poison the cache under that identity.
 *
 * Returns nothing on purpose: child loads cast `parent()` to their own shape, and
 * handing them a payload they don't expect breaks that. The layout component strips
 * the spent params by reading the URL itself.
 */
export const load: LayoutLoad = ({ url }) => {
  applyTenantHandoff(url)
}
