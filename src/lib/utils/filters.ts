/* eslint-disable @typescript-eslint/no-explicit-any */

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
