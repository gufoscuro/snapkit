import { describe, it, expect } from 'vitest'
import { unwrapEntity, unwrapEntities, entityHasError } from './generics'
import type { EntityWithError } from './generics'

describe('unwrapEntity', () => {
	it('removes _error and _focus from entity', () => {
		const entity: EntityWithError<{ name: string }> = {
			name: 'test',
			_error: ['name'],
			_focus: true,
		}
		expect(unwrapEntity(entity)).toEqual({ name: 'test' })
	})

	it('works when _error and _focus are absent', () => {
		const entity: EntityWithError<{ id: number }> = { id: 1 }
		expect(unwrapEntity(entity)).toEqual({ id: 1 })
	})
})

describe('unwrapEntities', () => {
	it('unwraps an array of entities', () => {
		const entities: EntityWithError<{ id: number }>[] = [
			{ id: 1, _error: ['id'] },
			{ id: 2, _focus: true },
			{ id: 3 },
		]
		expect(unwrapEntities(entities)).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }])
	})

	it('handles empty array', () => {
		expect(unwrapEntities([])).toEqual([])
	})
})

describe('entityHasError', () => {
	it('returns true when field is in _error', () => {
		const entity: EntityWithError<{ name: string }> = {
			name: 'test',
			_error: ['name'],
		}
		expect(entityHasError(entity, 'name')).toBe(true)
	})

	it('returns false when field is not in _error', () => {
		const entity: EntityWithError<{ name: string }> = {
			name: 'test',
			_error: ['other'],
		}
		expect(entityHasError(entity, 'name')).toBe(false)
	})

	it('returns false when _error is undefined', () => {
		const entity: EntityWithError<{ name: string }> = { name: 'test' }
		expect(entityHasError(entity, 'name')).toBe(false)
	})
})
