import { describe, it, expect } from 'vitest'
import { isNumber } from './is-number'

describe('isNumber', () => {
	it('returns true for integer number', () => {
		expect(isNumber(42)).toBe(true)
	})

	it('returns true for float number', () => {
		expect(isNumber(3.14)).toBe(true)
	})

	it('returns true for zero', () => {
		expect(isNumber(0)).toBe(true)
	})

	it('returns true for negative number', () => {
		expect(isNumber(-5)).toBe(true)
	})

	it('returns true for numeric string', () => {
		expect(isNumber('2')).toBe(true)
	})

	it('returns true for float string', () => {
		expect(isNumber('1.11')).toBe(true)
	})

	it('returns true for hex string', () => {
		expect(isNumber('0xff')).toBe(true)
	})

	it('returns false for non-numeric string', () => {
		expect(isNumber('two')).toBe(false)
	})

	it('returns false for empty string', () => {
		expect(isNumber('')).toBe(false)
	})

	it('returns false for whitespace string', () => {
		expect(isNumber('   ')).toBe(false)
	})

	it('returns false for object', () => {
		expect(isNumber({ two: 2 })).toBe(false)
	})

	it('returns false for Infinity', () => {
		expect(isNumber(Number.POSITIVE_INFINITY)).toBe(false)
	})

	it('returns false for NaN', () => {
		expect(isNumber(NaN)).toBe(false)
	})

	it('returns false for null', () => {
		expect(isNumber(null)).toBe(false)
	})

	it('returns false for undefined', () => {
		expect(isNumber(undefined)).toBe(false)
	})
})
