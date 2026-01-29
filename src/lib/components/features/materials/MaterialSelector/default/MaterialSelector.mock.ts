/**
 * Mock data for MaterialSelector component preview
 *
 * This file provides realistic example data for the admin panel block preview system.
 * When creating mock data, always use plausible, business-relevant values.
 */

import type { RawMaterialSummary } from '$lib/types/api-types'
import type { ExtendedOption } from '$utils/generics'

/**
 * Mock raw material with supplier
 */
const mockSteel: RawMaterialSummary = {
	id: 'mat-001',
	external_id: 'STL-304',
	name: 'Stainless Steel 304',
	description: 'High-grade stainless steel for industrial applications',
	categories: ['metal', 'steel'],
	supplier_id: 'supp-001',
	supplier_attr: {
		id: 'supp-001',
		name: 'Global Steel Industries',
		vat: 'IT12345678901',
		address: 'Via Industria 45, Milano',
		country: 'Italy'
	},
	uom: 'kg',
	minimum_quantity: 100,
	lead_time: '14 days'
}

/**
 * Mock aluminum material
 */
const mockAluminum: RawMaterialSummary = {
	id: 'mat-002',
	external_id: 'ALU-6061',
	name: 'Aluminum Alloy 6061',
	description: 'General purpose aluminum alloy',
	categories: ['metal', 'aluminum'],
	supplier_id: 'supp-002',
	supplier_attr: {
		id: 'supp-002',
		name: 'Premium Metals Co',
		vat: 'IT98765432109',
		address: 'Viale Metalli 123, Brescia',
		country: 'Italy'
	},
	uom: 'kg',
	minimum_quantity: 50,
	lead_time: '7 days'
}

/**
 * Standard material selector with selection
 */
export const mockMaterialSelector = {
	label: 'Material',
	placeholder: 'Select a material...',
	name: 'material',
	attr: mockSteel,
	showLabel: true,
	showErrorMessage: true,
	readonly: false,
	allowNewRecord: false
}

/**
 * Empty material selector
 */
export const mockEmptyMaterialSelector = {
	label: 'Raw Material',
	placeholder: 'Select a material...',
	name: 'raw_material',
	attr: undefined,
	showLabel: true,
	showErrorMessage: true,
	readonly: false,
	allowNewRecord: false
}

/**
 * Readonly material selector
 */
export const mockReadonlyMaterialSelector = {
	label: 'Material',
	placeholder: 'Select a material...',
	name: 'material',
	attr: mockAluminum,
	showLabel: true,
	showErrorMessage: true,
	readonly: true,
	allowNewRecord: false
}

/**
 * Material selector with error
 */
export const mockMaterialSelectorWithError = {
	label: 'Material',
	placeholder: 'Select a material...',
	name: 'material',
	attr: undefined,
	error: 'Material selection is required',
	showLabel: true,
	showErrorMessage: true,
	readonly: false,
	allowNewRecord: false
}

/**
 * Material selector with new record option
 */
export const mockMaterialSelectorWithNewRecord = {
	label: 'Material',
	placeholder: 'Select a material...',
	name: 'material',
	attr: mockSteel,
	showLabel: true,
	showErrorMessage: true,
	readonly: false,
	allowNewRecord: true
}

/**
 * Default export for simple use case
 */
export default mockMaterialSelector
