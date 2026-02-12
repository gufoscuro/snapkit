import type { CellContext } from '@tanstack/table-core'
import type { ColumnConfig, CustomConfig } from '../types'

/**
 * Custom renderer - full control over cell rendering
 *
 * Returns anything that DataTable/TanStack Table accepts:
 * - String
 * - RenderComponentConfig
 * - RenderSnippetConfig
 * - Snippet
 * - etc.
 *
 * @example
 * {
 *   accessorKey: 'risk_score',
 *   header: 'Risk',
 *   renderer: 'custom',
 *   rendererConfig: {
 *     cellRenderer: (row) => {
 *       const score = row.risk_score
 *       const color = score > 80 ? 'red' : score > 50 ? 'orange' : 'green'
 *       return `<span class="text-${color}-600 font-bold">${score}%</span>`
 *     }
 *   }
 * }
 */
export function createCustomRenderer<T>(config: ColumnConfig<T>) {
	return (context: CellContext<T, unknown>) => {
		const row = context.row.original
		const customConfig = config.rendererConfig as CustomConfig<T> | undefined

		if (!customConfig?.cellRenderer) {
			throw new Error('custom renderer requires a cellRenderer function in rendererConfig')
		}

		return customConfig.cellRenderer(row)
	}
}
