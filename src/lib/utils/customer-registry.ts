/**
 * @deprecated Use tenantConfigStore directly
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
