import { tenantConfigStore } from '$lib/stores/tenant-config'
import type { RouteDetails } from '$utils/runtime'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ url }) => {
  const route = '/'
  const routeDetails: RouteDetails = {
    url,
    search: url.searchParams.get('search'),
  }

  // Use store (waits for data if fetch is still in progress)
  const pageDetails = await tenantConfigStore.getPageByRoute(route)

  // pageDetails can be null if no home page is configured
  return {
    pageDetails,
    routeDetails,
  }
}
