import { describe, expect, it } from 'vitest'
import { getUserMessagingClasses, getLoadValues } from './form'

describe('getUserMessagingClasses', () => {
	it('returns error classes when error is provided', () => {
		const result = getUserMessagingClasses('Required')
		expect(result).toContain('border-destructive')
		expect(result).toContain('ring-destructive')
	})

	it('returns warning classes when warning is provided', () => {
		const result = getUserMessagingClasses(undefined, 'Check this')
		expect(result).toContain('border-warning')
		expect(result).toContain('ring-warning')
	})

	it('returns empty string when neither error nor warning', () => {
		expect(getUserMessagingClasses(undefined)).toBe('')
		expect(getUserMessagingClasses(undefined, undefined)).toBe('')
	})

	it('error takes priority over warning', () => {
		const result = getUserMessagingClasses('Error', 'Warning')
		expect(result).toContain('border-destructive')
		expect(result).not.toContain('border-warning')
	})
})

describe('getLoadValues', () => {
	type Entity = { id: number; name: string; email: string }
	const empty: Entity = { id: 0, name: '', email: '' }

	it('returns target when provided', () => {
		const target: Entity = { id: 1, name: 'John', email: 'john@test.com' }
		expect(getLoadValues({ target, emptyValues: empty })).toEqual(target)
	})

	it('returns clone when no target', () => {
		const clone: Entity = { id: 2, name: 'Clone', email: 'clone@test.com' }
		expect(getLoadValues({ clone, emptyValues: empty })).toEqual(clone)
	})

	it('target takes priority over clone', () => {
		const target: Entity = { id: 1, name: 'Target', email: '' }
		const clone: Entity = { id: 2, name: 'Clone', email: '' }
		expect(getLoadValues({ target, clone, emptyValues: empty })).toEqual(target)
	})

	it('merges inputPayload with emptyValues', () => {
		const result = getLoadValues({
			inputPayload: { name: 'From input' },
			emptyValues: empty,
		})
		expect(result).toEqual({ id: 0, name: 'From input', email: '' })
	})

	it('returns inputPayload as-is when no emptyValues', () => {
		const result = getLoadValues({ inputPayload: { name: 'Partial' } })
		expect(result).toEqual({ name: 'Partial' })
	})

	it('returns emptyValues when no other option is provided', () => {
		expect(getLoadValues({ emptyValues: empty })).toEqual(empty)
	})

	it('returns null when nothing is provided', () => {
		expect(getLoadValues({})).toBeNull()
	})

	it('prefers target over inputPayload and emptyValues', () => {
		const target: Entity = { id: 1, name: 'Target', email: 'target@test.com' }
		expect(
			getLoadValues({
				target,
				inputPayload: { name: 'Input' },
				emptyValues: empty,
			}),
		).toEqual(target)
	})
})
