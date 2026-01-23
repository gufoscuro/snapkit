import { getPageByRoute, getTenantIdByVanity } from '$lib/utils/page-registry'
import type { RouteDetails } from '$utils/runtime'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ url, parent }) => {
  const route = '/'
  const routeDetails: RouteDetails = {
    url,
    search: url.searchParams.get('search'),
  }

  // Get tenant from parent layout
  const { tenantVanity } = await parent()
  const tenantId = getTenantIdByVanity(tenantVanity)

  // Look up page config for root route, filtered by tenant
  const pageDetails = await getPageByRoute(route, tenantId)

  // pageDetails can be null if no home page is configured
  return {
    pageDetails,
    routeDetails,
  }
}
