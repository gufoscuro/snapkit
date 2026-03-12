import { describe, it, expect, vi } from 'vitest'

const mockModule = vi.hoisted(() => {
	const keys = [
		'enum_supply_status_draft', 'enum_supply_status_sent', 'enum_supply_status_accepted',
		'enum_supply_status_shipped', 'enum_supply_status_rejected',
		'enum_sales_status_draft', 'enum_sales_status_sent', 'enum_sales_status_accepted',
		'enum_sales_shipped_completed', 'enum_sales_shipped_not_shipped', 'enum_sales_shipped_partial',
		'enum_customer_type_company', 'enum_customer_type_individual', 'enum_customer_type_public_entity',
		'enum_customer_type_consortium', 'enum_customer_type_association',
		'enum_customer_status_active', 'enum_customer_status_suspended',
		'enum_customer_status_ceased', 'enum_customer_status_prospect',
		'enum_address_type_billing', 'enum_address_type_shipping', 'enum_address_type_legal',
		'enum_contact_type_primary', 'enum_contact_type_technical_support',
		'enum_contact_type_administrative', 'enum_contact_type_logistics', 'enum_contact_type_quality',
		'enum_contact_type_purchasing', 'enum_contact_type_sales',
		'enum_currency_EUR', 'enum_currency_USD', 'enum_currency_GBP', 'enum_currency_CHF',
		'enum_currency_JPY', 'enum_currency_CNY', 'enum_currency_CAD', 'enum_currency_AUD',
		'enum_currency_SEK', 'enum_currency_NOK', 'enum_currency_DKK', 'enum_currency_PLN',
		'enum_currency_CZK', 'enum_currency_HUF', 'enum_currency_RON', 'enum_currency_BGN',
		'enum_currency_TRY', 'enum_currency_BRL', 'enum_currency_INR', 'enum_currency_AED',
		'enum_currency_SAR',
		'enum_ateco_A', 'enum_ateco_B', 'enum_ateco_C', 'enum_ateco_D', 'enum_ateco_E',
		'enum_ateco_F', 'enum_ateco_G', 'enum_ateco_H', 'enum_ateco_I', 'enum_ateco_J',
		'enum_ateco_K', 'enum_ateco_L', 'enum_ateco_M', 'enum_ateco_N', 'enum_ateco_O',
		'enum_ateco_P', 'enum_ateco_Q', 'enum_ateco_R', 'enum_ateco_S', 'enum_ateco_T',
		'enum_ateco_U', 'enum_ateco_V',
		'enum_company_size_micro', 'enum_company_size_small', 'enum_company_size_medium',
		'enum_company_size_large', 'enum_company_size_enterprise',
		'enum_employee_count_1_9', 'enum_employee_count_10_49', 'enum_employee_count_50_249',
		'enum_employee_count_250_999', 'enum_employee_count_1000_plus',
		'enum_annual_revenue_under_2m', 'enum_annual_revenue_2m_10m', 'enum_annual_revenue_10m_50m',
		'enum_annual_revenue_50m_250m', 'enum_annual_revenue_over_250m',
		'enum_warehouse_type_main', 'enum_warehouse_type_consignment', 'enum_warehouse_type_subcontracting',
		'enum_warehouse_type_returns', 'enum_warehouse_type_defective', 'enum_warehouse_type_spare_parts',
		'enum_warehouse_type_transit', 'enum_warehouse_type_quarantine',
		'enum_valuation_method_weighted_average', 'enum_valuation_method_fifo',
		'enum_valuation_method_standard', 'enum_valuation_method_last_cost',
		'enum_zone_type_receiving', 'enum_zone_type_storage', 'enum_zone_type_shipping',
		'enum_zone_type_quarantine', 'enum_zone_type_production',
		'enum_bin_location_type_shelf', 'enum_bin_location_type_floor', 'enum_bin_location_type_cell',
		'enum_bin_location_type_picking', 'enum_bin_location_type_bulk',
	]
	return Object.fromEntries(keys.map((k) => [k, () => k]))
})

vi.mock('$lib/paraglide/messages.js', () => mockModule)

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
	getCustomerStatusLabel,
	getCustomerStatusVariant,
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

describe('customer status helpers', () => {
	it('returns label for known status', () => {
		expect(getCustomerStatusLabel('active')).toBe('enum_customer_status_active')
	})

	it('falls back for unknown status', () => {
		// @ts-expect-error testing invalid input
		expect(getCustomerStatusLabel('nonexistent')).toBe('nonexistent')
	})

	it('returns correct variants', () => {
		expect(getCustomerStatusVariant('active')).toBe('default')
		expect(getCustomerStatusVariant('suspended')).toBe('outline')
		expect(getCustomerStatusVariant('prospect')).toBe('secondary')
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
