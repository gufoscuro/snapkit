import { tenantConfigStore } from '$lib/stores/tenant-config'

/**
 * @deprecated Use MenuItem from '$lib/stores/tenant-config/types' instead
 * Kept for backward compatibility during migration
 */
export type NavItem = {
  label: string
  href: string
  visible?: boolean
  disabled?: boolean
}

/**
 * @deprecated Use TenantConfigData from '$lib/stores/tenant-config/types' instead
 * Kept for backward compatibility during migration
 */
export type TenantInterfaceDetails = {
  name: string
  mainMenu: Array<NavItem>
}

/**
 * @deprecated Use tenantConfigStore.fetchTenantConfig() instead
 * This function is kept for backward compatibility during migration.
 */
export async function getTenantInterfaceDetails(
  tenantVanity: string | null
): Promise<TenantInterfaceDetails | null> {
  console.warn(
    '[DEPRECATED] getTenantInterfaceDetails() - use tenantConfigStore.fetchTenantConfig() instead'
  )

  if (!tenantVanity) return null

  try {
    const config = await tenantConfigStore.fetchTenantConfig(tenantVanity)
    return {
      name: config.name,
      mainMenu: config.mainMenu,
    }
  } catch {
    return null
  }
}
