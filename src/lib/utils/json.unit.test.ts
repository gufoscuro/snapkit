import { describe, it, expect } from 'vitest'
import { parseJSON, stringifyJSON } from './json'

describe('parseJSON', () => {
	it('parses valid JSON', () => {
		expect(parseJSON('{"a":1}')).toEqual({ a: 1 })
	})

	it('parses array JSON', () => {
		expect(parseJSON('[1,2,3]')).toEqual([1, 2, 3])
	})

	it('returns null for invalid JSON', () => {
		expect(parseJSON('{invalid}')).toBeNull()
	})

	it('returns null for null input', () => {
		expect(parseJSON(null)).toBeNull()
	})

	it('returns null for empty string', () => {
		expect(parseJSON('')).toBeNull()
	})

	it('respects generic type', () => {
		const result = parseJSON<{ name: string }>('{"name":"test"}')
		expect(result?.name).toBe('test')
	})
})

describe('stringifyJSON', () => {
	it('stringifies an object', () => {
		expect(stringifyJSON({ a: 1 })).toBe('{"a":1}')
	})

	it('stringifies an array', () => {
		expect(stringifyJSON([1, 2])).toBe('[1,2]')
	})

	it('returns null for null input', () => {
		expect(stringifyJSON(null)).toBeNull()
	})

	it('returns null for undefined input', () => {
		expect(stringifyJSON(undefined)).toBeNull()
	})

	it('returns null for empty string', () => {
		expect(stringifyJSON('')).toBeNull()
	})

	it('handles circular reference gracefully', () => {
		const obj: Record<string, unknown> = {}
		obj.self = obj
		expect(stringifyJSON(obj)).toBeNull()
	})
})
