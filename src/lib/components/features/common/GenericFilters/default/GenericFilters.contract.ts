import type { ComponentContract } from '$lib/contexts/page-state'
import { TableExportSchema } from '$lib/utils/table-export.svelte'
import { Type } from '@sinclair/typebox'

/**
 * Schema for the filter state this component provides.
 * Matches the ConsumedFilterStateSchema used by SalesOrdersTable and SupplyOrdersTable.
 */
export const FilterStateSchema = Type.Object({
  search: Type.Optional(Type.String()),
  query: Type.Optional(Type.Record(Type.String(), Type.String())),
})

/**
 * Contract for OrdersSearchFilter component.
 * - Provides: filter state (search and query fields)
 * - Consumes: the sibling table's CSV export handler (optional — the export
 *   button only appears on pages whose table publishes one)
 */
export const GenericFiltersContract = {
  $id: 'GenericFilters',
  provides: {
    filters: FilterStateSchema,
  },
  consumes: {
    exportHandler: TableExportSchema,
  },
} as const satisfies ComponentContract
