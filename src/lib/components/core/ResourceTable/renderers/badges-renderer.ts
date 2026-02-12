import { renderComponent } from '$lib/components/ui/data-table'
import type { CellContext } from '@tanstack/table-core'
import type { ColumnConfig, BadgesConfig } from '../types'

/**
 * Badges renderer - displays multiple badges using a custom component
 *
 * Typically used for CategoryBadges, TagBadges, etc.
 *
 * @example
 * {
 *   accessorKey: 'categories',
 *   header: 'Categories',
 *   renderer: 'badges',
 *   rendererConfig: {
 *     component: CategoryBadges
 *   }
 * }
 */
export function createBadgesRenderer<T>(config: ColumnConfig<T>) {
	return (context: CellContext<T, unknown>) => {
		const row = context.row.original
		const badgesConfig = config.rendererConfig as BadgesConfig<T> | undefined

		if (!badgesConfig?.component) {
			throw new Error('badges renderer requires a component in rendererConfig')
		}

		// Use custom accessor if provided, otherwise use accessorKey value
		const items = badgesConfig.accessor
			? badgesConfig.accessor(row)
			: (context.getValue() as any[])

		// Handle missing/empty arrays
		if (!items || !Array.isArray(items) || items.length === 0) {
			return '-'
		}

		// Render the badges component with the items
		// Assuming the component accepts a prop with the same name as accessorKey
		// or a generic 'items' prop
		const props: Record<string, any> = {}

		// Try to determine the prop name from accessorKey
		if (config.accessorKey) {
			props[config.accessorKey as string] = items
		} else {
			// Fallback to 'items'
			props.items = items
		}

		return renderComponent(badgesConfig.component, props)
	}
}
