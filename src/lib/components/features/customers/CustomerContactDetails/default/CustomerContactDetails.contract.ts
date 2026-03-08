import type { ComponentContract } from '$lib/contexts/page-state'
import { CustomerDataSchema } from '$lib/components/features/customers/CustomerDetails/default/CustomerDetails.contract.js'

/**
 * Contract for CustomerContactDetails component.
 * - Provides: customer data (so CustomerSidebar is populated on this page)
 * - Consumes: nothing
 */
export const CustomerContactDetailsContract = {
	$id: 'CustomerContactDetails',
	provides: {
		customer: CustomerDataSchema,
	},
	consumes: {},
} as const satisfies ComponentContract
