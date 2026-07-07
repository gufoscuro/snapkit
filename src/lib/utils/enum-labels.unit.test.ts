import { describe, it, expect, vi } from 'vitest'

// Stub every real paraglide message export with a function returning its own key.
// Deriving the export names from the actual module (via importOriginal) keeps this
// mock from drifting as new enum labels are added to enum-labels.ts — the assertions
// below rely on a label being its own key (e.g. getSupplyStatusLabel('draft') === 'enum_supply_status_draft').
vi.mock('$lib/paraglide/messages.js', async (importOriginal) => {
	const actual = await importOriginal<Record<string, unknown>>()
	return Object.fromEntries(Object.keys(actual).map((k) => [k, () => k]))
})

import {
	toSelectItems,
	getSupplyStatusLabel,
	getSupplyStatusVariant,
	getSalesStatusLabel,
	getSalesStatusVariant,
	getSalesShippedLabel,
	getSalesShippedVariant,
	getCustomerTypeLabel,
	getCustomerTypeVariant,
	getCustomerCommercialStatusLabel,
	getCustomerCommercialStatusVariant,
	getAddressTypeLabel,
	getContactTypeLabel,
} from './enum-labels'

describe('toSelectItems', () => {
	it('converts an enum label map to select items', () => {
		const map = {
			a: () => 'Label A',
			b: () => 'Label B',
		}

		const result = toSelectItems(map)

		expect(result).toEqual([
			{ value: 'a', label: 'Label A' },
			{ value: 'b', label: 'Label B' },
		])
	})

	it('returns empty array for empty map', () => {
		expect(toSelectItems({})).toEqual([])
	})
})

describe('supply order status helpers', () => {
	it('returns label for known status', () => {
		expect(getSupplyStatusLabel('draft')).toBe('enum_supply_status_draft')
	})

	it('falls back to status string for unknown status', () => {
		// @ts-expect-error testing invalid input
		expect(getSupplyStatusLabel('nonexistent')).toBe('nonexistent')
	})

	it('returns variant for known status', () => {
		expect(getSupplyStatusVariant('draft')).toBe('secondary')
		expect(getSupplyStatusVariant('rejected')).toBe('destructive')
	})

	it('returns default variant for unknown status', () => {
		// @ts-expect-error testing invalid input
		expect(getSupplyStatusVariant('nonexistent')).toBe('default')
	})
})

describe('sales order status helpers', () => {
	it('returns label for known status', () => {
		expect(getSalesStatusLabel('draft')).toBe('enum_sales_status_draft')
	})

	it('falls back for unknown status', () => {
		// @ts-expect-error testing invalid input
		expect(getSalesStatusLabel('nonexistent')).toBe('nonexistent')
	})

	it('returns correct variants', () => {
		expect(getSalesStatusVariant('draft')).toBe('secondary')
		expect(getSalesStatusVariant('accepted')).toBe('default')
	})

	it('returns default variant for unknown', () => {
		// @ts-expect-error testing invalid input
		expect(getSalesStatusVariant('nonexistent')).toBe('default')
	})
})

describe('sales shipped status helpers', () => {
	it('returns label for known shipped status', () => {
		expect(getSalesShippedLabel('completed')).toBe('enum_sales_shipped_completed')
	})

	it('falls back for unknown shipped status', () => {
		// @ts-expect-error testing invalid input
		expect(getSalesShippedLabel('nonexistent')).toBe('nonexistent')
	})

	it('returns correct variants', () => {
		expect(getSalesShippedVariant('completed')).toBe('default')
		expect(getSalesShippedVariant('partial')).toBe('outline')
	})

	it('returns default variant for unknown', () => {
		// @ts-expect-error testing invalid input
		expect(getSalesShippedVariant('nonexistent')).toBe('default')
	})
})

describe('customer type helpers', () => {
	it('returns label for known type', () => {
		expect(getCustomerTypeLabel('company')).toBe('enum_customer_type_company')
	})

	it('falls back for unknown type', () => {
		// @ts-expect-error testing invalid input
		expect(getCustomerTypeLabel('nonexistent')).toBe('nonexistent')
	})

	it('returns correct variants', () => {
		expect(getCustomerTypeVariant('company')).toBe('default')
		expect(getCustomerTypeVariant('individual')).toBe('secondary')
	})
})

describe('customer commercial status helpers', () => {
	it('returns label for known status', () => {
		expect(getCustomerCommercialStatusLabel('active')).toBe('enum_customer_status_active')
	})

	it('falls back for unknown status', () => {
		// @ts-expect-error testing invalid input
		expect(getCustomerCommercialStatusLabel('nonexistent')).toBe('nonexistent')
	})

	it('returns correct variants', () => {
		expect(getCustomerCommercialStatusVariant('active')).toBe('default')
		expect(getCustomerCommercialStatusVariant('prospect')).toBe('secondary')
	})
})

describe('address type helpers', () => {
	it('returns label for known type', () => {
		expect(getAddressTypeLabel('billing')).toBe('enum_address_type_billing')
	})

	it('falls back for unknown type', () => {
		// @ts-expect-error testing invalid input
		expect(getAddressTypeLabel('nonexistent')).toBe('nonexistent')
	})
})

describe('contact type helpers', () => {
	it('returns label for known type', () => {
		expect(getContactTypeLabel('primary')).toBe('enum_contact_type_primary')
	})

	it('falls back for unknown type', () => {
		// @ts-expect-error testing invalid input
		expect(getContactTypeLabel('nonexistent')).toBe('nonexistent')
	})
})
