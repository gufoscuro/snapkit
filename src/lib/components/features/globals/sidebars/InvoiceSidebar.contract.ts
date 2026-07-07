import { InvoiceDataSchema } from '$lib/components/features/invoices/InvoicesDetails/default/InvoicesDetails.contract'
import type { ComponentContract } from '$lib/contexts/page-state'

/**
 * Contract for InvoiceSidebar component.
 * - Provides: nothing
 * - Consumes: invoice data (provided by InvoicesDetails on the same page)
 */
export const InvoiceSidebarContract = {
  $id: 'InvoiceSidebar',
  provides: {},
  consumes: {
    invoice: InvoiceDataSchema,
  },
} as const satisfies ComponentContract
