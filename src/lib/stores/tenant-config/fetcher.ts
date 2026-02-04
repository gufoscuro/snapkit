import type { TenantConfigData } from './types'

/**
 * Hardcoded admin tenant configuration
 * Used as fallback when 'admin' vanity is accessed
 */
const ADMIN_TENANT_CONFIG: TenantConfigData = {
  id: 'admin',
  name: 'Admin',
  vanity: 'admin',
  pages: [],
  menus: [],
  mainMenu: [
    {
      label: 'Admin Dashboard',
      href: '/admin',
      visible: true,
    },
  ],
}

/**
 * Fetch tenant configuration from API
 *
 * @param vanity - Tenant subdomain identifier
 * @returns Tenant configuration or null if not found
 */
export async function fetchTenantConfigFromAPI(
  vanity: string
): Promise<TenantConfigData | null> {
  try {
    // Use direct fetch since this can be called server-side in +layout.ts
    const response = await fetch(`/api/tenant-config/${vanity}`)

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`Failed to fetch tenant config: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching tenant config for ${vanity}:`, error)
    return null
  }
}

/**
 * Fetch tenant configuration from source
 *
 * Now uses the API endpoint to retrieve tenant configuration.
 *
 * @param vanity - Tenant subdomain identifier
 * @returns Tenant configuration or null if not found
 */
export async function fetchTenantConfigFromSource(
  vanity: string
): Promise<TenantConfigData | null> {
  // Handle hardcoded admin tenant
  if (vanity === 'admin') {
    return ADMIN_TENANT_CONFIG
  }

  // Fetch from API
  return fetchTenantConfigFromAPI(vanity)
}
