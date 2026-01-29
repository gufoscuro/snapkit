/**
 * Mock data for FormGenericSingleSelector component preview
 *
 * This file provides realistic example data for the admin panel block preview system.
 * When creating mock data, always use plausible, business-relevant values.
 */

import type { ExtendedOption } from '$utils/generics'

/**
 * Mock customer type
 */
type MockCustomer = {
	id: string
	name: string
	email: string
}

/**
 * Mock supplier type
 */
type MockSupplier = {
	id: string
	name: string
	vat: string
}

/**
 * Standard customer selector
 */
export const mockCustomerSelector = {
	label: 'Customer',
	placeholder: 'Select a customer...',
	name: 'customer',
	selectedValue: {
		label: 'Acme Manufacturing Ltd',
		value: 'cust-001',
		attr: {
			id: 'cust-001',
			name: 'Acme Manufacturing Ltd',
			email: 'orders@acme-mfg.com'
		} as MockCustomer
	} as ExtendedOption<MockCustomer>,
	showLabel: true,
	showErrorMessage: true,
	readonly: false,
	allowNewRecord: false,
	allowClear: true
}

/**
 * Supplier selector
 */
export const mockSupplierSelector = {
	label: 'Supplier',
	placeholder: 'Select a supplier...',
	name: 'supplier',
	selectedValue: {
		label: 'Global Materials Co',
		value: 'supp-001',
		attr: {
			id: 'supp-001',
			name: 'Global Materials Co',
			vat: 'IT12345678901'
		} as MockSupplier
	} as ExtendedOption<MockSupplier>,
	showLabel: true,
	showErrorMessage: true,
	readonly: false,
	allowNewRecord: false,
	allowClear: true
}

/**
 * Empty selector (no selection)
 */
export const mockEmptySelector = {
	label: 'Sales Channel',
	placeholder: 'Select a sales channel...',
	name: 'sales_channel',
	selectedValue: undefined,
	showLabel: true,
	showErrorMessage: true,
	readonly: false,
	allowNewRecord: false,
	allowClear: true
}

/**
 * Readonly selector
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
	showErrorMessage: true,
	readonly: true,
	allowNewRecord: false,
	allowClear: false
}

/**
 * Selector with error
 */
export const mockSelectorWithError = {
	label: 'Shipping Method',
	placeholder: 'Select shipping method...',
	name: 'shipping_method',
	selectedValue: undefined,
	error: 'Shipping method is required',
	showLabel: true,
	showErrorMessage: true,
	readonly: false,
	allowNewRecord: false,
	allowClear: true
}

/**
 * Default export for simple use case
 */
export default mockCustomerSelector
