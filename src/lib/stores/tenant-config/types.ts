import type { PageConfig } from '$lib/utils/page-registry'

export type NavItem = {
  label: string
  href: string
  visible?: boolean
  disabled?: boolean
}

export interface MenuConfigData {
  id: string
  name: string
  items: NavItem[]
}

export interface TenantConfigData {
  /** Unique tenant identifier */
  id: string
  /** Display name */
  name: string
  /** Subdomain identifier (e.g., 'tenant1' for tenant1.example.com) */
  vanity: string
  /** Pages configured for this tenant */
  pages: PageConfig[]
  /** Menus configured for this tenant */
  menus: MenuConfigData[]
  /** Pre-computed main navigation menu (flattened from all menus) */
  mainMenu: NavItem[]
}

/**
 * @deprecated Use TenantConfigData instead
 * Kept for backward compatibility during migration
 */
export type TenantInterfaceDetails = {
  name: string
  mainMenu: NavItem[]
}
