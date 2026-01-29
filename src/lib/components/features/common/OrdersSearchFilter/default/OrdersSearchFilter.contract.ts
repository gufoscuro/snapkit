import { Type } from '@sinclair/typebox'
import type { ComponentContract } from '$lib/contexts/page-state'

/**
 * Schema for the filter state this component provides.
 * Matches the ConsumedFilterStateSchema used by SalesOrdersTable and SupplyOrdersTable.
 */
export const FilterStateSchema = Type.Object({
  search: Type.Optional(Type.String()),
  query: Type.Optional(Type.Record(Type.String(), Type.String()))
})

/**
 * Contract for OrdersSearchFilter component.
 * - Provides: filter state (search and query fields)
 * - Consumes: nothing
 */
export const OrdersSearchFilterContract = {
  $id: 'OrdersSearchFilter',
  provides: {
    filters: FilterStateSchema
  },
  consumes: {}
} as const satisfies ComponentContract
