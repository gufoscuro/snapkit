import { apiRequest } from './request'
import { createQueryRequestObject, DEFAULT_ITEMS_LIMIT, type FilterQuery } from './filters'

/**
 * Creates a generic API fetcher function for ResourceTable
 *
 * Returns a function that fetches data from the specified API endpoint
 * with automatic pagination and filter support.
 *
 * @param url - API endpoint URL (e.g., 'supply/supplier')
 * @returns Fetch function compatible with ResourceTable
 *
 * @example
 * const fetchSuppliers = createApiFetcher<SupplierSummary>('supply/supplier')
 *
 * <ResourceTable
 *   fetchFunction={fetchSuppliers}
 *   columns={columns}
 * />
 */
export function createApiFetcher<T>(url: string) {
	return async (offset: number = 0, filters?: FilterQuery): Promise<T[]> => {
		const response = await apiRequest<T[]>({
			url,
			queryParams: createQueryRequestObject({
				limit: DEFAULT_ITEMS_LIMIT,
				offset,
				search: filters?.search,
				query: filters?.query
			})
		})
		return response ?? []
	}
}
