import type { ComponentContract } from '$lib/contexts/page-state'
import { SalesOrderDataSchema } from '$lib/components/features/sales-orders/SalesOrderDetails/default/SalesOrderDetails.contract'

/**
 * Contract for SalesOrderDeliveryScheduleTable component.
 * - Provides: salesOrder data (so SalesOrderSidebar renders the header + menu on this subpage)
 * - Consumes: nothing (single-order recap, no sibling filters)
 */
export const SalesOrderDeliveryScheduleTableContract = {
  $id: 'SalesOrderDeliveryScheduleTable',
  provides: {
    salesOrder: SalesOrderDataSchema,
  },
  consumes: {},
} as const satisfies ComponentContract
