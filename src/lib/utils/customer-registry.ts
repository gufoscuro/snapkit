import { menus as adminMenus, tenants as adminTenants } from '$generated/admin-config'

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
    case 'admin':
      return {
        name: 'Admin',
        mainMenu: [
          {
            label: 'Admin Dashboard',
            href: '/admin',
            visible: true,
          },
        ],
      }

    default:
      return null
  }
}