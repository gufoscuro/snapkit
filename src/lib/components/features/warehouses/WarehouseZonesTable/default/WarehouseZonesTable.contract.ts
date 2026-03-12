import type { ComponentContract } from '$lib/contexts/page-state'
import { Type } from '@sinclair/typebox'

export const ConsumedFilterStateSchema = Type.Object({
  search: Type.Optional(Type.String()),
  query: Type.Optional(Type.Record(Type.String(), Type.String())),
})

export const WarehouseZonesTableContract = {
  $id: 'WarehouseZonesTable',
  provides: {},
  consumes: {
    filters: ConsumedFilterStateSchema,
  },
} as const satisfies ComponentContract
