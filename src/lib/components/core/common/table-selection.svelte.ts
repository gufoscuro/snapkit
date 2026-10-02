/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ActionHelpers } from '$components/core/ResourceTable/types'
import { SvelteSet } from 'svelte/reactivity'

export type TableSelectionState<T> = {
  /** Selected ids, in row order */
  readonly ids: string[]
  /** Selected rows, resolved from the pool, in row order */
  readonly rows: T[]
  readonly count: number
  /** Every row currently loaded is selected (false when the table is empty) */
  readonly allSelected: boolean
  /** Some but not all rows are selected — drives the checkbox's indeterminate state */
  readonly someSelected: boolean
  /** Action helpers published by the owning ResourceTable */
  readonly helpers: ActionHelpers<T> | undefined
  has: (id: string) => boolean
  toggle: (id: string) => void
  toggleAll: () => void
  /** Select every row currently in the pool (no-op on rows without an id) */
  selectAll: () => void
  /**
   * Toggle a subset as a block — e.g. every line of one source document under a
   * group header. Selects them all unless they all already are, then clears them.
   */
  toggleMany: (ids: string[]) => void
  /** Selection state of a subset, for a group-level checkbox */
  stateOf: (ids: string[]) => { all: boolean; some: boolean }
  clear: () => void
  /** Internal — called by ResourceTable when its data changes */
  setPool: (rows: T[]) => void
  /** Internal — called by ResourceTable to publish its action helpers */
  setHelpers: (helpers: ActionHelpers<T>) => void
}

function rowId(row: unknown): string | undefined {
  const id = (row as { id?: unknown } | null)?.id
  return typeof id === 'string' ? id : undefined
}

/**
 * Creates a reactive row-selection store, rendered as a checkbox column by
 * `createSelectColumn` and fed with rows via `setPool` — either by a
 * `ResourceTable` (its `selection` prop) or by whoever owns the data of a plain
 * `DataTable` (e.g. `ImportLinesDialog`).
 *
 * The store, not the table, is the source of truth so that components outside
 * the table can read it. Ported from diaphora, where a sibling `BulkActions` bar
 * reads it; that bar is not ported yet (see `resource-table.md` → Row selection).
 *
 * Selection covers the rows currently loaded in memory: `setPool` prunes ids
 * that are no longer present, so changing filters or sort empties the selection
 * and an optimistic `removeRow` drops the row from it too.
 */
export function createTableSelection<T extends Record<string, any>>(): TableSelectionState<T> {
  const selected = new SvelteSet<string>()
  // Raw: the pool is always replaced wholesale, never mutated, so deep proxies
  // would only cost allocations and break row identity for consumers.
  let pool = $state.raw<T[]>([])
  let helpers = $state<ActionHelpers<T> | undefined>(undefined)

  // Derived from the pool so ordering always matches what is on screen.
  const selectedRows = $derived(
    pool.filter(row => {
      const id = rowId(row)
      return id !== undefined && selected.has(id)
    }),
  )

  const selectableIds = $derived(pool.map(rowId).filter((id): id is string => id !== undefined))

  return {
    get ids() {
      return selectedRows.map(row => rowId(row)!)
    },
    get rows() {
      return selectedRows
    },
    get count() {
      return selectedRows.length
    },
    get allSelected() {
      return selectableIds.length > 0 && selectedRows.length === selectableIds.length
    },
    get someSelected() {
      return selectedRows.length > 0 && selectedRows.length < selectableIds.length
    },
    get helpers() {
      return helpers
    },
    has(id: string) {
      return selected.has(id)
    },
    toggle(id: string) {
      if (selected.has(id)) {
        selected.delete(id)
      } else {
        selected.add(id)
      }
    },
    toggleAll() {
      if (selectableIds.length > 0 && selectedRows.length === selectableIds.length) {
        selected.clear()
      } else {
        for (const id of selectableIds) selected.add(id)
      }
    },
    selectAll() {
      for (const id of selectableIds) selected.add(id)
    },
    toggleMany(ids: string[]) {
      if (ids.length > 0 && ids.every(id => selected.has(id))) {
        for (const id of ids) selected.delete(id)
      } else {
        for (const id of ids) selected.add(id)
      }
    },
    stateOf(ids: string[]) {
      const count = ids.filter(id => selected.has(id)).length
      return { all: ids.length > 0 && count === ids.length, some: count > 0 && count < ids.length }
    },
    clear() {
      selected.clear()
    },
    setPool(rows: T[]) {
      pool = rows
      // Prune ids that left the table (filter change, reload, optimistic removal).
      if (selected.size === 0) return
      // A plain Set on purpose: it is a throwaway lookup local to this call,
      // never read reactively, so it has nothing to gain from SvelteSet.
      // eslint-disable-next-line svelte/prefer-svelte-reactivity
      const present = new Set(rows.map(rowId).filter((id): id is string => id !== undefined))
      for (const id of [...selected]) {
        if (!present.has(id)) selected.delete(id)
      }
    },
    setHelpers(h: ActionHelpers<T>) {
      helpers = h
    },
  }
}
