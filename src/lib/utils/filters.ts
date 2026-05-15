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

export type ExtendedFilterQueryObject = MinimalFilterQuery & AdditionalQueryProps

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

export type CustomerFilterConfig = BaseFilterConfig & {
	type: 'customer'
	fetchFunction: (search: string) => Promise<FilterOption[]>
}

export type AmountFilterValue = { from?: number; to?: number }

/**
 * Numeric range filter expanded into two flat query params (e.g. `total_from`,
 * `total_to`). The config key is just the internal identifier of the filter; the
 * bounds are emitted under `fromKey` and `toKey`.
 */
export type AmountFilterConfig = BaseFilterConfig & {
	type: 'amount'
	/** Query param sent for the lower bound (e.g. 'total_from'). */
	fromKey: string
	/** Query param sent for the upper bound (e.g. 'total_to'). */
	toKey: string
	/** Optional unit suffix shown next to each input (e.g. '€', 'kg'). */
	unit?: string
}

export type FilterConfigEntry =
	| EnumFilterConfig
	| TagsFilterConfig
	| DateFilterConfig
	| CustomerFilterConfig
	| AmountFilterConfig
export type FilterConfig = Record<string, FilterConfigEntry>

// ---------------------------------------------------------------------------
// Filter internal state
// ---------------------------------------------------------------------------

export type FilterInternalState = Record<
	string,
	string | string[] | DateValue | AmountFilterValue | undefined
>

// ---------------------------------------------------------------------------
// Serialization / deserialization
// ---------------------------------------------------------------------------

function isDateValue(v: unknown): v is DateValue {
	return v != null && typeof v === 'object' && 'calendar' in v && 'year' in v
}

function isAmountValue(v: unknown): v is AmountFilterValue {
	return v != null && typeof v === 'object' && !isDateValue(v) && ('from' in v || 'to' in v)
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
			case 'enum':
			case 'customer': {
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
			case 'amount': {
				if (isAmountValue(value)) {
					if (value.from !== undefined) result[entry.fromKey] = String(value.from)
					if (value.to !== undefined) result[entry.toKey] = String(value.to)
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
		if (entry.type === 'amount') {
			const value: AmountFilterValue = {}
			const fromRaw = query[entry.fromKey]
			const toRaw = query[entry.toKey]
			if (fromRaw != null && fromRaw !== '') {
				const n = Number(fromRaw)
				if (!Number.isNaN(n)) value.from = n
			}
			if (toRaw != null && toRaw !== '') {
				const n = Number(toRaw)
				if (!Number.isNaN(n)) value.to = n
			}
			if (value.from !== undefined || value.to !== undefined) state[key] = value
			continue
		}

		const raw = query[key]
		if (raw == null || raw === '') continue

		switch (entry.type) {
			case 'enum':
			case 'customer': {
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
	if (isAmountValue(value)) return value.from !== undefined || value.to !== undefined
	return isDateValue(value)
}

export function countActiveFilters(config: FilterConfig, state: FilterInternalState): number {
	return Object.keys(config).filter((key) => isFilterActive(state, key)).length
}

/**
 * Returns the full set of URL query-param keys a filter config writes to.
 *
 * Most filter types use the config key itself as the URL param name; `amount`
 * filters expand into two keys (`fromKey` + `toKey`). Used by URL-persistence
 * logic to know which params it "owns" — so it can clear them on rewrite
 * without trampling unrelated params (`page`, etc.).
 */
export function getFilterUrlKeys(config: FilterConfig): string[] {
	const keys = new Set<string>()
	for (const [key, entry] of Object.entries(config)) {
		if (entry.type === 'amount') {
			keys.add(entry.fromKey)
			keys.add(entry.toKey)
		} else {
			keys.add(key)
		}
	}
	return Array.from(keys)
}

/**
 * Reads filter state from URL search params, given a FilterConfig.
 *
 * `search` is read from the `search` param; all other keys owned by the config
 * (per `getFilterUrlKeys`) are collected into `query`. Reserved keys like
 * `page` are ignored.
 */
export function readFiltersFromUrl(
	url: URL,
	config: FilterConfig,
): { search: string | undefined; query: QueryObject | undefined } {
	const params = url.searchParams
	const search = params.get('search') || undefined
	const query: QueryObject = {}
	for (const key of getFilterUrlKeys(config)) {
		const v = params.get(key)
		if (v != null && v !== '') query[key] = v
	}
	return { search, query: Object.keys(query).length > 0 ? query : undefined }
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
 * Builds a flat query-string object from a FilterQuery.
 *
 * The structured `query` map (produced by FilterDropdown) is spread into the
 * top-level params — each filter key becomes its own `?key=value` pair, matching
 * the Moddo backend convention (see the "Combining filters" section of the
 * `import-flows` business doc). Multi-value filters (e.g. `tags`) are already
 * serialized as comma-separated strings by `serializeFilters`, which the backend
 * OR-combines server-side.
 *
 * Explicit overrides (extra props on the input besides `search`/`query`) take
 * precedence over keys coming from `query` if they collide.
 */
export function createQueryRequestObject({
	search,
	query,
	...overrides
}: FilterQuery): ExtendedFilterQueryObject {
	return {
		...(search && search.trim() !== '' ? { search } : {}),
		...(query ?? {}),
		...(overrides ?? {})
	}
}
