import { tenants, menus, pages } from '$generated/admin-config'
import { PAGES, type PageConfig } from '$lib/utils/page-registry'
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
 * Fetch tenant configuration from source
 *
 * Currently uses static JSON files from admin-config.
 * When backend is ready, replace with apiRequest call.
 *
 * @param vanity - Tenant subdomain identifier
 * @returns Tenant configuration or null if not found
 */
export async function fetchTenantConfigFromSource(
  vanity: string
): Promise<TenantConfigData | null> {
  // Simulate network delay (remove when using real API)
  await new Promise(resolve => setTimeout(resolve, 50))

  // Handle hardcoded admin tenant
  if (vanity === 'admin') {
    return ADMIN_TENANT_CONFIG
  }

  // Find tenant by vanity
  const tenant = tenants.find(t => t.vanity === vanity)
  if (!tenant) return null

  // Get menus for this tenant
  const tenantMenus = menus.filter(m => m.tenantId === tenant.id)

  // Get pages for this tenant from admin config
  const adminPages = pages.filter(p => p.tenantId === tenant.id) as PageConfig[]

  // Also include hardcoded pages that don't have a tenantId (legacy/demo)
  const hardcodedPages = (PAGES as Array<PageConfig & { tenantId?: string }>).filter(
    p => !p.tenantId
  )

  // Merge: admin pages first, then hardcoded fallbacks
  const tenantPages = [...adminPages, ...hardcodedPages]

  // Compute main menu (flatten all menu items)
  const mainMenu = tenantMenus.flatMap(m => m.items)

  return {
    id: tenant.id,
    name: tenant.name,
    vanity: tenant.vanity,
    pages: tenantPages,
    menus: tenantMenus.map(m => ({
      id: m.id,
      name: m.name,
      items: m.items,
    })),
    mainMenu,
  }
}

// Future: Replace with apiRequest when backend is ready
// export async function fetchTenantConfigFromAPI(vanity: string): Promise<TenantConfigData | null> {
//   return await apiRequest<TenantConfigData>({ url: `tenant-config/${vanity}` })
// }
