import type { ComponentContract } from '$lib/contexts/page-state'
import { SupplierDataSchema } from '$lib/components/features/suppliers/SupplierDetails/default/SupplierDetails.contract.js'

/**
 * Contract for SupplierContactDetails component.
 * - Provides: supplier data (so SupplierSidebar is populated on this page)
 * - Consumes: nothing
 */
export const SupplierContactDetailsContract = {
	$id: 'SupplierContactDetails',
	provides: {
		supplier: SupplierDataSchema,
	},
	consumes: {},
} as const satisfies ComponentContract
