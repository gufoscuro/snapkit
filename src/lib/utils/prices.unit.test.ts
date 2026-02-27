import { describe, it, expect } from 'vitest'
import {
	findCurrency,
	getCurrencySymbol,
	formatPriceInput,
	parsePriceToFloat,
	floatToPriceString,
	formatPriceDisplay,
	renderPrice,
	renderUnitPrice,
	renderTotalPrice,
} from './prices'

describe('findCurrency', () => {
	it('finds EUR', () => {
		expect(findCurrency('EUR')).toBeDefined()
		expect(findCurrency('EUR')?.symbol).toBe('€')
	})

	it('finds USD', () => {
		expect(findCurrency('USD')?.symbol).toBe('$')
	})

	it('returns undefined for unknown currency', () => {
		expect(findCurrency('XYZ')).toBeUndefined()
	})
})

describe('getCurrencySymbol', () => {
	it('returns symbol for known currency', () => {
		expect(getCurrencySymbol('EUR')).toBe('€')
	})

	it('returns code for unknown currency', () => {
		expect(getCurrencySymbol('XYZ')).toBe('XYZ')
	})
})

describe('formatPriceInput', () => {
	it('strips non-numeric chars for EUR (comma decimal)', () => {
		expect(formatPriceInput('12,50', 'EUR')).toBe('12,50')
	})

	it('strips non-numeric chars for USD (dot decimal)', () => {
		expect(formatPriceInput('12.50', 'USD')).toBe('12.50')
	})

	it('removes letters', () => {
		expect(formatPriceInput('12abc,50', 'EUR')).toBe('12,50')
	})

	it('limits decimal places (EUR = 2)', () => {
		expect(formatPriceInput('12,5678', 'EUR')).toBe('12,56')
	})

	it('handles JPY (0 decimals)', () => {
		expect(formatPriceInput('1234.56', 'JPY')).toBe('1234.')
	})

	it('keeps only first decimal separator', () => {
		expect(formatPriceInput('12,34,56', 'EUR')).toBe('12,34')
	})
})

describe('parsePriceToFloat', () => {
	it('parses European format', () => {
		expect(parsePriceToFloat('1.234,56')).toBe(1234.56)
	})

	it('parses US format', () => {
		expect(parsePriceToFloat('1,234.56')).toBe(1234.56)
	})

	it('parses simple number', () => {
		expect(parsePriceToFloat('100')).toBe(100)
	})
})

describe('floatToPriceString', () => {
	it('formats for EUR', () => {
		expect(floatToPriceString(1234.56, 'EUR')).toBe('1234,56')
	})

	it('formats for USD', () => {
		expect(floatToPriceString(1234.56, 'USD')).toBe('1234.56')
	})

	it('formats for JPY (0 decimals)', () => {
		expect(floatToPriceString(1234, 'JPY')).toBe('1234')
	})
})

describe('formatPriceDisplay', () => {
	it('formats EUR with thousands separator', () => {
		expect(formatPriceDisplay(1234.56, 'EUR')).toBe('1.234,56')
	})

	it('formats USD with thousands separator', () => {
		expect(formatPriceDisplay(1234.56, 'USD')).toBe('1,234.56')
	})

	it('formats large number', () => {
		expect(formatPriceDisplay(1234567.89, 'EUR')).toBe('1.234.567,89')
	})
})

describe('renderPrice', () => {
	it('renders EUR with symbol after', () => {
		expect(renderPrice(1234.56, 'EUR')).toBe('1.234,56 €')
	})

	it('renders USD with symbol before', () => {
		expect(renderPrice(1234.56, 'USD')).toBe('$ 1,234.56')
	})

	it('renders GBP with symbol before', () => {
		expect(renderPrice(99.99, 'GBP')).toBe('£ 99.99')
	})
})

describe('renderUnitPrice', () => {
	it('renders unit price from PriceAttr', () => {
		expect(renderUnitPrice({ unit: 10.5, currency: 'EUR' })).toBe('10,50 €')
	})

	it('returns undefined when unit is missing', () => {
		expect(renderUnitPrice({ currency: 'EUR' })).toBeUndefined()
	})

	it('returns undefined for undefined input', () => {
		expect(renderUnitPrice(undefined)).toBeUndefined()
	})
})

describe('renderTotalPrice', () => {
	it('renders total price from PriceAttr', () => {
		expect(renderTotalPrice({ total: 100, currency: 'USD' })).toBe('$ 100.00')
	})

	it('returns undefined when total is missing', () => {
		expect(renderTotalPrice({ currency: 'EUR' })).toBeUndefined()
	})

	it('returns undefined for undefined input', () => {
		expect(renderTotalPrice(undefined)).toBeUndefined()
	})
})
