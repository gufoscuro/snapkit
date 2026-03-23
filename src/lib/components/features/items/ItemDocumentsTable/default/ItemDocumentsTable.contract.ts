import type { ComponentContract } from '$lib/contexts/page-state'
import { ItemDataSchema } from '$lib/components/features/items/ItemDetails/default/ItemDetails.contract.js'

/**
 * Contract for ItemDocumentsTable component.
 * - Provides: item data (so ItemSidebar is populated on this page)
 * - Consumes: nothing (reads params directly from pageDetails)
 */
export const ItemDocumentsTableContract = {
  $id: 'ItemDocumentsTable',
  provides: {
    item: ItemDataSchema,
  },
  consumes: {},
} as const satisfies ComponentContract
