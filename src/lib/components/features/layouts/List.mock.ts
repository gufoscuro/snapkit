/**
 * Mock data for List layout component preview
 *
 * This file provides realistic example data for the admin panel block preview system.
 * When creating mock data, always use plausible, business-relevant values.
 */

import type { SnippetProps } from '$utils/runtime'
import type { PageConfig } from '$utils/page-registry'

/**
 * Helper to create PageConfig for List layout
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
		snippets: {
			appHeader: {
				componentKey: 'globals.AppHeader',
				enabled: true
			},
			title: {
				componentKey: 'globals.PageTitle',
				enabled: true
			},
			filters: {
				componentKey: '_poc.demofilter.DemoFilter',
				enabled: true
			},
			table: {
				componentKey: '_poc.demotable.DemoTable',
				enabled: true
			}
		}
	}
}

/**
 * Helper to create SnippetProps for List layout
 */
function createMockSnippetProps(title: string): Pick<SnippetProps, 'pageDetails'> {
	return {
		pageDetails: {
			config: createMockPageConfig(title),
			params: {}
		}
	}
}

/**
 * Sales orders list layout
 */
export const mockSalesOrdersList = createMockSnippetProps('Sales Orders')

/**
 * Supply orders list layout
 */
export const mockSupplyOrdersList = createMockSnippetProps('Purchase Orders')

/**
 * Products list layout
 */
export const mockProductsList = createMockSnippetProps('Product Catalog')

/**
 * Customers list layout
 */
export const mockCustomersList = createMockSnippetProps('Customer Management')

/**
 * Default export for simple use case
 */
export default mockSalesOrdersList
