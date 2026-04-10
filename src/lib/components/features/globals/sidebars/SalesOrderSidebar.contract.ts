import type { ComponentContract } from '$lib/contexts/page-state'
import { SalesOrderDataSchema } from '$lib/components/features/sales-orders/SalesOrderDetails/default/SalesOrderDetails.contract'

/**
 * Contract for SalesOrderSidebar component.
 * - Provides: nothing
 * - Consumes: salesOrder data (provided by SalesOrderDetails on the same page)
 */
export const SalesOrderSidebarContract = {
  $id: 'SalesOrderSidebar',
  provides: {},
  consumes: {
    salesOrder: SalesOrderDataSchema,
  },
} as const satisfies ComponentContract
