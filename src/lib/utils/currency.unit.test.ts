import { describe, it, expect } from 'vitest'
import { findCurrency, getCurrencySymbol, getCurrencyOptions, validateCurrency } from './currency'

describe('findCurrency', () => {
	it('finds EUR config', () => {
		const eur = findCurrency('EUR')
		expect(eur).toBeDefined()
		expect(eur?.code).toBe('EUR')
		expect(eur?.symbol).toBe('€')
	})

	it('finds USD config', () => {
		expect(findCurrency('USD')?.symbol).toBe('$')
	})

	it('returns undefined for unknown code', () => {
		expect(findCurrency('FAKE')).toBeUndefined()
	})
})

describe('getCurrencySymbol', () => {
	it('returns symbol for known currency', () => {
		expect(getCurrencySymbol('GBP')).toBe('£')
	})

	it('returns the code itself for unknown currency', () => {
		expect(getCurrencySymbol('NOPE')).toBe('NOPE')
	})
})

describe('getCurrencyOptions', () => {
	it('returns non-empty array', () => {
		const options = getCurrencyOptions()
		expect(options.length).toBeGreaterThan(0)
	})

	it('each option has label and value', () => {
		const options = getCurrencyOptions()
		for (const opt of options) {
			expect(opt.label).toBeTruthy()
			expect(opt.value).toBeTruthy()
		}
	})

	it('EUR option has correct format', () => {
		const eurOption = getCurrencyOptions().find((o) => o.value === 'EUR')
		expect(eurOption?.label).toBe('€ (EUR)')
	})
})

describe('validateCurrency', () => {
	it('returns true for valid currency', () => {
		expect(validateCurrency('EUR')).toBe(true)
	})

	it('returns false for invalid currency', () => {
		expect(validateCurrency('FAKE')).toBe(false)
	})

	it('returns false for empty string', () => {
		expect(validateCurrency('')).toBe(false)
	})
})
