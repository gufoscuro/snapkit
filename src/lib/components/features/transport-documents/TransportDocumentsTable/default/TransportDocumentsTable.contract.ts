import { Type } from '@sinclair/typebox'
import type { ComponentContract } from '$lib/contexts/page-state'
import { TableExportSchema } from '$lib/utils/table-export.svelte'

/**
 * Schema for the filter state this component consumes.
 */
export const ConsumedFilterStateSchema = Type.Object({
	search: Type.Optional(Type.String()),
	query: Type.Optional(Type.Record(Type.String(), Type.String()))
})

/**
 * Contract for TransportDocumentsTable component.
 * - Provides: the CSV export handler, consumed by the sibling filters component
 * - Consumes: filter state (to filter displayed data)
 */
export const TransportDocumentsTableContract = {
	$id: 'TransportDocumentsTable',
	provides: {
		exportHandler: TableExportSchema
	},
	consumes: {
		filters: ConsumedFilterStateSchema
	}
} as const satisfies ComponentContract
