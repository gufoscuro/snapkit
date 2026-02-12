import type { CellContext } from '@tanstack/table-core'
import type { ColumnConfig, DateConfig } from '../types'

/**
 * Date renderer - formats dates using Intl.DateTimeFormat
 *
 * @example
 * {
 *   accessorKey: 'created_at',
 *   header: 'Created',
 *   renderer: 'date',
 *   rendererConfig: {
 *     format: 'short',
 *     locale: 'it-IT'
 *   }
 * }
 */
export function createDateRenderer<T>(config: ColumnConfig<T>) {
	return (context: CellContext<T, unknown>) => {
		const value = context.getValue()

		// Fallback for missing values
		if (value === null || value === undefined || value === '') {
			return '-'
		}

		const dateConfig = config.rendererConfig as DateConfig<T> | undefined
		const format = dateConfig?.format || 'short'
		const locale = dateConfig?.locale || undefined // Use user's locale by default

		// Parse date
		let date: Date
		if (value instanceof Date) {
			date = value
		} else if (typeof value === 'string' || typeof value === 'number') {
			date = new Date(value)
		} else {
			return String(value) // Can't parse, just show as string
		}

		// Check if date is valid
		if (isNaN(date.getTime())) {
			return String(value)
		}

		// Format date based on format type
		if (format === 'iso') {
			return date.toISOString()
		}

		// Use Intl.DateTimeFormat for localized formatting
		const dateStyle = format === 'long' ? 'long' : 'short'
		const formatter = new Intl.DateTimeFormat(locale, {
			dateStyle
		})

		return formatter.format(date)
	}
}
