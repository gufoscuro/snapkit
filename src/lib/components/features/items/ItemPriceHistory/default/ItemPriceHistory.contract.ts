import { ItemDataSchema } from '$lib/components/features/items/ItemDetails/default/ItemDetails.contract.js'
import type { ComponentContract } from '$lib/contexts/page-state'
import { Type } from '@sinclair/typebox'

/**
 * Schema for the filter state this component consumes (search + narrowing
 * filters). The source switch and the customer drill-down are *not* here —
 * they live in the component itself, see ItemPriceHistory.svelte.
 */
export const ConsumedFilterStateSchema = Type.Object({
  search: Type.Optional(Type.String()),
  query: Type.Optional(Type.Record(Type.String(), Type.String())),
})

/**
 * Contract for ItemPriceHistory component.
 * - Provides: item data (so ItemSidebar is populated on this subpage)
 * - Consumes: filter state (from ItemPriceHistoryFilters)
 */
export const ItemPriceHistoryContract = {
  $id: 'ItemPriceHistory',
  provides: {
    item: ItemDataSchema,
  },
  consumes: {
    filters: ConsumedFilterStateSchema,
  },
} as const satisfies ComponentContract
