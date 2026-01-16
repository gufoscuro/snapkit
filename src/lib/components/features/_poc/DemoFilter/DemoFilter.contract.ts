import { Type } from '@sinclair/typebox'
import type { ComponentContract } from '$lib/contexts/page-state'

/**
 * Schema for the filter state this component provides.
 */
export const DemoFilterStateSchema = Type.Object({
  search: Type.String(),
  status: Type.Array(Type.String())
})

/**
 * Contract for DemoFilter component.
 * - Provides: filter state (search text and status filters)
 * - Consumes: nothing
 */
export const DemoFilterContract = {
  $id: 'DemoFilter',
  provides: {
    filters: DemoFilterStateSchema
  },
  consumes: {}
} as const satisfies ComponentContract
