import { tenantConfigStore } from '$lib/stores/tenant-config'
import { error } from '@sveltejs/kit'
import type { LayoutLoad } from './$types'

export const ssr = false

export const load: LayoutLoad = async ({ url }) => {
  const hostname = url.hostname
  const tenantVanity = hostname.split('.')[0] || null

  if (!tenantVanity) {
    throw error(500, 'Unable to determine tenant')
  }

  try {
    const tenantConfig = await tenantConfigStore.fetchTenantConfig(tenantVanity)

    return {
      tenantVanity,
      tenantConfig,
      // Backward compatibility: keep tenantInterfaceDetails shape for existing consumers
      tenantInterfaceDetails: {
        name: tenantConfig.name,
        mainMenu: tenantConfig.mainMenu,
      },
    }
  } catch (e) {
    throw error(500, `Invalid tenant: ${tenantVanity}`)
  }
}
