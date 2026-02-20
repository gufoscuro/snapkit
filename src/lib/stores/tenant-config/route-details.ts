import type { PageDetails } from '$utils/page-registry'
import type { RouteDetails } from '$utils/runtime'
import { tenantConfigStore } from './store.svelte'

interface RouteResponse {
  pageDetails: PageDetails | null
  routeDetails: RouteDetails
}

export function getRouteByURL(route: string, url: URL): RouteResponse {
  const pageDetails = tenantConfigStore.getPageByRoute(route)
  const routeDetails: RouteDetails = {
    url,
    search: url.searchParams.get('search'),
  }

  return {
    routeDetails,
    pageDetails,
  }
}
