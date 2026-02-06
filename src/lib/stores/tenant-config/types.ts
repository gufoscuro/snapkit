import type { PageConfig } from '$lib/utils/page-registry'

/**
 * @deprecated Use MenuItem instead
 * Kept for backward compatibility during migration
 */
export type NavItem = {
  label: string
  href: string
  visible?: boolean
  disabled?: boolean
}

/**
 * Base properties shared by all menu items
 */
export type MenuItemBase = {
  /** Display label for the menu item */
  label: string
  /** Page ID from page registry - used with createRoute() */
  pageId: string
  /** Optional parameters for dynamic routes (e.g., { uuid: '123' }) */
  params?: Record<string, string | number>
  /** Optional query parameters */
  query?: Record<string, string | number | boolean>
  /** Whether the menu item is visible (default: true) */
  visible?: boolean
  /** Whether the menu item is disabled (default: false) */
  disabled?: boolean
  /** Optional Lucide icon name (e.g., 'home', 'settings', 'package') */
  icon?: string
}

/**
 * Simple menu item that links directly to a page
 */
export type SimpleMenuItem = MenuItemBase & {
  type: 'link'
}

/**
 * Submenu styles supported by the Navigation Menu component
 * - list: Items with title + description (best for feature sections)
 * - simple: Compact list of links without descriptions
 * - icon: Links with icons
 * - grid: Grid layout for many items (e.g., components showcase)
 */
export type SubmenuStyle = 'list' | 'simple' | 'icon' | 'grid'

/**
 * Menu item with submenu children
 */
export type MenuItemWithSubmenu = Omit<MenuItemBase, 'pageId'> & {
  type: 'submenu'
  /** Optional pageId - if present, the trigger itself is clickable */
  pageId?: string
  /** Optional parameters (only used if pageId is present) */
  params?: Record<string, string | number>
  /** Optional query parameters (only used if pageId is present) */
  query?: Record<string, string | number | boolean>
  /** How to render the submenu content */
  submenuStyle: SubmenuStyle
  /** Child menu items */
  children: MenuItem[]
  /** Optional description (shown in list-style submenu) */
  description?: string
}

/**
 * Union type for all menu item variants
 */
export type MenuItem = SimpleMenuItem | MenuItemWithSubmenu

export interface MenuConfigData {
  id: string
  name: string
  items: MenuItem[]
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
  mainMenu: MenuItem[]
}

/**
 * @deprecated Use TenantConfigData instead
 * Kept for backward compatibility during migration
 */
export type TenantInterfaceDetails = {
  name: string
  mainMenu: NavItem[]
}
