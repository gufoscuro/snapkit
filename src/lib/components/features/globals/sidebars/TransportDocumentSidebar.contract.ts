import type { ComponentContract } from '$lib/contexts/page-state'
import { TransportDocumentDataSchema } from '$lib/components/features/transport-documents/TransportDocumentDetails/default/TransportDocumentDetails.contract'

/**
 * Contract for TransportDocumentSidebar component.
 * - Provides: nothing
 * - Consumes: transportDocument data (provided by TransportDocumentDetails on the same page)
 */
export const TransportDocumentSidebarContract = {
  $id: 'TransportDocumentSidebar',
  provides: {},
  consumes: {
    transportDocument: TransportDocumentDataSchema,
  },
} as const satisfies ComponentContract
