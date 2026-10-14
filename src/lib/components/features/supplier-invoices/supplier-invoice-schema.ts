import { Type } from '@sinclair/typebox'
import type { SupplierInvoice } from '$lib/types/api-types'

/**
 * Page-state schema for a received invoice, shared by the detail, its subpages
 * and SupplierInvoiceSidebar. Page state only uses the static type, so the
 * runtime shape stays minimal and the full `SupplierInvoice` type is carried
 * through `Type.Unsafe`.
 */
export const SupplierInvoiceDataSchema = Type.Unsafe<SupplierInvoice>(
  Type.Object({ id: Type.String() }, { additionalProperties: true }),
)
