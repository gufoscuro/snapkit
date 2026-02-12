import type { CellContext } from '@tanstack/table-core'
import type { ColumnConfig, PhoneConfig } from '../types'

/**
 * Phone renderer - displays first phone from array
 *
 * Expects data structure like:
 * phones: [{ phone: "+39 123456789" }, ...]
 *
 * @example
 * {
 *   accessorKey: 'phones',
 *   header: 'Phone',
 *   renderer: 'phone'
 * }
 */
export function createPhoneRenderer<T>(config: ColumnConfig<T>) {
	return (context: CellContext<T, unknown>) => {
		const row = context.row.original
		const phoneConfig = config.rendererConfig as PhoneConfig<T> | undefined

		// Use custom accessor if provided, otherwise use accessorKey value
		const phones = phoneConfig?.accessor
			? phoneConfig.accessor(row)
			: (context.getValue() as any[])

		// Handle missing/empty arrays
		if (!phones || !Array.isArray(phones) || phones.length === 0) {
			return '-'
		}

		// Get first phone
		const firstPhone = phones[0]

		// Handle different data structures
		if (typeof firstPhone === 'string') {
			return firstPhone
		}

		if (firstPhone && typeof firstPhone === 'object' && 'phone' in firstPhone) {
			return firstPhone.phone || '-'
		}

		return '-'
	}
}
