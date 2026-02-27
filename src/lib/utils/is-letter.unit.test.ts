import { describe, it, expect } from 'vitest'
import { isLetter } from './is-letter'

describe('isLetter', () => {
	it('returns true for lowercase letter', () => {
		expect(isLetter('a')).toBe(true)
	})

	it('returns true for uppercase letter', () => {
		expect(isLetter('Z')).toBe(true)
	})

	it('returns false for digit', () => {
		expect(isLetter('1')).toBe(false)
	})

	it('returns false for special character', () => {
		expect(isLetter('!')).toBe(false)
	})

	it('returns false for space', () => {
		expect(isLetter(' ')).toBe(false)
	})

	it('throws for multi-character string', () => {
		expect(() => isLetter('ab')).toThrow()
	})
})
