/**
 * Mock data for AppHeaderWithBack component preview
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
			componentKey: 'layouts.Detail',
			enabled: true
		},
		snippets: {}
	}
}

/**
 * Helper to create SnippetProps for AppHeaderWithBack
 */
function createMockSnippetProps(
	tenantName: string
): Pick<SnippetProps, 'tenantInterfaceDetails' | 'pageDetails' | 'routeDetails'> {
	return {
		tenantInterfaceDetails: {
			name: tenantName,
			mainMenu: []
		},
		pageDetails: {
			config: createMockPageConfig('Order Details'),
			params: {}
		},
		routeDetails: {
			url: new URL('http://localhost:5173/orders/12345'),
			search: null
		}
	}
}

/**
 * Standard back header for detail page
 */
export const mockOrderDetailHeader = createMockSnippetProps('Manufacturing Co')

/**
 * Back header for supply order detail
 */
export const mockSupplyOrderDetailHeader = createMockSnippetProps('Supply Chain Hub')

/**
 * Back header for sales order detail
 */
export const mockSalesOrderDetailHeader = createMockSnippetProps('Sales Portal')

/**
 * Default export for simple use case
 */
export default mockOrderDetailHeader
