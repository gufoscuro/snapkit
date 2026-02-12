import type { CellContext } from '@tanstack/table-core'
import type { ColumnConfig, CurrencyConfig } from '../types'

/**
 * Currency renderer - formats currency using Intl.NumberFormat
 *
 * @example
 * {
 *   accessorKey: 'total',
 *   header: 'Total',
 *   renderer: 'currency',
 *   rendererConfig: {
 *     currencyAccessor: (row) => row.default_currency || 'EUR',
 *     locale: 'it-IT'
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

		// Get locale
		const locale = currencyConfig?.locale || 'en-US'

		// Format currency
		const formatter = new Intl.NumberFormat(locale, {
			style: 'currency',
			currency
		})

		return formatter.format(numericValue)
	}
}
