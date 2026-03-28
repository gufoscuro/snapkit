import { renderComponent } from '$lib/components/ui/data-table'
import type { CellContext } from '@tanstack/table-core'
import type { ColumnConfig, LongTextConfig } from '../types'
import LongText from './LongText.svelte'

/**
 * Long text renderer - displays text in a div with line-clamp for truncation
 *
 * @example
 * {
 *   accessorKey: 'description',
 *   header: 'Description',
 *   renderer: 'long-text'
 * }
 *
 * @example With custom lines
 * {
 *   accessorKey: 'notes',
 *   header: 'Notes',
 *   renderer: 'long-text',
 *   rendererConfig: {
 *     lines: 2
 *   }
 * }
 */
export function createLongTextRenderer<T>(config: ColumnConfig<T>) {
  return (context: CellContext<T, unknown>) => {
    const longTextConfig = config.rendererConfig as LongTextConfig<T> | undefined
    const row = context.row.original

    const value = longTextConfig?.valueAccessor ? longTextConfig.valueAccessor(row) : context.getValue()

    if (value === null || value === undefined || value === '') {
      return '-'
    }

    const text = String(value)
    const lines = longTextConfig?.lines ?? 3

    return renderComponent(LongText, { text, lines })
  }
}
