import type { ComponentContract } from '$lib/contexts/page-state'
import { InvoiceDataSchema } from '$lib/components/features/invoices/InvoicesDetails/default/InvoicesDetails.contract'

/**
 * Contract for InvoicePayments component.
 * - Provides: invoice data (so InvoiceSidebar renders the header + menu on this subpage)
 * - Consumes: nothing (single-invoice payments recap, no sibling filters)
 */
export const InvoicePaymentsContract = {
  $id: 'InvoicePayments',
  provides: {
    invoice: InvoiceDataSchema,
  },
  consumes: {},
} as const satisfies ComponentContract
