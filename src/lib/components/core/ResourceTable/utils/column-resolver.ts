/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ColumnDef } from '@tanstack/table-core'
import { createActionsRenderer } from '../renderers/actions-renderer'
import { createBadgeRenderer } from '../renderers/badge-renderer'
import { createBadgesRenderer } from '../renderers/badges-renderer'
import { createComponentRenderer } from '../renderers/component-renderer'
import { createCurrencyRenderer } from '../renderers/currency-renderer'
import { createCustomRenderer } from '../renderers/custom-renderer'
import { createDateRenderer } from '../renderers/date-renderer'
import { createEmailRenderer } from '../renderers/email-renderer'
import { createLinkRenderer } from '../renderers/link-renderer'
import { createPhoneRenderer } from '../renderers/phone-renderer'
import { createStatusRenderer } from '../renderers/status-renderer'
import { createTextRenderer } from '../renderers/text-renderer'
import type { ActionHelpers, ColumnConfig } from '../types'

/**
 * Resolves ColumnConfig[] to TanStack Table ColumnDef[]
 *
 * Converts declarative column configurations with renderer types
 * into TanStack Table column definitions with cell render functions.
 *
 * @param columns - Array of column configurations
 * @param actionHelpers - Helpers for action handlers (removeRow, updateRow, refresh)
 * @returns Array of TanStack Table column definitions
 */
export function resolveColumns<T>(columns: ColumnConfig<T>[], actionHelpers: ActionHelpers<T>): ColumnDef<T>[] {
  return columns
    .filter(config => {
      // Filter out hidden columns
      if (typeof config.hidden === 'boolean') {
        return !config.hidden
      }
      return true // Dynamic hidden will be handled at render time
    })
    .map((config): ColumnDef<T> => {
      // Build base properties (conditionally include accessorKey)
      const base: any = {
        header: config.header,
        meta: config.meta,
        ...(config.accessorKey && { accessorKey: config.accessorKey }),
      }

      // Select renderer based on type
      switch (config.renderer) {
        case 'text':
          return { ...base, cell: createTextRenderer(config) } as ColumnDef<T>

        case 'link':
          return { ...base, cell: createLinkRenderer(config) } as ColumnDef<T>

        case 'email':
          return { ...base, cell: createEmailRenderer(config) } as ColumnDef<T>

        case 'phone':
          return { ...base, cell: createPhoneRenderer(config) } as ColumnDef<T>

        case 'badge':
          return { ...base, cell: createBadgeRenderer(config) } as ColumnDef<T>

        case 'status':
          return { ...base, cell: createStatusRenderer(config) } as ColumnDef<T>

        case 'badges':
          return { ...base, cell: createBadgesRenderer(config) } as ColumnDef<T>

        case 'date':
          return { ...base, cell: createDateRenderer(config) } as ColumnDef<T>

        case 'currency':
          return { ...base, cell: createCurrencyRenderer(config) } as ColumnDef<T>

        case 'actions':
          return {
            ...base,
            id: 'actions', // No accessorKey for action columns
            cell: createActionsRenderer(config, actionHelpers),
          } as ColumnDef<T>

        case 'component':
          return { ...base, cell: createComponentRenderer(config) } as ColumnDef<T>

        case 'custom':
          return { ...base, cell: createCustomRenderer(config) } as ColumnDef<T>

        default:
          throw new Error(`Unknown renderer type: ${(config as any).renderer}`)
      }
    })
}
