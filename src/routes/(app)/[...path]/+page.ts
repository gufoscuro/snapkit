import { getRouteByURL } from '$lib/stores/tenant-config/route-details'
import { error } from '@sveltejs/kit'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ params, url, parent }) => {
  await parent()

  const route = `/${params.path}`
  const { pageDetails, routeDetails } = getRouteByURL(route, url)

  if (!pageDetails) throw error(404, `Page not found: ${route}`)

  return {
    pageDetails,
    routeDetails,
  }
}
