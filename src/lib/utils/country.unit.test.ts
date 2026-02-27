import { describe, it, expect } from 'vitest'
import { findCountry, getCountryName, getCountryOptions, validateCountry } from './country'

describe('findCountry', () => {
	it('finds Italy', () => {
		const it = findCountry('IT')
		expect(it).toBeDefined()
		expect(it?.name).toBe('Italy')
	})

	it('returns undefined for unknown code', () => {
		expect(findCountry('XX')).toBeUndefined()
	})
})

describe('getCountryName', () => {
	it('returns name for known country', () => {
		expect(getCountryName('US')).toBe('United States')
	})

	it('returns the code for unknown country', () => {
		expect(getCountryName('XX')).toBe('XX')
	})
})

describe('getCountryOptions', () => {
	it('returns non-empty array', () => {
		expect(getCountryOptions().length).toBeGreaterThan(0)
	})

	it('each option has label and value', () => {
		for (const opt of getCountryOptions()) {
			expect(opt.label).toBeTruthy()
			expect(opt.value).toBeTruthy()
		}
	})

	it('IT option has correct name', () => {
		const itOption = getCountryOptions().find((o) => o.value === 'IT')
		expect(itOption?.label).toBe('Italy')
	})
})

describe('validateCountry', () => {
	it('returns true for valid country', () => {
		expect(validateCountry('IT')).toBe(true)
	})

	it('returns false for invalid country', () => {
		expect(validateCountry('XX')).toBe(false)
	})

	it('returns false for empty string', () => {
		expect(validateCountry('')).toBe(false)
	})
})
