import { Type } from '@sinclair/typebox'
import type { ComponentContract } from '$lib/contexts/page-state'

/**
 * Schema for the filter state this component consumes.
 * Note: This is the same shape as DemoFilter provides.
 * Components are decoupled but share compatible schemas.
 */
export const ConsumedFilterStateSchema = Type.Object({
  search: Type.String(),
  status: Type.Array(Type.String())
})

/**
 * Schema for the selection state this component provides.
 */
export const SelectionStateSchema = Type.Object({
  rows: Type.Array(Type.String())
})

/**
 * Contract for DemoTable component.
 * - Provides: selection state (selected row IDs)
 * - Consumes: filter state (to filter displayed data)
 */
export const DemoTableContract = {
  $id: 'DemoTable',
  provides: {
    selection: SelectionStateSchema
  },
  consumes: {
    filters: ConsumedFilterStateSchema
  }
} as const satisfies ComponentContract
