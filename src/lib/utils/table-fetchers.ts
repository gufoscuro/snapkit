import { createQueryRequestObject, type FilterQuery, type PaginatedResponse } from './filters'
import { apiRequest } from './request'

/**
 * Creates a generic API fetcher function for ResourceTable
 *
 * Returns a function that fetches data from the specified API endpoint
 * with automatic page-based pagination and filter support.
 *
 * @param url - API endpoint URL (e.g., 'supply/supplier')
 * @param options.perPage - Override the API's default page size. Useful for grouped
 *   tables, where a larger page reduces how often a group arrives partially loaded.
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
export function createApiFetcher<T>(url: string, options?: { invalidateCache?: boolean; perPage?: number }) {
  const { perPage, ...requestOptions } = options ?? {}
  return async (page: number = 1, filters?: FilterQuery): Promise<PaginatedResponse<T>> => {
    return await apiRequest<PaginatedResponse<T>>({
      url,
      queryParams: {
        page,
        ...(perPage ? { per_page: perPage } : {}),
        ...createQueryRequestObject({ search: filters?.search, query: filters?.query }),
      },
      ...requestOptions,
    })
  }
}
