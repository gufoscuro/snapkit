import { tenantConfigStore } from '$lib/stores/tenant-config'
import type { RouteDetails } from '$utils/runtime'
import { error } from '@sveltejs/kit'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ params, url, parent }) => {
  await parent()

  const route = `/${params.path}`
  const routeDetails: RouteDetails = {
    url,
    search: url.searchParams.get('search'),
  }

  const pageDetails = await tenantConfigStore.getPageByRoute(route)

  console.log('Loaded page details for route', route, pageDetails)

  if (!pageDetails) {
    throw error(404, `Page not found: ${route}`)
  }

  return {
    pageDetails,
    routeDetails,
  }
}
