import type { CellContext } from '@tanstack/table-core'
import type { ColumnConfig, TextConfig } from '../types'

/**
 * Text renderer - displays simple text with fallback "-"
 *
 * @example
 * {
 *   accessorKey: 'vat_no',
 *   header: 'VAT',
 *   renderer: 'text'
 * }
 *
 * @example With custom accessor
 * {
 *   accessorKey: 'supplier_attr',
 *   header: 'Supplier',
 *   renderer: 'text',
 *   rendererConfig: {
 *     valueAccessor: (row) => row.supplier_attr?.name
 *   }
 * }
 */
export function createTextRenderer<T>(config: ColumnConfig<T>) {
	return (context: CellContext<T, unknown>) => {
		const textConfig = config.rendererConfig as TextConfig<T> | undefined
		const row = context.row.original

		// Use custom accessor if provided, otherwise use default getValue
		const value = textConfig?.valueAccessor ? textConfig.valueAccessor(row) : context.getValue()

		// Handle null, undefined, empty string
		if (value === null || value === undefined || value === '') {
			return '-'
		}

		return String(value)
	}
}
