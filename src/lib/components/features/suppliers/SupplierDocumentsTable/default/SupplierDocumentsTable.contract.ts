import type { ComponentContract } from '$lib/contexts/page-state'
import { SupplierDataSchema } from '$lib/components/features/suppliers/SupplierDetails/default/SupplierDetails.contract.js'

/**
 * Contract for SupplierDocumentsTable component.
 * - Provides: supplier data (so SupplierSidebar is populated on this page)
 * - Consumes: nothing (reads params directly from pageDetails)
 */
export const SupplierDocumentsTableContract = {
  $id: 'SupplierDocumentsTable',
  provides: {
    supplier: SupplierDataSchema,
  },
  consumes: {},
} as const satisfies ComponentContract
