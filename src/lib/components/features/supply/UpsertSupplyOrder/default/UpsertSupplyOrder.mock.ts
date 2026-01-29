/**
 * Mock data for UpsertSupplyOrder component preview
 *
 * This file provides realistic example data for the admin panel block preview system.
 * When creating mock data, always use plausible, business-relevant values.
 */

import type { SnippetProps } from '$utils/runtime'
import type { PageConfig } from '$utils/page-registry'
import { Type } from '@sinclair/typebox'

/**
 * Helper to create PageConfig for UpsertSupplyOrder
 */
function createMockPageConfig(uuid: string): PageConfig {
	return {
		$id: 'order-detail',
		$params: Type.Object({ uuid: Type.String() }),
		title: 'purchase_order_detail',
		route: '/purchase/orders/upsert/:uuid',
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
				enabled: true,
				componentKey: 'supply.upsertsupplyorder.default.UpsertSupplyOrder'
			}
		}
	}
}

/**
 * Helper to create SnippetProps for UpsertSupplyOrder
 */
function createMockSnippetProps(
	uuid: string
): Pick<SnippetProps, 'pageDetails' | 'routeDetails'> {
	return {
		pageDetails: {
			config: createMockPageConfig(uuid),
			params: { uuid }
		},
		routeDetails: {
			url: new URL(`http://localhost:5173/purchase/orders/upsert/${uuid}`),
			search: null
		}
	}
}

/**
 * Standard supply order detail
 */
export const mockSupplyOrderDetail = createMockSnippetProps(
	'550e8400-e29b-41d4-a716-446655440000'
)

/**
 * Different supply order
 */
export const mockSupplyOrderDetail2 = createMockSnippetProps(
	'660e8400-e29b-41d4-a716-446655440001'
)

/**
 * New supply order (create mode)
 */
export const mockNewSupplyOrder = createMockSnippetProps('new')

/**
 * Default export for simple use case
 */
export default mockSupplyOrderDetail
