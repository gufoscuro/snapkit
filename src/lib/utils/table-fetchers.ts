import { createQueryRequestObject, type FilterQuery, type PaginatedResponse } from './filters'
import { apiDownload, apiRequest } from './request'

/** Fetches one page of a listing, as consumed by ResourceTable. */
export type TableFetcher<T> = (page?: number, filters?: FilterQuery) => Promise<PaginatedResponse<T>>

/**
 * A table fetcher that can also export the listing it reads.
 *
 * The export capability travels with the fetcher rather than being a separate
 * prop because the fetcher is the only place that knows both the endpoint URL
 * and how filters are serialized — so an export can never drift from what the
 * table is showing.
 */
export type ExportableFetcher<T> = TableFetcher<T> & {
  /** Downloads the whole filtered set as CSV. Ignores pagination. */
  exportCsv: (filters?: FilterQuery) => Promise<void>
}

export function isExportableFetcher<T>(fetcher: TableFetcher<T>): fetcher is ExportableFetcher<T> {
  return typeof (fetcher as Partial<ExportableFetcher<T>>).exportCsv === 'function'
}

/**
 * Creates a generic API fetcher function for ResourceTable
 *
 * Returns a function that fetches data from the specified API endpoint
 * with automatic page-based pagination and filter support.
 *
 * The returned function also carries an `exportCsv` method (unless disabled),
 * which downloads the whole filtered set — not the current page — as a CSV
 * attachment. Columns are chosen by the backend and are not client-selectable.
 *
 * @param url - API endpoint URL (e.g., 'supply/supplier')
 * @param options.perPage - Override the API's default page size. Useful for grouped
 *   tables, where a larger page reduces how often a group arrives partially loaded.
 * @param options.params - Query params baked into every request, for views that are
 *   a fixed slice of an endpoint (e.g. `outstanding: true`). Applied after the
 *   user's filters, so the slice always holds. Included in the export too.
 * @param options.exportable - Set to false for endpoints that don't support `format=csv`.
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
export function createApiFetcher<T>(
  url: string,
  options?: {
    invalidateCache?: boolean
    perPage?: number
    params?: Record<string, string | number | boolean>
    exportable?: boolean
  },
): ExportableFetcher<T> {
  const { perPage, params, exportable = true, ...requestOptions } = options ?? {}

  const fetcher = async (page: number = 1, filters?: FilterQuery): Promise<PaginatedResponse<T>> => {
    return await apiRequest<PaginatedResponse<T>>({
      url,
      queryParams: {
        page,
        ...(perPage ? { per_page: perPage } : {}),
        ...createQueryRequestObject({ search: filters?.search, query: filters?.query }),
        ...(params ?? {}),
      },
      ...requestOptions,
    })
  }

  if (exportable) {
    // Same serialization as the fetch above, minus pagination: what you see is
    // what you export.
    ;(fetcher as ExportableFetcher<T>).exportCsv = (filters?: FilterQuery) =>
      apiDownload({
        url,
        accept: 'text/csv',
        queryParams: {
          format: 'csv',
          ...createQueryRequestObject({ search: filters?.search, query: filters?.query }),
          ...(params ?? {}),
        },
      })
  }

  return fetcher as ExportableFetcher<T>
}
