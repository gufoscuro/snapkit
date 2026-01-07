import { getPageByRoute } from '$lib/utils/page-registry'
import { error } from '@sveltejs/kit'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ params }) => {
  const route = `/${params.path}`

  // Hardcoded customer for now (later: from session)
  const customerId = 'customer-123'

  // Look up page config with pattern matching
  const pageMatch = await getPageByRoute(route)

  if (!pageMatch) {
    throw error(404, `Page not found: ${route}`)
  }

  return {
    customerId,
    pageConfig: pageMatch.config,
    routeParams: pageMatch.params, // URL parameters like { uuid: '123', delivery_uuid: '456' }
  }
}