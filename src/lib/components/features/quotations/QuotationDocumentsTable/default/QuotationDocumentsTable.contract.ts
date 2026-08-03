import type { ComponentContract } from '$lib/contexts/page-state'
import { QuotationDataSchema } from '$lib/components/features/quotations/QuotationDetails/default/QuotationDetails.contract'

/**
 * Contract for QuotationDocumentsTable component.
 * - Provides: quotation data (so QuotationSidebar renders the header + menu on this subpage)
 * - Consumes: nothing (reads params directly from pageDetails)
 */
export const QuotationDocumentsTableContract = {
  $id: 'QuotationDocumentsTable',
  provides: {
    quotation: QuotationDataSchema,
  },
  consumes: {},
} as const satisfies ComponentContract
