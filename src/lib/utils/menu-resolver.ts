import type { MenuItem, SimpleMenuItem, MenuItemWithSubmenu, NavItem } from '$lib/stores/tenant-config/types'
import { createRoute } from './route-builder'

/**
 * Resolved menu item with computed href
 */
export type ResolvedMenuItem = {
  label: string
  href: string | null
  visible: boolean
  disabled: boolean
  icon?: string
  type: 'link' | 'submenu'
  submenuStyle?: 'list' | 'simple' | 'icon' | 'grid'
  description?: string
  children?: ResolvedMenuItem[]
}

/**
 * Checks if an item is in the old NavItem format (has href instead of pageId/type)
 */
function isLegacyNavItem(item: any): item is NavItem {
  return item && typeof item === 'object' && 'href' in item && !('type' in item) && !('pageId' in item)
}

/**
 * Resolves a legacy NavItem directly to ResolvedMenuItem
 * This provides backward compatibility with old menu configurations
 */
function resolveLegacyNavItem(navItem: NavItem): ResolvedMenuItem {
  console.warn('[menu-resolver] Legacy NavItem format detected. Please update your tenant configuration to use MenuItem format with pageId.')

  return {
    type: 'link',
    label: navItem.label,
    href: navItem.href, // Use href directly from legacy format
    visible: navItem.visible ?? true,
    disabled: navItem.disabled ?? false
  }
}

/**
 * Resolves a simple menu item to include computed href
 */
function resolveSimpleMenuItem(item: SimpleMenuItem): ResolvedMenuItem {
  const href = createRoute({
    $id: item.pageId,
    params: item.params,
    query: item.query
  })

  return {
    type: 'link',
    label: item.label,
    href,
    visible: item.visible ?? true,
    disabled: item.disabled ?? false,
    icon: item.icon
  }
}

/**
 * Resolves a submenu item to include computed href (if pageId is present) and resolved children
 */
function resolveSubmenuItem(item: MenuItemWithSubmenu): ResolvedMenuItem {
  // Resolve href for trigger if pageId is present
  const href = item.pageId
    ? createRoute({
        $id: item.pageId,
        params: item.params,
        query: item.query
      })
    : null

  // Recursively resolve children (with safety check)
  const children = Array.isArray(item.children)
    ? item.children.map(resolveMenuItem)
    : []

  return {
    type: 'submenu',
    label: item.label,
    href,
    visible: item.visible ?? true,
    disabled: item.disabled ?? false,
    icon: item.icon,
    submenuStyle: item.submenuStyle,
    description: item.description,
    children
  }
}

/**
 * Resolves a MenuItem to include computed href using createRoute
 * Also supports legacy NavItem format for backward compatibility
 *
 * @param item - Menu item to resolve
 * @returns Resolved menu item with href
 */
export function resolveMenuItem(item: MenuItem | NavItem): ResolvedMenuItem {
  // Handle legacy NavItem format
  if (isLegacyNavItem(item)) {
    return resolveLegacyNavItem(item)
  }

  // Handle new MenuItem format
  if (item.type === 'link') {
    return resolveSimpleMenuItem(item)
  } else {
    return resolveSubmenuItem(item)
  }
}

/**
 * Resolves an array of menu items
 * Supports both new MenuItem[] and legacy NavItem[] for backward compatibility
 *
 * @param items - Menu items to resolve
 * @returns Array of resolved menu items with hrefs
 */
export function resolveMenuItems(items: MenuItem[] | NavItem[]): ResolvedMenuItem[] {
  // Safety check: ensure items is an array
  if (!Array.isArray(items)) {
    console.warn('[resolveMenuItems] Expected array but got:', typeof items)
    return []
  }

  return items.map(resolveMenuItem)
}
