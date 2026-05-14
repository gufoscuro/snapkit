import { describe, it, expect } from 'vitest'
import { getQueryFromURL, isQueryActive, isSearchActive, createQueryRequestObject } from './filters'

describe('getQueryFromURL', () => {
	it('extracts search param', () => {
		const url = new URL('https://example.com?search=hello')
		const result = getQueryFromURL(url)
		expect(result.search).toBe('hello')
		expect(result.query).toBeUndefined()
	})

	it('extracts query param (JSON)', () => {
		const url = new URL('https://example.com?query={"status":"active"}')
		const result = getQueryFromURL(url)
		expect(result.query).toEqual({ status: 'active' })
	})

	it('returns undefined for missing params', () => {
		const url = new URL('https://example.com')
		const result = getQueryFromURL(url)
		expect(result.search).toBeUndefined()
		expect(result.query).toBeUndefined()
	})

	it('merges overrides', () => {
		const url = new URL('https://example.com?search=hello')
		const result = getQueryFromURL(url, { page: 2 })
		expect(result.search).toBe('hello')
		expect((result as Record<string, unknown>).page).toBe(2)
	})
})

describe('isQueryActive', () => {
	it('returns true when search is set', () => {
		expect(isQueryActive({ search: 'foo' })).toBe(true)
	})

	it('returns true when query is set', () => {
		expect(isQueryActive({ query: { status: 'active' } })).toBe(true)
	})

	it('returns false when both are empty', () => {
		expect(isQueryActive({})).toBe(false)
	})

	it('returns false for empty search string', () => {
		expect(isQueryActive({ search: '' })).toBe(false)
	})
})

describe('isSearchActive', () => {
	it('returns true when search is set', () => {
		expect(isSearchActive({ search: 'foo' })).toBe(true)
	})

	it('returns false when search is empty', () => {
		expect(isSearchActive({ search: '' })).toBe(false)
	})

	it('returns false when search is undefined', () => {
		expect(isSearchActive({})).toBe(false)
	})
})

describe('createQueryRequestObject', () => {
	it('includes search when non-empty', () => {
		const result = createQueryRequestObject({ search: 'hello' })
		expect(result.search).toBe('hello')
	})

	it('excludes search when empty', () => {
		const result = createQueryRequestObject({ search: '' })
		expect(result.search).toBeUndefined()
	})

	it('excludes search when whitespace only', () => {
		const result = createQueryRequestObject({ search: '   ' })
		expect(result.search).toBeUndefined()
	})

	it('spreads query keys as flat params', () => {
		const result = createQueryRequestObject({
			query: { status: 'active', customer_id: 'abc' },
		}) as Record<string, unknown>
		expect(result.status).toBe('active')
		expect(result.customer_id).toBe('abc')
		expect(result.query).toBeUndefined()
	})

	it('excludes query keys when query is undefined', () => {
		const result = createQueryRequestObject({}) as Record<string, unknown>
		expect(Object.keys(result)).toHaveLength(0)
	})

	it('passes through additional properties', () => {
		const result = createQueryRequestObject({ search: 'foo', page: 2, per_page: 10 } as never)
		expect((result as Record<string, unknown>).page).toBe(2)
		expect((result as Record<string, unknown>).per_page).toBe(10)
	})

	it('overrides win over query keys on collision', () => {
		const result = createQueryRequestObject({
			query: { customer_id: 'from-query' },
			customer_id: 'override',
		} as never) as Record<string, unknown>
		expect(result.customer_id).toBe('override')
	})
})
