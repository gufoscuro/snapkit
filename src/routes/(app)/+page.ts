import { getRouteByURL } from '$lib/stores/tenant-config/route-details'
import { error } from '@sveltejs/kit'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ url, parent }) => {
  await parent()

  const route = `/`
  const { pageDetails, routeDetails } = getRouteByURL(route, url)

  if (!pageDetails) throw error(404, `Page not found: ${route}`)

  return {
    pageDetails,
    routeDetails,
  }
}
