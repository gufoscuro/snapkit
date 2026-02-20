import { tenantConfigStore } from '$lib/stores/tenant-config'
import type { RouteDetails } from '$utils/runtime'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ url, parent }) => {
  await parent()

  const route = '/'
  const routeDetails: RouteDetails = {
    url,
    search: url.searchParams.get('search'),
  }

  const pageDetails = await tenantConfigStore.getPageByRoute(route)

  return {
    pageDetails,
    routeDetails,
  }
}
