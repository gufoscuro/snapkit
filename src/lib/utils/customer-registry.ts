import { tenants as adminTenants, menus as adminMenus } from '$generated/admin-config'

export type NavItem = {
  label: string
  href: string
  visible?: boolean
  disabled?: boolean
}

export type TenantInterfaceDetails = {
  name: string
  mainMenu: Array<NavItem>
}

export async function getTenantInterfaceDetails(tenantVanity: string | null): Promise<TenantInterfaceDetails | null> {
  // First check admin-configured tenants
  const adminTenant = adminTenants.find(t => t.vanity === tenantVanity)
  if (adminTenant) {
    // Get menus assigned to this tenant (menus now have tenantId foreign key)
    const tenantMenus = adminMenus.filter(m => m.tenantId === adminTenant.id)
    const mainMenu = tenantMenus.flatMap(m => m.items)

    return {
      name: adminTenant.name,
      mainMenu,
    }
  }

  // Fallback to hardcoded tenants
  switch (tenantVanity) {
    case 'tenant1':
      return {
        name: 'Tenant 1',
        mainMenu: [
          {
            label: 'Orders',
            href: '/orders',
            visible: true,
          },
          {
            label: 'Products',
            href: '/products',
            visible: true,
          },
        ],
      }
    case 'tenant2':
      return {
        name: 'Tenant 2',
        mainMenu: [
          {
            label: 'Pizze',
            href: '/orders',
            visible: true,
          },
        ],
      }

    default:
      return null
  }
}