import { createRawSnippet } from 'svelte'
import { renderComponent } from '$lib/components/ui/data-table'
import Badge from '$lib/components/ui/badge/badge.svelte'
import type { CellContext } from '@tanstack/table-core'
import type { ColumnConfig, BadgeConfig } from '../types'

/**
 * Badge renderer - displays single badge with variant mapping
 *
 * @example
 * {
 *   accessorKey: 'status',
 *   header: 'Status',
 *   renderer: 'badge',
 *   rendererConfig: {
 *     variantMapper: (status) => status === 'active' ? 'success' : 'secondary',
 *     labelMapper: (status) => status.toUpperCase()
 *   }
 * }
 */
export function createBadgeRenderer<T>(config: ColumnConfig<T>) {
	return (context: CellContext<T, unknown>) => {
		const value = context.getValue()

		// Fallback for missing values
		if (value === null || value === undefined || value === '') {
			return '-'
		}

		const badgeConfig = config.rendererConfig as BadgeConfig<T> | undefined

		if (!badgeConfig?.variantMapper) {
			// No variant mapper, just show text
			return String(value)
		}

		// Map value to variant
		const variant = badgeConfig.variantMapper(value)

		// Map value to label (optional)
		const label = badgeConfig.labelMapper ? badgeConfig.labelMapper(value) : String(value)

		// Create snippet for badge children
		const children = createRawSnippet(() => ({
			render: () => `<span>${label}</span>`
		}))

		return renderComponent(Badge, { variant, children })
	}
}
