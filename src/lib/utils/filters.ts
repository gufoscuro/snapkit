/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	type DateValue,
	CalendarDate,
	getLocalTimeZone,
} from '@internationalized/date'

export type QueryObject = {
	[key: string]: string
}

export type AdditionalQueryProps = {
	[key: string]: any
}

export interface MinimalFilterQuery {
	search?: string
}

export type FilterQuery = MinimalFilterQuery & {
	query?: QueryObject
}

export type ExtendedFilterQuery = FilterQuery & AdditionalQueryProps

export type ExtendedFilterQueryObject = MinimalFilterQuery & {
	query?: string
} & AdditionalQueryProps

// ---------------------------------------------------------------------------
// Filter configuration types
// ---------------------------------------------------------------------------

export type FilterOption = { label: string; value: string }

type BaseFilterConfig = {
	label: string
	standalone?: boolean
}

export type EnumFilterConfig = BaseFilterConfig & {
	type: 'enum'
	options?: FilterOption[]
	fetchFunction?: () => Promise<FilterOption[]>
}

export type TagsFilterConfig = BaseFilterConfig & {
	type: 'tags'
	options?: FilterOption[]
	fetchFunction?: () => Promise<FilterOption[]>
}

export type DateFilterConfig = BaseFilterConfig & {
	type: 'date'
	allowPast?: boolean
	allowFuture?: boolean
	dayBoundary?: 'startOf' | 'endOf'
}

export type FilterConfigEntry = EnumFilterConfig | TagsFilterConfig | DateFilterConfig
export type FilterConfig = Record<string, FilterConfigEntry>

// ---------------------------------------------------------------------------
// Filter internal state
// ---------------------------------------------------------------------------

export type FilterInternalState = Record<string, string | string[] | DateValue | undefined>

// ---------------------------------------------------------------------------
// Serialization / deserialization
// ---------------------------------------------------------------------------

function isDateValue(v: unknown): v is DateValue {
	return v != null && typeof v === 'object' && 'calendar' in v && 'year' in v
}

export function serializeFilters(
	config: FilterConfig,
	state: FilterInternalState,
): QueryObject {
	const result: QueryObject = {}

	for (const [key, entry] of Object.entries(config)) {
		const value = state[key]
		if (value == null) continue

		switch (entry.type) {
			case 'enum': {
				if (typeof value === 'string' && value !== '') {
					result[key] = value
				}
				break
			}
			case 'tags': {
				if (Array.isArray(value) && value.length > 0) {
					result[key] = value.join(',')
				}
				break
			}
			case 'date': {
				if (isDateValue(value)) {
					const boundary = entry.dayBoundary ?? 'startOf'
					const native = value.toDate(getLocalTimeZone())
					if (boundary === 'endOf') {
						native.setHours(23, 59, 59, 999)
					} else {
						native.setHours(0, 0, 0, 0)
					}
					result[key] = native.toISOString()
				}
				break
			}
		}
	}

	return result
}

export function deserializeFilters(
	config: FilterConfig,
	query: QueryObject,
): FilterInternalState {
	const state: FilterInternalState = {}

	for (const [key, entry] of Object.entries(config)) {
		const raw = query[key]
		if (raw == null || raw === '') continue

		switch (entry.type) {
			case 'enum': {
				state[key] = raw
				break
			}
			case 'tags': {
				state[key] = raw.split(',')
				break
			}
			case 'date': {
				try {
					const date = new Date(raw)
					state[key] = new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
				} catch {
					// skip invalid dates
				}
				break
			}
		}
	}

	return state
}

export function isFilterActive(state: FilterInternalState, key: string): boolean {
	const value = state[key]
	if (value == null) return false
	if (typeof value === 'string') return value !== ''
	if (Array.isArray(value)) return value.length > 0
	return isDateValue(value)
}

export function countActiveFilters(config: FilterConfig, state: FilterInternalState): number {
	return Object.keys(config).filter((key) => isFilterActive(state, key)).length
}

export type PaginationLinks = {
	first: string
	last: string
	prev: string | null
	next: string | null
}

export type PaginationMeta = {
	current_page: number
	from: number
	last_page: number
	per_page: number
	to: number
	total: number
	path: string
	links: { url: string; label: string; active: boolean }[]
}

export type PaginatedResponse<T> = {
	data: T[]
	links: PaginationLinks
	meta: PaginationMeta
}

/**
 * Parses a query string into an object
 * @param query {string} - Query string to parse
 * @returns {QueryObject} - Parsed query object
 */
function parseQuery(query: string): QueryObject {
	try {
		return JSON.parse(query)
	} catch {
		console.error('Invalid query:', query)
		return {}
	}
}

/**
 * Extracts query from URL object
 * @param url {URL} - URL object to extract query from
 * @returns {FilterQuery} - Query object
 */
export function getQueryFromURL<T = AdditionalQueryProps>(
	url: URL,
	overrides: T = {} as T
): ExtendedFilterQuery {
	const searchString = url.searchParams.get('search')
	const search = searchString ? searchString : undefined
	const queryString = url.searchParams.get('query')
	const query = queryString ? parseQuery(queryString) : undefined

	return { search, query, ...overrides }
}

/**
 * Checks if query is active
 * @param query {FilterQuery} - Query object
 * @returns {boolean} - Whether the query is active
 */
export function isQueryActive(query: FilterQuery): boolean {
	return !!query.search || !!query.query
}

/**
 *
 * @param query {FilterQuery} - Query object
 * @returns {boolean} - Whether the search is active
 */
export function isSearchActive(query: FilterQuery): boolean {
	return !!query.search
}

/**
 * Creates request object from query
 * @param query {FilterQuery} - Query object
 * @returns object {ExtendedFilterQueryObject} - A FilterQueryObject with optional properties if any are passed
 */
export function createQueryRequestObject({
	search,
	query,
	...overrides
}: FilterQuery): ExtendedFilterQueryObject {
	return {
		...(search && search.trim() !== '' ? { search } : {}),
		...(query ? { query: JSON.stringify(query) } : {}),
		...(overrides ? overrides : {})
	}
}
