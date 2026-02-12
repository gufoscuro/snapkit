import { renderComponent } from '$lib/components/ui/data-table'
import type { CellContext } from '@tanstack/table-core'
import type { ColumnConfig, ComponentConfig } from '../types'

/**
 * Component renderer - renders a custom Svelte component
 *
 * @example
 * {
 *   accessorKey: 'supplier',
 *   header: 'Supplier',
 *   renderer: 'component',
 *   rendererConfig: {
 *     component: SupplierCard,
 *     propsMapper: (row) => ({ supplier: row.supplier, compact: true })
 *   }
 * }
 */
export function createComponentRenderer<T>(config: ColumnConfig<T>) {
	return (context: CellContext<T, unknown>) => {
		const row = context.row.original
		const componentConfig = config.rendererConfig as ComponentConfig<T> | undefined

		if (!componentConfig?.component) {
			throw new Error('component renderer requires a component in rendererConfig')
		}

		if (!componentConfig.propsMapper) {
			throw new Error('component renderer requires a propsMapper function in rendererConfig')
		}

		// Map row data to component props
		const props = componentConfig.propsMapper(row)

		return renderComponent(componentConfig.component, props)
	}
}
