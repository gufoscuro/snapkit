import { SupplierInvoiceDataSchema } from '$lib/components/features/supplier-invoices/supplier-invoice-schema'
import type { ComponentContract } from '$lib/contexts/page-state'

/**
 * Contract for SupplierInvoiceSidebar component.
 * - Provides: nothing
 * - Consumes: the received invoice (provided by the detail / subpage content on the same page)
 */
export const SupplierInvoiceSidebarContract = {
  $id: 'SupplierInvoiceSidebar',
  provides: {},
  consumes: {
    supplierInvoice: SupplierInvoiceDataSchema,
  },
} as const satisfies ComponentContract
