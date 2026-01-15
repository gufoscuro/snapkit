/* eslint-disable @typescript-eslint/no-explicit-any */
export const DEFAULT_ITEMS_LIMIT: number = 50

export type QueryObject = {
	[key: string]: string
}

export type AdditionalQueryProps = {
	[key: string]: any
}

export interface MinimalFilterQuery {
	search?: string
	limit?: number
	offset?: number
}

export type FilterQuery = MinimalFilterQuery & {
	query?: QueryObject
}

export type ExtendedFilterQuery = FilterQuery & AdditionalQueryProps

export type ExtendedFilterQueryObject = MinimalFilterQuery & {
	query?: string
} & AdditionalQueryProps

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
	return !!query.search || !!query.limit || !!query.offset || !!query.query
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
	limit = DEFAULT_ITEMS_LIMIT,
	offset,
	query,
	...overrides
}: FilterQuery): ExtendedFilterQueryObject {
	return {
		...(search && search.trim() !== '' ? { search } : {}),
		...(query ? { query: JSON.stringify(query) } : {}),
		...(limit ? { limit } : {}),
		...(offset ? { offset } : {}),
		...(overrides ? overrides : {})
	}
}
