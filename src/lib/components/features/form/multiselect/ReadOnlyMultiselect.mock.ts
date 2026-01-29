/**
 * Mock data for ReadOnlyMultiselect component preview
 *
 * This file provides realistic example data for the admin panel block preview system.
 * When creating mock data, always use plausible, business-relevant values.
 */

import type { ExtendedOption } from '$utils/generics'

/**
 * Standard readonly selector with value
 */
export const mockReadonlySelector = {
	label: 'Payment Method',
	placeholder: 'Select payment method...',
	name: 'payment_method',
	selectedValue: {
		label: 'Bank Transfer',
		value: 'bank-transfer'
	} as ExtendedOption,
	showLabel: true,
	width: 'w-full'
}

/**
 * Readonly customer selector
 */
export const mockReadonlyCustomer = {
	label: 'Customer',
	placeholder: 'Select customer...',
	name: 'customer',
	selectedValue: {
		label: 'Acme Manufacturing Ltd',
		value: 'cust-001'
	} as ExtendedOption,
	showLabel: true,
	width: 'w-full'
}

/**
 * Readonly supplier selector
 */
export const mockReadonlySupplier = {
	label: 'Supplier',
	placeholder: 'Select supplier...',
	name: 'supplier',
	selectedValue: {
		label: 'Global Materials Co',
		value: 'supp-001'
	} as ExtendedOption,
	showLabel: true,
	width: 'w-full'
}

/**
 * Readonly selector with long value
 */
export const mockReadonlyLongValue = {
	label: 'Delivery Address',
	placeholder: 'Select address...',
	name: 'delivery_address',
	selectedValue: {
		label: 'Warehouse Complex Building 7, Industrial Park Zone 3, North District',
		value: 'addr-001'
	} as ExtendedOption,
	showLabel: true,
	width: 'w-full'
}

/**
 * Readonly selector without label
 */
export const mockReadonlyNoLabel = {
	label: 'Status',
	placeholder: 'Select status...',
	name: 'status',
	selectedValue: {
		label: 'Active',
		value: 'active'
	} as ExtendedOption,
	showLabel: false,
	width: 'w-48'
}

/**
 * Default export for simple use case
 */
export default mockReadonlySelector
