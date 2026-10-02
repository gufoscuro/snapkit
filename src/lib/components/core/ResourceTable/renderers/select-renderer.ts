/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TableSelectionState } from '$components/core/common/table-selection.svelte'
import { renderComponent } from '$lib/components/ui/data-table'
import type { CellContext, ColumnDef } from '@tanstack/table-core'
import SelectAllCell from './SelectAllCell.svelte'
import SelectCell from './SelectCell.svelte'

/** Reserved TanStack column id for the synthetic selection column. */
export const SELECT_COLUMN_ID = '__select'

/**
 * Builds the checkbox column ResourceTable prepends when a selection store is
 * provided; usable on a plain DataTable too. Selection state lives entirely in
 * the store, not in TanStack's `rowSelection`: `createSvelteTable` wraps its
 * state in a `mergeObjects` Proxy that breaks Svelte 5's fine-grained tracking,
 * TanStack keys rows by index unless `getRowId` is set, and the store has to be
 * readable from outside the table anyway.
 */
export function createSelectColumn<T extends Record<string, any>>(selection: TableSelectionState<T>): ColumnDef<T> {
  return {
    id: SELECT_COLUMN_ID,
    enableSorting: false,
    meta: { headerClassName: 'w-10', cellClassName: 'w-10' },
    header: () => renderComponent(SelectAllCell, { selection }),
    cell: (context: CellContext<T, unknown>) =>
      renderComponent(SelectCell, { selection, id: (context.row.original as { id?: string })?.id }),
  } as ColumnDef<T>
}
