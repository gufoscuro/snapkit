/**
 * Mock data for FormProductSelector component preview
 *
 * This file provides realistic example data for the admin panel block preview system.
 * When creating mock data, always use plausible, business-relevant values.
 */

import type { ProductSummary } from '$lib/types/api-types'
import type { ExtendedOption } from '$utils/generics'

/**
 * Mock producible product
 */
const mockWidget: ProductSummary = {
	id: 'prod-001',
	name: 'Industrial Widget XL',
	internal_id: 'WDG-XL-001',
	categories: ['industrial', 'widgets'],
	type: 'producible',
	uom: 'pcs',
	prices: {
		base_price: 45.99,
		currency: 'EUR',
		unit: 1
	}
}

/**
 * Mock purchasable product
 */
const mockGearbox: ProductSummary = {
	id: 'prod-002',
	name: 'Precision Gearbox Assembly',
	internal_id: 'GBX-PRE-002',
	categories: ['mechanical', 'components'],
	type: 'purchasable',
	uom: 'pcs',
	prices: {
		base_price: 289.50,
		currency: 'EUR',
		unit: 1
	}
}

/**
 * Mock bundle product
 */
const mockStarterKit: ProductSummary = {
	id: 'prod-003',
	name: 'Manufacturing Starter Kit',
	internal_id: 'KIT-STR-003',
	categories: ['kits', 'bundles'],
	type: 'bundle',
	uom: 'pcs',
	prices: {
		base_price: 1250.00,
		currency: 'EUR',
		unit: 1
	}
}

/**
 * Standard product selector with selection
 */
export const mockProductSelector = {
	label: 'Product',
	placeholder: 'Select a product...',
	name: 'product',
	attr: mockWidget,
	showLabel: true,
	showErrorMessage: true,
	readonly: false,
	allowNewRecord: false
}

/**
 * Empty product selector
 */
export const mockEmptyProductSelector = {
	label: 'Product',
	placeholder: 'Select a product...',
	name: 'product',
	attr: undefined,
	showLabel: true,
	showErrorMessage: true,
	readonly: false,
	allowNewRecord: false
}

/**
 * Readonly product selector
 */
export const mockReadonlyProductSelector = {
	label: 'Product',
	placeholder: 'Select a product...',
	name: 'product',
	attr: mockGearbox,
	showLabel: true,
	showErrorMessage: true,
	readonly: true,
	allowNewRecord: false
}

/**
 * Product selector with error
 */
export const mockProductSelectorWithError = {
	label: 'Product',
	placeholder: 'Select a product...',
	name: 'product',
	attr: undefined,
	error: 'Product selection is required',
	showLabel: true,
	showErrorMessage: true,
	readonly: false,
	allowNewRecord: false
}

/**
 * Product selector for bundle
 */
export const mockBundleProductSelector = {
	label: 'Product Bundle',
	placeholder: 'Select a product bundle...',
	name: 'product_bundle',
	attr: mockStarterKit,
	showLabel: true,
	showErrorMessage: true,
	readonly: false,
	allowNewRecord: false
}

/**
 * Default export for simple use case
 */
export default mockProductSelector
