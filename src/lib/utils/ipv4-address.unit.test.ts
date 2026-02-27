import { describe, it, expect } from 'vitest'
import { parse, validate, formatToString } from './ipv4-address'

describe('parse', () => {
	it('parses valid dotted address', () => {
		expect(parse('192.168.100.10').unwrap()).toEqual([192, 168, 100, 10])
	})

	it('parses space-separated address', () => {
		expect(parse('192 168 100 10').unwrap()).toEqual([192, 168, 100, 10])
	})

	it('parses underscore-separated address', () => {
		expect(parse('192_168_100_10').unwrap()).toEqual([192, 168, 100, 10])
	})

	it('trims whitespace', () => {
		expect(parse('  192.168.1.1  ').unwrap()).toEqual([192, 168, 1, 1])
	})

	it('returns Err for too few octets', () => {
		expect(parse('192.168.1').isErr()).toBe(true)
	})

	it('returns Err for too many octets', () => {
		expect(parse('192.168.1.1.1').isErr()).toBe(true)
	})

	it('returns Err for non-numeric octet', () => {
		const result = parse('192.abc.1.1')
		expect(result.isErr()).toBe(true)
		expect(result.unwrapErr().message).toContain('not a number')
	})

	it('returns Err for out-of-range octet', () => {
		const result = parse('192.168.256.1')
		expect(result.isErr()).toBe(true)
		expect(result.unwrapErr().message).toContain('out of range')
	})

	it('parses 0.0.0.0', () => {
		expect(parse('0.0.0.0').unwrap()).toEqual([0, 0, 0, 0])
	})

	it('parses 255.255.255.255', () => {
		expect(parse('255.255.255.255').unwrap()).toEqual([255, 255, 255, 255])
	})
})

describe('validate', () => {
	it('returns true for valid string address', () => {
		expect(validate('192.168.100.10')).toBe(true)
	})

	it('returns true for valid octets array', () => {
		expect(validate([192, 168, 100, 10])).toBe(true)
	})

	it('returns false for invalid string', () => {
		expect(validate('192.168.100.256')).toBe(false)
	})

	it('returns false for out-of-range octets array', () => {
		expect(validate([192, 168, 100, 256])).toBe(false)
	})

	it('returns false for negative octet in array', () => {
		expect(validate([192, -1, 100, 10])).toBe(false)
	})
})

describe('formatToString', () => {
	it('formats octets array with default separator', () => {
		expect(formatToString([192, 168, 1, 1]).unwrap()).toBe('192.168.1.1')
	})

	it('formats with underscore separator', () => {
		expect(formatToString([192, 168, 1, 1], '_').unwrap()).toBe('192_168_1_1')
	})

	it('formats with space separator', () => {
		expect(formatToString([192, 168, 1, 1], ' ').unwrap()).toBe('192 168 1 1')
	})

	it('formats from valid string address', () => {
		expect(formatToString('10.0.0.1').unwrap()).toBe('10.0.0.1')
	})

	it('returns Err for invalid string address', () => {
		expect(formatToString('invalid').isErr()).toBe(true)
	})
})
