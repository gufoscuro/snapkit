import type { TenantInterfaceDetails } from "$utils/customer-registry"
import type { PageDetails } from "$utils/page-registry"

export type RouteDetails = {
  url: URL,
  search: string | null,
}

export type SnippetProps = {
  pageDetails: PageDetails
  routeDetails: RouteDetails
  tenantInterfaceDetails: TenantInterfaceDetails
}

export type SnippetPropsGetter = () => SnippetProps

export const SNIPPET_PROPS_CONTEXT_KEY = 'snippetProps'