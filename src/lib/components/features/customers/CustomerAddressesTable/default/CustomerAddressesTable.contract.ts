import { Type } from '@sinclair/typebox'
import type { ComponentContract } from '$lib/contexts/page-state'
import { CustomerDataSchema } from '$lib/components/features/customers/CustomerDetails/default/CustomerDetails.contract.js'

/**
 * Schema for the filter state this component consumes.
 */
export const ConsumedFilterStateSchema = Type.Object({
	search: Type.Optional(Type.String()),
	query: Type.Optional(Type.Record(Type.String(), Type.String()))
})

/**
 * Contract for CustomerAddressesTable component.
 * - Provides: customer data (so CustomerSidebar is populated on this page)
 * - Consumes: filter state (to filter displayed data)
 */
export const CustomerAddressesTableContract = {
	$id: 'CustomerAddressesTable',
	provides: {
		customer: CustomerDataSchema,
	},
	consumes: {
		filters: ConsumedFilterStateSchema
	}
} as const satisfies ComponentContract
