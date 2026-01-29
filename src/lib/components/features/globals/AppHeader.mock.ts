/**
 * Mock data for AppHeader component preview
 *
 * This file provides realistic example data for the admin panel block preview system.
 * When creating mock data, always use plausible, business-relevant values.
 */

import type { SnippetProps } from '$utils/runtime'
import type { PageConfig } from '$utils/page-registry'

/**
 * Helper to create minimal PageConfig for preview
 */
function createMockPageConfig(title: string): PageConfig {
	return {
		$id: 'mock-page',
		title,
		route: '/mock',
		layout: {
			componentKey: 'layouts.List',
			enabled: true
		},
		snippets: {}
	}
}

/**
 * Helper to create SnippetProps for AppHeader
 */
function createMockSnippetProps(
	tenantName: string,
	mainMenu: Array<{ label: string; href: string }>
): Pick<SnippetProps, 'tenantInterfaceDetails' | 'pageDetails' | 'routeDetails'> {
	return {
		tenantInterfaceDetails: {
			name: tenantName,
			mainMenu
		},
		pageDetails: {
			config: createMockPageConfig('Dashboard'),
			params: {}
		},
		routeDetails: {
			url: new URL('http://localhost:5173/'),
			search: null
		}
	}
}

/**
 * Standard tenant with common menu items
 */
export const mockStandardHeader = createMockSnippetProps('Manufacturing Co', [
	{ label: 'Dashboard', href: '/' },
	{ label: 'Orders', href: '/orders' },
	{ label: 'Production', href: '/production' },
	{ label: 'Inventory', href: '/inventory' }
])

/**
 * Sales-focused tenant
 */
export const mockSalesHeader = createMockSnippetProps('Sales Portal', [
	{ label: 'Dashboard', href: '/' },
	{ label: 'Customers', href: '/customers' },
	{ label: 'Orders', href: '/sales/orders' },
	{ label: 'Reports', href: '/reports' }
])

/**
 * Supply chain tenant
 */
export const mockSupplyHeader = createMockSnippetProps('Supply Chain Hub', [
	{ label: 'Dashboard', href: '/' },
	{ label: 'Suppliers', href: '/suppliers' },
	{ label: 'Purchase Orders', href: '/purchase/orders' },
	{ label: 'Materials', href: '/materials' }
])

/**
 * Default export for simple use case
 */
export default mockStandardHeader
