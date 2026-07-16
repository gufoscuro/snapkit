import type { ComponentContract } from '$lib/contexts/page-state'
import { IntentDeclarationDataSchema } from '$lib/components/features/customers/CustomerIntentDeclarationDetails/default/CustomerIntentDeclarationDetails.contract'

/**
 * Contract for CustomerIntentDeclarationUsages component.
 * - Provides: intentDeclaration data (so IntentDeclarationSidebar is populated on this subpage)
 * - Consumes: nothing
 */
export const CustomerIntentDeclarationUsagesContract = {
  $id: 'CustomerIntentDeclarationUsages',
  provides: {
    intentDeclaration: IntentDeclarationDataSchema,
  },
  consumes: {},
} as const satisfies ComponentContract
