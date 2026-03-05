import type { ComponentContract } from '$lib/contexts/page-state'
import { CustomerDataSchema } from '$lib/components/features/customers/CustomerDetails/default/CustomerDetails.contract.js'

/**
 * Contract for CustomerDocumentsTable component.
 * - Provides: customer data (so CustomerSidebar is populated on this page)
 * - Consumes: nothing (reads params directly from pageDetails)
 */
export const CustomerDocumentsTableContract = {
  $id: 'CustomerDocumentsTable',
  provides: {
    customer: CustomerDataSchema,
  },
  consumes: {},
} as const satisfies ComponentContract
