import type { ComponentContract } from '$lib/contexts/page-state'
import { ItemDataSchema } from '$lib/components/features/items/ItemDetails/default/ItemDetails.contract'

/**
 * Contract for ItemSidebar component.
 * - Provides: nothing
 * - Consumes: item data (provided by ItemDetails on the same page)
 */
export const ItemSidebarContract = {
  $id: 'ItemSidebar',
  provides: {},
  consumes: {
    item: ItemDataSchema,
  },
} as const satisfies ComponentContract
