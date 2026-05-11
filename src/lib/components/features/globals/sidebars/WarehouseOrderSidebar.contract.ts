import type { ComponentContract } from '$lib/contexts/page-state'
import { WarehouseOrderDataSchema } from '$lib/components/features/warehouse-orders/WarehouseOrderDetails/default/WarehouseOrderDetails.contract'

/**
 * Contract for WarehouseOrderSidebar component.
 * - Provides: nothing
 * - Consumes: warehouseOrder data (provided by WarehouseOrderDetails on the same page)
 */
export const WarehouseOrderSidebarContract = {
  $id: 'WarehouseOrderSidebar',
  provides: {},
  consumes: {
    warehouseOrder: WarehouseOrderDataSchema,
  },
} as const satisfies ComponentContract
