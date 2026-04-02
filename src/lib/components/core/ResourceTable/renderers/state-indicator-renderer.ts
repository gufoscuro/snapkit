import { renderComponent } from '$lib/components/ui/data-table'
import type { CellContext } from '@tanstack/table-core'
import type { StateIndicatorConfig, ColumnConfig } from '../types'
import StateIndicator from './StateIndicator.svelte'

/**
 * State indicator renderer - displays an icon-only state indicator with tooltip
 *
 * @example
 * {
 *   accessorKey: 'state',
 *   header: '',
 *   renderer: 'state-indicator',
 *   rendererConfig: {
 *     variantMapper: (state) => {
 *       if (state === 'approved') return 'success'
 *       if (state === 'rejected') return 'error'
 *       return 'default'
 *     },
 *     labelMapper: (state) => getStatusLabel(state)
 *   }
 * }
 */
export function createStateIndicatorRenderer<T>(config: ColumnConfig<T>) {
  return (context: CellContext<T, unknown>) => {
    const value = context.getValue()

    if (value === null || value === undefined || value === '') {
      return '-'
    }

    const indicatorConfig = config.rendererConfig as StateIndicatorConfig<T> | undefined

    if (!indicatorConfig?.variantMapper) {
      return String(value)
    }

    const variant = indicatorConfig.variantMapper(value)
    const label = indicatorConfig.labelMapper ? indicatorConfig.labelMapper(value) : String(value)

    return renderComponent(StateIndicator, { variant, label })
  }
}
