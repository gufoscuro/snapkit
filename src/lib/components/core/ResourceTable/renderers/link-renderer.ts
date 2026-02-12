import { createRawSnippet } from 'svelte'
import { renderSnippet } from '$lib/components/ui/data-table'
import type { CellContext } from '@tanstack/table-core'
import type { ColumnConfig, LinkConfig } from '../types'

/**
 * Link renderer - creates clickable links to detail pages
 *
 * @example
 * {
 *   accessorKey: 'name',
 *   header: 'Supplier',
 *   renderer: 'link',
 *   rendererConfig: {
 *     urlBuilder: (row) => `/suppliers/${row.id}`
 *   }
 * }
 *
 * @example With custom value accessor
 * {
 *   accessorKey: 'internal_id',
 *   header: 'Order',
 *   renderer: 'link',
 *   rendererConfig: {
 *     urlBuilder: (row) => `/orders/${row.id}`,
 *     valueAccessor: (row) => row.internal_id ?? row.id ?? '-'
 *   }
 * }
 */
export function createLinkRenderer<T>(config: ColumnConfig<T>) {
	return (context: CellContext<T, unknown>) => {
		const row = context.row.original
		const linkConfig = config.rendererConfig as LinkConfig<T> | undefined

		// Use custom accessor if provided, otherwise use default getValue
		const value = linkConfig?.valueAccessor ? linkConfig.valueAccessor(row) : context.getValue()

		// Fallback for missing/empty values
		if (value === null || value === undefined || value === '') {
			return '-'
		}

		const displayValue = String(value)

		// If no urlBuilder, just show text
		if (!linkConfig?.urlBuilder) {
			return displayValue
		}

		const url = linkConfig.urlBuilder(row)

		// If URL is empty, just show text without link
		if (!url) {
			return displayValue
		}

		// Create snippet with link
		const snippet = createRawSnippet(() => ({
			render: () =>
				`<a href="${url}" class="text-primary hover:underline">${displayValue}</a>`
		}))

		return renderSnippet(snippet)
	}
}
