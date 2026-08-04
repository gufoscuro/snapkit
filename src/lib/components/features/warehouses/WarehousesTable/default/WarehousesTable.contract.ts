import type { ComponentContract } from '$lib/contexts/page-state'
import { Type } from '@sinclair/typebox'
import { TableExportSchema } from '$lib/utils/table-export.svelte'

export const ConsumedFilterStateSchema = Type.Object({
  search: Type.Optional(Type.String()),
  query: Type.Optional(Type.Record(Type.String(), Type.String())),
})

export const WarehousesTableContract = {
  $id: 'WarehousesTable',
  provides: {
    exportHandler: TableExportSchema
  },
  consumes: {
    filters: ConsumedFilterStateSchema,
  },
} as const satisfies ComponentContract
