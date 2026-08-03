import type { ComponentContract } from '$lib/contexts/page-state'
import { SalesOrderDataSchema } from '$lib/components/features/sales-orders/SalesOrderDetails/default/SalesOrderDetails.contract'

/**
 * Contract for SalesOrderDocumentsTable component.
 * - Provides: salesOrder data (so SalesOrderSidebar renders the header + menu on this subpage)
 * - Consumes: nothing (reads params directly from pageDetails)
 */
export const SalesOrderDocumentsTableContract = {
  $id: 'SalesOrderDocumentsTable',
  provides: {
    salesOrder: SalesOrderDataSchema,
  },
  consumes: {},
} as const satisfies ComponentContract
