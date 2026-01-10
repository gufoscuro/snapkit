import { getTenantInterfaceDetails } from '$utils/customer-registry'
import { error } from '@sveltejs/kit'
import type { LayoutLoad } from './$types'

export const ssr = false

export const load: LayoutLoad = async event => {
  const hostname = event.url.hostname
  const tenantVanity = hostname.split('.')[0] || null
  const tenantInterfaceDetails = await getTenantInterfaceDetails(tenantVanity)

  if (!tenantInterfaceDetails) {
    throw error(500, `Invalid tenant: ${tenantVanity}`)
  }

  return {
    tenantVanity,
    tenantInterfaceDetails,
  }
}
