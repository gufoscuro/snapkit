import { describe, it, expect } from 'vitest'
import { dotToComma, commaToDot, parseLocalizedNumber, formatNumber, roundTo, clamp } from './numbers'

describe('dotToComma', () => {
	it('replaces dots with commas', () => {
		expect(dotToComma('1.50')).toBe('1,50')
	})

	it('handles multiple dots', () => {
		expect(dotToComma('1.000.50')).toBe('1,000,50')
	})

	it('handles string without dots', () => {
		expect(dotToComma('150')).toBe('150')
	})
})

describe('commaToDot', () => {
	it('replaces commas with dots', () => {
		expect(commaToDot('1,50')).toBe('1.50')
	})

	it('handles multiple commas', () => {
		expect(commaToDot('1,000,50')).toBe('1.000.50')
	})
})

describe('parseLocalizedNumber', () => {
	it('parses US format (dot decimal)', () => {
		expect(parseLocalizedNumber('1,234.56')).toBe(1234.56)
	})

	it('parses European format (comma decimal)', () => {
		expect(parseLocalizedNumber('1.234,56')).toBe(1234.56)
	})

	it('parses simple integer', () => {
		expect(parseLocalizedNumber('100')).toBe(100)
	})

	it('parses simple decimal with dot', () => {
		expect(parseLocalizedNumber('10.5')).toBe(10.5)
	})

	it('parses simple decimal with comma', () => {
		expect(parseLocalizedNumber('10,5')).toBe(10.5)
	})

	it('returns 0 for empty string', () => {
		expect(parseLocalizedNumber('')).toBe(0)
	})

	it('returns 0 for non-numeric input', () => {
		expect(parseLocalizedNumber('abc')).toBe(0)
	})

	it('strips spaces (thousands separator)', () => {
		expect(parseLocalizedNumber('1 234,56')).toBe(1234.56)
	})
})

describe('formatNumber', () => {
	it('formats with default options (European)', () => {
		expect(formatNumber(1234.56)).toBe('1.234,56')
	})

	it('formats with US style', () => {
		expect(formatNumber(1234.56, {
			decimalSeparator: '.',
			thousandsSeparator: ',',
		})).toBe('1,234.56')
	})

	it('formats with custom decimals', () => {
		expect(formatNumber(1234.5, { decimals: 3 })).toBe('1.234,500')
	})

	it('formats without grouping', () => {
		expect(formatNumber(1234.56, { useGrouping: false })).toBe('1234,56')
	})

	it('formats zero decimals', () => {
		expect(formatNumber(1234, { decimals: 0 })).toBe('1.234')
	})

	it('handles large numbers', () => {
		expect(formatNumber(1234567.89)).toBe('1.234.567,89')
	})
})

describe('roundTo', () => {
	it('rounds to 2 decimal places', () => {
		expect(roundTo(1.235, 2)).toBe(1.24)
	})

	it('rounds to 0 decimal places', () => {
		expect(roundTo(1.5, 0)).toBe(2)
	})

	it('rounds down', () => {
		expect(roundTo(1.234, 2)).toBe(1.23)
	})

	it('handles negative numbers', () => {
		expect(roundTo(-1.6, 0)).toBe(-2)
	})
})

describe('clamp', () => {
	it('clamps value below min', () => {
		expect(clamp(-5, 0, 100)).toBe(0)
	})

	it('clamps value above max', () => {
		expect(clamp(150, 0, 100)).toBe(100)
	})

	it('returns value within range', () => {
		expect(clamp(50, 0, 100)).toBe(50)
	})

	it('handles value equal to min', () => {
		expect(clamp(0, 0, 100)).toBe(0)
	})

	it('handles value equal to max', () => {
		expect(clamp(100, 0, 100)).toBe(100)
	})
})
