import { describe, it, expect } from 'vitest'
import {
	createQueryRequestObject,
	deserializeFilters,
	type FilterConfig,
	getFilterUrlKeys,
	getQueryFromURL,
	isFilterActive,
	isQueryActive,
	isSearchActive,
	readFiltersFromUrl,
	serializeFilters,
} from './filters'

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

describe('getFilterUrlKeys', () => {
	it('returns the config key for simple filter types', () => {
		const config: FilterConfig = {
			customer_id: { type: 'customer', label: 'Customer', fetchFunction: async () => [] },
			type: { type: 'tags', label: 'Type', options: [] },
			date_from: { type: 'date', label: 'From' },
		}
		expect(getFilterUrlKeys(config).sort()).toEqual(['customer_id', 'date_from', 'type'])
	})

	it('expands amount filter into fromKey + toKey (not the config key)', () => {
		const config: FilterConfig = {
			amount: { type: 'amount', label: 'Amount', fromKey: 'total_from', toKey: 'total_to' },
		}
		expect(getFilterUrlKeys(config).sort()).toEqual(['total_from', 'total_to'])
	})
})

describe('readFiltersFromUrl', () => {
	const config: FilterConfig = {
		customer_id: { type: 'customer', label: 'Customer', fetchFunction: async () => [] },
		amount: { type: 'amount', label: 'Amount', fromKey: 'total_from', toKey: 'total_to' },
	}

	it('reads search and known filter keys', () => {
		const url = new URL('https://example.com?search=hello&customer_id=abc&total_from=10')
		const result = readFiltersFromUrl(url, config)
		expect(result.search).toBe('hello')
		expect(result.query).toEqual({ customer_id: 'abc', total_from: '10' })
	})

	it('ignores unrelated params (e.g. page)', () => {
		const url = new URL('https://example.com?search=x&page=2&customer_id=abc')
		const result = readFiltersFromUrl(url, config)
		expect(result.query).toEqual({ customer_id: 'abc' })
	})

	it('returns undefined query when no filter keys are present', () => {
		const url = new URL('https://example.com?page=2')
		const result = readFiltersFromUrl(url, config)
		expect(result.search).toBeUndefined()
		expect(result.query).toBeUndefined()
	})

	it('roundtrips through deserialize → serialize', () => {
		const url = new URL('https://example.com?customer_id=abc&total_from=10&total_to=100')
		const { query } = readFiltersFromUrl(url, config)
		const state = deserializeFilters(config, query ?? {})
		expect(serializeFilters(config, state)).toEqual({
			customer_id: 'abc',
			total_from: '10',
			total_to: '100',
		})
	})
})

describe('amount filter', () => {
	const config: FilterConfig = {
		amount: {
			type: 'amount',
			label: 'Amount',
			fromKey: 'total_from',
			toKey: 'total_to',
		},
	}

	describe('serializeFilters', () => {
		it('emits fromKey + toKey as flat strings', () => {
			const result = serializeFilters(config, { amount: { from: 10, to: 100 } })
			expect(result).toEqual({ total_from: '10', total_to: '100' })
		})

		it('omits missing bounds', () => {
			expect(serializeFilters(config, { amount: { from: 10 } })).toEqual({ total_from: '10' })
			expect(serializeFilters(config, { amount: { to: 100 } })).toEqual({ total_to: '100' })
		})

		it('preserves negative and decimal values', () => {
			const result = serializeFilters(config, { amount: { from: -1.5, to: 0 } })
			expect(result).toEqual({ total_from: '-1.5', total_to: '0' })
		})

		it('emits nothing when bounds are undefined', () => {
			expect(serializeFilters(config, { amount: {} })).toEqual({})
		})
	})

	describe('deserializeFilters', () => {
		it('rebuilds AmountFilterValue from fromKey + toKey', () => {
			const state = deserializeFilters(config, { total_from: '10', total_to: '100' })
			expect(state.amount).toEqual({ from: 10, to: 100 })
		})

		it('handles only-from / only-to', () => {
			expect(deserializeFilters(config, { total_from: '10' }).amount).toEqual({ from: 10 })
			expect(deserializeFilters(config, { total_to: '100' }).amount).toEqual({ to: 100 })
		})

		it('skips non-numeric raw values', () => {
			const state = deserializeFilters(config, { total_from: 'abc', total_to: '50' })
			expect(state.amount).toEqual({ to: 50 })
		})

		it('omits the filter entirely when both bounds are missing', () => {
			expect(deserializeFilters(config, {}).amount).toBeUndefined()
		})
	})

	describe('isFilterActive', () => {
		it('is true when at least one bound is set', () => {
			expect(isFilterActive({ amount: { from: 10 } }, 'amount')).toBe(true)
			expect(isFilterActive({ amount: { to: 100 } }, 'amount')).toBe(true)
			expect(isFilterActive({ amount: { from: 10, to: 100 } }, 'amount')).toBe(true)
		})

		it('is false when value is empty / undefined', () => {
			expect(isFilterActive({ amount: {} }, 'amount')).toBe(false)
			expect(isFilterActive({}, 'amount')).toBe(false)
		})
	})
})
