import { Type } from '@sinclair/typebox'
import type { ComponentContract } from '$lib/contexts/page-state'

/**
 * Schema for the filter state this component consumes.
 */
export const ConsumedFilterStateSchema = Type.Object({
  search: Type.Optional(Type.String()),
  query: Type.Optional(Type.Record(Type.String(), Type.String()))
})

/**
 * Contract for SalesOrdersTable component.
 * - Provides: nothing
 * - Consumes: filter state (to filter displayed data)
 */
export const SalesOrdersTableContract = {
  $id: 'SalesOrdersTable',
  provides: {},
  consumes: {
    filters: ConsumedFilterStateSchema
  }
} as const satisfies ComponentContract
