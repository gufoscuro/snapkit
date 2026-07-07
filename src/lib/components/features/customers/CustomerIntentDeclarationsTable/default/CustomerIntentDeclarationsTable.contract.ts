import { Type } from '@sinclair/typebox'
import type { ComponentContract } from '$lib/contexts/page-state'
import { CustomerDataSchema } from '$lib/components/features/customers/CustomerDetails/default/CustomerDetails.contract.js'

export const ConsumedFilterStateSchema = Type.Object({
  search: Type.Optional(Type.String()),
  query: Type.Optional(Type.Record(Type.String(), Type.String())),
})

export const CustomerIntentDeclarationsTableContract = {
  $id: 'CustomerIntentDeclarationsTable',
  provides: {
    customer: CustomerDataSchema,
  },
  consumes: {
    filters: ConsumedFilterStateSchema,
  },
} as const satisfies ComponentContract
