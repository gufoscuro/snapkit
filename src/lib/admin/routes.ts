/**
 * Admin Panel Routes
 *
 * Centralized route definitions for the admin panel.
 * Tenant selection is managed via localStorage, not URL params.
 */

// Base admin path
const ADMIN_BASE = '/admin'

// Dashboard
export const adminDashboardRouteId = () => `${ADMIN_BASE}`
export const adminDashboardRoute = () => ADMIN_BASE

// Pages
export const adminPagesRouteId = () => `${ADMIN_BASE}/pages`
export const adminPagesRoute = () => `${ADMIN_BASE}/pages`

export const adminPageUpsertRouteId = () => `${ADMIN_BASE}/pages/[id]`
export const adminPageUpsertRoute = (pageId: string) => `${ADMIN_BASE}/pages/${pageId}`

// Menus
export const adminMenusRouteId = () => `${ADMIN_BASE}/menus`
export const adminMenusRoute = () => `${ADMIN_BASE}/menus`

export const adminMenuUpsertRouteId = () => `${ADMIN_BASE}/menus/[id]`
export const adminMenuUpsertRoute = (menuId: string) => `${ADMIN_BASE}/menus/${menuId}`

// Tenants
export const adminTenantsRouteId = () => `${ADMIN_BASE}/tenants`
export const adminTenantsRoute = () => `${ADMIN_BASE}/tenants`

export const adminTenantUpsertRouteId = () => `${ADMIN_BASE}/tenants/[id]`
export const adminTenantUpsertRoute = (tenantId: string) => `${ADMIN_BASE}/tenants/${tenantId}`

// Blocks
export const adminBlocksRouteId = () => `${ADMIN_BASE}/blocks`
export const adminBlocksRoute = () => `${ADMIN_BASE}/blocks`

export const adminBlockUpsertRouteId = () => `${ADMIN_BASE}/blocks/[id]`
export const adminBlockUpsertRoute = (blockId: string) => `${ADMIN_BASE}/blocks/${blockId}`

/**
 * Check if the current route matches a given route ID
 */
export function isCurrentRoute(currentRouteId: string | null, routeId: string): boolean {
	return currentRouteId === routeId
}

/**
 * Check if the current route starts with a given path (for active state on parent routes)
 */
export function isRouteActive(currentPath: string, routePath: string): boolean {
	if (routePath === ADMIN_BASE) {
		return currentPath === ADMIN_BASE
	}
	return currentPath.startsWith(routePath)
}

/**
 * Get the sidebar context for the current route
 */
export function getSidebarContextFromRoute(
	currentPath: string
): 'navigation' | 'blocks' | null {
	if (currentPath.startsWith(adminBlocksRoute())) {
		return 'blocks'
	}
	if (
		currentPath === ADMIN_BASE ||
		currentPath.startsWith(adminPagesRoute()) ||
		currentPath.startsWith(adminMenusRoute()) ||
		currentPath.startsWith(adminTenantsRoute())
	) {
		return 'navigation'
	}
	return null
}

/**
 * Check if current path is a blocks list page
 */
export function isBlocksListPage(currentPath: string): boolean {
	return currentPath === adminBlocksRoute()
}
