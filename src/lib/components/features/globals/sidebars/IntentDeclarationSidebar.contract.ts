import type { ComponentContract } from '$lib/contexts/page-state'
import { IntentDeclarationDataSchema } from '$lib/components/features/customers/CustomerIntentDeclarationDetails/default/CustomerIntentDeclarationDetails.contract'

/**
 * Contract for IntentDeclarationSidebar component.
 * - Provides: nothing
 * - Consumes: intentDeclaration data (provided by CustomerIntentDeclarationDetails
 *   on the detail page and by the usages subpage)
 */
export const IntentDeclarationSidebarContract = {
  $id: 'IntentDeclarationSidebar',
  provides: {},
  consumes: {
    intentDeclaration: IntentDeclarationDataSchema,
  },
} as const satisfies ComponentContract
