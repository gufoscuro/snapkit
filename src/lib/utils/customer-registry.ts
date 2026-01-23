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
  switch (tenantVanity) {
    case 'tenant1':
      return {
        name: 'Tenant 1',
        mainMenu: [
          {
            label: 'supply_orders',
            href: '/purchase/orders',
            visible: true,
          },
          {
            label: 'sales_orders',
            href: '/sales/orders',
            visible: true,
          },
          {
            label: 'production',
            href: '/production',
            visible: true,
          },
        ],
      }
    case 'tenant2':
      return {
        name: 'Tenant 2',
        mainMenu: [
          {
            label: 'purchase_orders',
            href: '/purchase/orders',
            visible: true,
          },
        ],
      }

    default:
      return null
  }
}