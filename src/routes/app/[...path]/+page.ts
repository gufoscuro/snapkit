import { getPageByRoute } from '$lib/utils/page-registry'
import type { RouteDetails } from '$utils/runtime'
import { error } from '@sveltejs/kit'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ params, url }) => {
  const route = `/${params.path}`
  const routeDetails: RouteDetails = {
    url,
    search: url.searchParams.get('search'),
  }

  // Look up page config with pattern matching
  const pageDetails = await getPageByRoute(route)

  if (!pageDetails) {
    throw error(404, `Page not found: ${route}`)
  }

  return {
    pageDetails,
    routeDetails,
  }
}