import { hasBinding, useProvides, type ComponentContract } from '$lib/contexts/page-state'
import { Type, type TSchema } from '@sinclair/typebox'
import type { FilterQuery } from './filters'
import { isExportableFetcher, type TableFetcher } from './table-fetchers'

/**
 * Downloads the listing a table is showing, for the filters passed in.
 *
 * Filters are an argument rather than baked into the handler because the
 * filters component owns them: it hands over the live values at click time, so
 * the export can never lag behind a debounced state commit.
 */
export type TableExportHandler = (filters?: FilterQuery) => Promise<void>

/**
 * Schema for the export channel. The payload is a function, which TypeBox
 * can't describe structurally — `Type.Unsafe` keeps the TypeScript side honest
 * while the runtime schema stays permissive.
 */
export const TableExportSchema = Type.Unsafe<TableExportHandler>(Type.Any())

/** A contract that publishes the export channel. */
type ExportingContract = ComponentContract<{ exportHandler: typeof TableExportSchema }, Record<string, TSchema>>

/**
 * Publishes a table's CSV export into page state, so a sibling filters
 * component can offer it without either component knowing about the other.
 *
 * The handler comes from the fetcher — the only place that knows both the
 * endpoint and how filters are serialized. Fetchers that don't support export
 * (custom ones, or `createApiFetcher(url, { exportable: false })`) publish
 * nothing and the button simply never appears.
 *
 * @param contract - The calling component's contract, declaring `exportHandler` in `provides`
 * @param getFetcher - Getter for the current fetcher; re-read reactively, since
 *   most tables derive theirs from a legal entity that arrives asynchronously.
 *
 * @example
 * const fetchCustomers = $derived(url ? createApiFetcher<Customer>(url) : null)
 * useTableExport(CustomersTableContract, () => fetchCustomers)
 */
export function useTableExport<T>(
  contract: ExportingContract,
  getFetcher: () => TableFetcher<T> | null | undefined,
): void {
  // Pages that didn't wire the channel (or don't want the feature) leave the
  // binding unset — bail out rather than throwing.
  if (!hasBinding('provides', 'exportHandler')) return

  const handle = useProvides(contract, 'exportHandler')

  $effect(() => {
    const fetcher = getFetcher()
    const handler = fetcher && isExportableFetcher(fetcher) ? fetcher.exportCsv : undefined

    if (handler) handle.set(handler)
    else handle.unset()

    // Leaving the page must retract the handler: page state is owned by the
    // layout and outlives this component, so a stale handler would export the
    // listing the user just left. Retract only our own value — on navigation
    // the next table may already have published its handler by the time this
    // cleanup runs.
    return () => {
      if (handle.get() === handler) handle.unset()
    }
  })
}
