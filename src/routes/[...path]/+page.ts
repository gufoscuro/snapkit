import { tenantConfigStore } from '$lib/stores/tenant-config'
import type { RouteDetails } from '$utils/runtime'
import { error } from '@sveltejs/kit'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ params, url }) => {
  const route = `/${params.path}`
  const routeDetails: RouteDetails = {
    url,
    search: url.searchParams.get('search'),
  }

  // Extract vanity from hostname (same as layout does)
  const tenantVanity = url.hostname.split('.')[0] || null

  // Use store (waits for data if fetch is still in progress, triggers fetch if needed)
  const pageDetails = await tenantConfigStore.getPageByRoute(route, tenantVanity || undefined)

  if (!pageDetails) {
    throw error(404, `Page not found: ${route}`)
  }

  return {
    pageDetails,
    routeDetails,
  }
}
