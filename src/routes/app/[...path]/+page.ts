import { getPageByRoute } from '$lib/utils/page-registry'
import { error } from '@sveltejs/kit'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ params }) => {
  const route = `/${params.path}`

  // Look up page config with pattern matching
  const pageDetails = await getPageByRoute(route)

  if (!pageDetails) {
    throw error(404, `Page not found: ${route}`)
  }

  return {
    pageDetails,
  }
}