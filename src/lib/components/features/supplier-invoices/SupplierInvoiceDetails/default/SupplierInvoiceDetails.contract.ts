import type { ComponentContract } from '$lib/contexts/page-state'
import { SupplierInvoiceDataSchema } from '$lib/components/features/supplier-invoices/supplier-invoice-schema'

/**
 * Contract for SupplierInvoiceDetails component.
 * - Provides: the received invoice (so SupplierInvoiceSidebar renders its header + menu)
 * - Consumes: nothing (reads the invoice id from pageDetails)
 */
export const SupplierInvoiceDetailsContract = {
  $id: 'SupplierInvoiceDetails',
  provides: {
    supplierInvoice: SupplierInvoiceDataSchema,
  },
  consumes: {},
} as const satisfies ComponentContract
