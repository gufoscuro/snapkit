import type { CellContext } from '@tanstack/table-core'
import type { ColumnConfig, CurrencyConfig } from '../types'
import { renderPrice } from '$lib/utils/prices'

/**
 * Currency renderer - formats currency using the shared renderPrice utility
 *
 * @example
 * {
 *   accessorKey: 'total',
 *   header: 'Total',
 *   renderer: 'currency',
 *   rendererConfig: {
 *     currencyAccessor: (row) => row.default_currency || 'EUR',
 *   }
 * }
 */
export function createCurrencyRenderer<T>(config: ColumnConfig<T>) {
	return (context: CellContext<T, unknown>) => {
		const row = context.row.original
		const value = context.getValue()

		// Fallback for missing values
		if (value === null || value === undefined || value === '') {
			return '-'
		}

		// Parse numeric value
		const numericValue = typeof value === 'number' ? value : parseFloat(String(value))

		if (isNaN(numericValue)) {
			return String(value) // Can't parse, just show as string
		}

		const currencyConfig = config.rendererConfig as CurrencyConfig<T> | undefined

		// Get currency code
		const currency = currencyConfig?.currencyAccessor
			? currencyConfig.currencyAccessor(row)
			: 'EUR'

		return renderPrice(numericValue, currency)
	}
}
