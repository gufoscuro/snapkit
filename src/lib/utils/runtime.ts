import type { TenantInterfaceDetails } from "$utils/customer-registry"
import type { PageDetails } from "$utils/page-registry"

export type SnippetProps = {
  pageDetails: PageDetails
  tenantInterfaceDetails: TenantInterfaceDetails
}