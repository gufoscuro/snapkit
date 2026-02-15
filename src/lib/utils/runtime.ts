import type { UserResource } from '$lib/types/api-types'
import type { PageDetails } from '$utils/page-registry'

export type RouteDetails = {
  url: URL
  search: string | null
}

export type SnippetProps = {
  pageDetails: PageDetails
  routeDetails: RouteDetails
  user: UserResource
}

export type SnippetPropsGetter = () => SnippetProps

export const SNIPPET_PROPS_CONTEXT_KEY = 'snippetProps'
