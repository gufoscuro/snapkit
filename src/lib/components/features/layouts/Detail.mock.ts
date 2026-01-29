/**
 * Mock data for Detail layout component preview
 *
 * This file provides realistic example data for the admin panel block preview system.
 * When creating mock data, always use plausible, business-relevant values.
 */

import type { SnippetProps } from '$utils/runtime'
import type { PageConfig } from '$utils/page-registry'

/**
 * Helper to create PageConfig for Detail layout
 */
function createMockPageConfig(title: string, uuid: string): PageConfig {
	return {
		$id: 'mock-page-detail',
		title,
		route: '/mock/:uuid',
		layout: {
			componentKey: 'layouts.Detail',
			enabled: true
		},
		snippets: {
			appHeader: {
				componentKey: 'globals.AppHeaderWithBack',
				enabled: true
			},
			detail: {
				componentKey: 'supply.upsertsupplyorder.default.UpsertSupplyOrder',
				enabled: true
			}
		}
	}
}

/**
 * Helper to create SnippetProps for Detail layout
 */
function createMockSnippetProps(
	title: string,
	uuid: string
): Pick<SnippetProps, 'pageDetails'> {
	return {
		pageDetails: {
			config: createMockPageConfig(title, uuid),
			params: { uuid }
		}
	}
}

/**
 * Supply order detail layout
 */
export const mockSupplyOrderDetail = createMockSnippetProps(
	'Purchase Order Details',
	'550e8400-e29b-41d4-a716-446655440000'
)

/**
 * Sales order detail layout
 */
export const mockSalesOrderDetail = createMockSnippetProps(
	'Sales Order Details',
	'660e8400-e29b-41d4-a716-446655440001'
)

/**
 * Product detail layout
 */
export const mockProductDetail = createMockSnippetProps(
	'Product Details',
	'770e8400-e29b-41d4-a716-446655440002'
)

/**
 * Default export for simple use case
 */
export default mockSupplyOrderDetail
