import { renderComponent } from '$lib/components/ui/data-table'
import type { CellContext } from '@tanstack/table-core'
import type { StatusConfig, ColumnConfig } from '../types'
import StatusBadge from './StatusBadge.svelte'

/**
 * Status renderer - displays a status badge with icon + label
 *
 * @example
 * {
 *   accessorKey: 'status',
 *   header: 'Status',
 *   renderer: 'status',
 *   rendererConfig: {
 *     variantMapper: (status) => {
 *       if (status === 'active') return 'active'
 *       if (status === 'pending') return 'in-progress'
 *       return 'neutral'
 *     },
 *     labelMapper: (status) => status.toUpperCase()
 *   }
 * }
 */
export function createStatusRenderer<T>(config: ColumnConfig<T>) {
  return (context: CellContext<T, unknown>) => {
    const value = context.getValue()

    if (value === null || value === undefined || value === '') {
      return '-'
    }

    const statusConfig = config.rendererConfig as StatusConfig<T> | undefined

    if (!statusConfig?.variantMapper) {
      return String(value)
    }

    const variant = statusConfig.variantMapper(value)
    const label = statusConfig.labelMapper ? statusConfig.labelMapper(value) : String(value)

    return renderComponent(StatusBadge, { variant, label })
  }
}
