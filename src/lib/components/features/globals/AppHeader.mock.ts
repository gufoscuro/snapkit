/**
 * Mock data for AppHeader component preview
 *
 * This file provides realistic example data for the admin panel block preview system.
 * When creating mock data, always use plausible, business-relevant values.
 */

import type { SnippetProps } from '$utils/runtime'
import type { PageConfig } from '$utils/page-registry'
import type { MenuItem } from '$lib/stores/tenant-config/types'

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
	mainMenu: MenuItem[]
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
 * Standard tenant with simple menu items
 */
export const mockStandardHeader = createMockSnippetProps('Manufacturing Co', [
	{ type: 'link', label: 'Dashboard', pageId: 'dashboard' },
	{ type: 'link', label: 'Orders', pageId: 'order-list' },
	{ type: 'link', label: 'Production', pageId: 'production-overview' },
	{ type: 'link', label: 'Inventory', pageId: 'inventory-list' }
])

/**
 * Sales-focused tenant with submenu
 */
export const mockSalesHeader = createMockSnippetProps('Sales Portal', [
	{ type: 'link', label: 'Dashboard', pageId: 'dashboard', icon: 'home' },
	{
		type: 'submenu',
		label: 'Orders',
		icon: 'package',
		submenuStyle: 'list',
		children: [
			{
				type: 'link',
				label: 'All Orders',
				pageId: 'order-list',
				description: 'View and manage all sales orders'
			},
			{
				type: 'link',
				label: 'Pending Orders',
				pageId: 'order-list',
				query: { status: 'pending' },
				description: 'Orders awaiting processing'
			},
			{
				type: 'link',
				label: 'Create Order',
				pageId: 'order-create',
				description: 'Create a new sales order'
			}
		]
	},
	{ type: 'link', label: 'Customers', pageId: 'customer-list', icon: 'users' },
	{ type: 'link', label: 'Reports', pageId: 'reports-dashboard', icon: 'bar-chart' }
])

/**
 * Supply chain tenant with grid-style submenu
 */
export const mockSupplyHeader = createMockSnippetProps('Supply Chain Hub', [
	{ type: 'link', label: 'Dashboard', pageId: 'dashboard' },
	{
		type: 'submenu',
		label: 'Materials',
		submenuStyle: 'grid',
		children: [
			{ type: 'link', label: 'Raw Materials', pageId: 'materials-raw' },
			{ type: 'link', label: 'Components', pageId: 'materials-components' },
			{ type: 'link', label: 'Finished Goods', pageId: 'materials-finished' },
			{ type: 'link', label: 'Packaging', pageId: 'materials-packaging' },
			{ type: 'link', label: 'Consumables', pageId: 'materials-consumables' },
			{ type: 'link', label: 'Tools', pageId: 'materials-tools' }
		]
	},
	{ type: 'link', label: 'Suppliers', pageId: 'supplier-list' },
	{ type: 'link', label: 'Purchase Orders', pageId: 'purchase-order-list' }
])

/**
 * Advanced tenant with icon-style submenu
 */
export const mockAdvancedHeader = createMockSnippetProps('Advanced Portal', [
	{ type: 'link', label: 'Home', pageId: 'dashboard', icon: 'home' },
	{
		type: 'submenu',
		label: 'Workflow',
		submenuStyle: 'icon',
		children: [
			{ type: 'link', label: 'Backlog', pageId: 'workflow-backlog', icon: 'circle-help' },
			{ type: 'link', label: 'In Progress', pageId: 'workflow-progress', icon: 'circle' },
			{ type: 'link', label: 'Done', pageId: 'workflow-done', icon: 'circle-check' }
		]
	},
	{ type: 'link', label: 'Settings', pageId: 'settings', icon: 'settings' }
])

/**
 * Default export for simple use case
 */
export default mockStandardHeader
