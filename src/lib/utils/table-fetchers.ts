import { apiRequest } from './request'
import { createQueryRequestObject, type FilterQuery, type PaginatedResponse } from './filters'

/**
 * Creates a generic API fetcher function for ResourceTable
 *
 * Returns a function that fetches data from the specified API endpoint
 * with automatic page-based pagination and filter support.
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
	return async (page: number = 1, filters?: FilterQuery): Promise<PaginatedResponse<T>> => {
		return await apiRequest<PaginatedResponse<T>>({
			url,
			queryParams: {
				page,
				...createQueryRequestObject({ search: filters?.search, query: filters?.query })
			}
		})
	}
}
