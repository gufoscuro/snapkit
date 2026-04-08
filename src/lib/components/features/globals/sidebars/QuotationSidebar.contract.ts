import type { ComponentContract } from '$lib/contexts/page-state'
import { QuotationDataSchema } from '$lib/components/features/quotations/QuotationDetails/default/QuotationDetails.contract'

/**
 * Contract for QuotationSidebar component.
 * - Provides: nothing
 * - Consumes: quotation data (provided by QuotationDetails on the same page)
 */
export const QuotationSidebarContract = {
  $id: 'QuotationSidebar',
  provides: {},
  consumes: {
    quotation: QuotationDataSchema,
  },
} as const satisfies ComponentContract
