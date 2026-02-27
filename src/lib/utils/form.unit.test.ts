import { describe, it, expect } from 'vitest'
import { getUserMessagingClasses, getLoadValues } from './form'

describe('getUserMessagingClasses', () => {
	it('returns destructive classes for error', () => {
		const result = getUserMessagingClasses('required')
		expect(result).toContain('border-destructive')
		expect(result).toContain('ring-destructive')
	})

	it('returns warning classes for warning', () => {
		const result = getUserMessagingClasses(undefined, 'low stock')
		expect(result).toContain('border-warning')
		expect(result).toContain('ring-warning')
	})

	it('error takes precedence over warning', () => {
		const result = getUserMessagingClasses('error', 'warning')
		expect(result).toContain('border-destructive')
		expect(result).not.toContain('border-warning')
	})

	it('returns empty string when no error or warning', () => {
		expect(getUserMessagingClasses(undefined)).toBe('')
	})
})

describe('getLoadValues', () => {
	it('returns target when provided', () => {
		expect(getLoadValues({ target: { name: 'a' }, emptyValues: { name: '' } })).toEqual({
			name: 'a',
		})
	})

	it('returns clone when target is null', () => {
		expect(getLoadValues({ target: null, clone: { name: 'b' } })).toEqual({ name: 'b' })
	})

	it('merges inputPayload with emptyValues', () => {
		expect(
			getLoadValues({
				target: null,
				clone: null,
				inputPayload: { name: 'c' },
				emptyValues: { name: '', age: 0 },
			})
		).toEqual({ name: 'c', age: 0 })
	})

	it('returns inputPayload alone when no emptyValues', () => {
		expect(
			getLoadValues({
				target: null,
				clone: null,
				inputPayload: { name: 'c' },
			})
		).toEqual({ name: 'c' })
	})

	it('returns emptyValues as fallback', () => {
		expect(getLoadValues({ emptyValues: { name: '' } })).toEqual({ name: '' })
	})

	it('returns null when nothing provided', () => {
		expect(getLoadValues({})).toBeNull()
	})
})
