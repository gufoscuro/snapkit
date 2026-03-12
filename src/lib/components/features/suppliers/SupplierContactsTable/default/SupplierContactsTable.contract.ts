import { Type } from '@sinclair/typebox'
import type { ComponentContract } from '$lib/contexts/page-state'
import { SupplierDataSchema } from '$lib/components/features/suppliers/SupplierDetails/default/SupplierDetails.contract.js'

/**
 * Schema for the filter state this component consumes.
 */
export const ConsumedFilterStateSchema = Type.Object({
	search: Type.Optional(Type.String()),
	query: Type.Optional(Type.Record(Type.String(), Type.String()))
})

/**
 * Contract for SupplierContactsTable component.
 * - Provides: supplier data (so SupplierSidebar is populated on this page)
 * - Consumes: filter state (to filter displayed data)
 */
export const SupplierContactsTableContract = {
	$id: 'SupplierContactsTable',
	provides: {
		supplier: SupplierDataSchema,
	},
	consumes: {
		filters: ConsumedFilterStateSchema
	}
} as const satisfies ComponentContract
