import { describe, it, expect } from 'vitest'
import { getUserInitials } from './strings'

describe('getUserInitials', () => {
	it('returns two initials for full name', () => {
		expect(getUserInitials('John Doe')).toBe('JD')
	})

	it('returns single initial for single name', () => {
		expect(getUserInitials('John')).toBe('J')
	})

	it('uses first and last for three names', () => {
		expect(getUserInitials('John Michael Doe')).toBe('JD')
	})

	it('handles extra whitespace', () => {
		expect(getUserInitials('  John   Doe  ')).toBe('JD')
	})

	it('uppercases initials', () => {
		expect(getUserInitials('john doe')).toBe('JD')
	})
})
