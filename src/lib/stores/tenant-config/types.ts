import type { PageConfig } from '$lib/utils/page-registry'

// =============================================================================
// LEGAL ENTITY RESOURCE CONFIG
// =============================================================================

export type ResourceFieldConfig = {
  visible?: boolean
  required?: boolean
}

export type ResourceCustomFieldConfig = {
  key: string
  label: string
  type: 'text' | 'number' | 'boolean' | 'date' | 'select' | 'textarea'
  required: boolean
  options?: string[]
}

export type LegalEntityResourceConfig = {
  fields: Record<string, ResourceFieldConfig>
  custom_fields: ResourceCustomFieldConfig[]
}

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

  icon?: string
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

export interface DashboardConfigData {
  /** Pages configured for this tenant */
  pages: PageConfig[]
  /** Menus configured for this tenant */
  menus: {
    main: MenuConfigData
    [key: string]: MenuConfigData
  }
}

/**
 * Response from GET /api/legal-entities/{legalEntity}/config
 */
export type LegalEntityConfigResponse = {
  version: number | null
  resources: Record<string, LegalEntityResourceConfig>
  /** The UI configuration payload (pages, menus) */
  dashboard: DashboardConfigData
  created_by: string | null
  created_at: string | null
}
