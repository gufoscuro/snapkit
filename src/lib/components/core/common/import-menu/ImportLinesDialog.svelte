<!--
  @component ImportLinesDialog
  @description Optional second step of an ImportMenu flow: lists the candidate lines of the
  picked source records, grouped by source, with checkboxes to keep only a subset. Every line
  starts selected; each group header toggles its own lines and the table header toggles all.
  Entity-agnostic — the consumer maps source lines to rows with a string `id` and decides what
  to do with the confirmed rows. Two-way bind `open` to control it.
  @keywords import, lines, selection, checkbox, dialog, modal, partial, subset, items
  @uses Dialog, DataTable, Checkbox, ResourceTable column renderers
-->
<script lang="ts" module>
  export type ImportLinesGroup<R> = {
    /** Stable source record id (e.g. the sales order id) */
    id: string
    /** Group header label (e.g. document number) */
    label: string
    /** Secondary header text (e.g. document date, customer) */
    description?: string
    rows: R[]
  }
</script>

<script lang="ts" generics="R extends { id: string }">
  import { createTableSelection } from '$components/core/common/table-selection.svelte'
  import { DataTable } from '$components/core/DataTable'
  import { createSelectColumn } from '$components/core/ResourceTable/renderers/select-renderer'
  import type { ActionHelpers, ColumnConfig } from '$components/core/ResourceTable/types'
  import { resolveColumns } from '$components/core/ResourceTable/utils/column-resolver'
  import { Button } from '$components/ui/button'
  import { Checkbox } from '$components/ui/checkbox'
  import * as Dialog from '$components/ui/dialog'
  import * as m from '$lib/paraglide/messages'
  import { untrack } from 'svelte'

  type Props = {
    open: boolean
    groups: ImportLinesGroup<R>[]
    /** Declarative columns, same format as ResourceTable (row actions are not supported) */
    columns: ColumnConfig<R>[]
    title?: string
    description?: string
    /** Extra classes for a row, e.g. to set descriptive lines apart from item lines */
    rowClassName?: (row: R) => string
    /** Called with the kept rows, in display order. The dialog closes itself afterwards. */
    onconfirm: (rows: R[]) => void
  }

  let {
    open = $bindable(false),
    groups,
    columns,
    title = m.import_lines_dialog_title(),
    description = m.import_lines_dialog_description(),
    rowClassName,
    onconfirm,
  }: Props = $props()

  const selection = createTableSelection<R>()

  const rows = $derived(groups.flatMap(g => g.rows))
  const groupIdByRow = $derived(new Map(groups.flatMap(g => g.rows.map(r => [r.id, g.id] as const))))
  const groupById = $derived(new Map(groups.map(g => [g.id, g])))

  // A new set of candidates starts fully selected: the common case is importing
  // everything but a few lines, so the user deselects rather than selects.
  // `untrack`: both calls read and write the store's own state, which must not
  // become a dependency — only a new set of rows should reset the selection.
  $effect(() => {
    const next = rows
    untrack(() => {
      selection.setPool(next)
      selection.selectAll()
    })
  })

  // The rows never change while the dialog is open, so there is nothing for
  // row actions to act on; the helpers only satisfy `resolveColumns`' signature.
  const noopHelpers: ActionHelpers<R> = {
    removeRow: () => {},
    removeRows: () => {},
    updateRow: () => {},
    refresh: async () => {},
  }

  const resolvedColumns = $derived([createSelectColumn<R>(selection), ...resolveColumns(columns, noopHelpers)])

  function handleConfirm() {
    onconfirm(selection.rows)
    open = false
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="flex max-h-[85vh] flex-col sm:max-w-3xl">
    <Dialog.Header>
      <Dialog.Title>{title}</Dialog.Title>
      <Dialog.Description>{description}</Dialog.Description>
    </Dialog.Header>

    <div class="min-h-0 flex-1 overflow-y-auto">
      <DataTable
        data={rows}
        columns={resolvedColumns}
        stickyHeader={false}
        {rowClassName}
        getGroupKey={row => groupIdByRow.get(row.id) ?? ''}>
        {#snippet groupHeader(groupRows)}
          {@const group = groupById.get(groupIdByRow.get(groupRows[0]?.id) ?? '')}
          {@const ids = groupRows.map(r => r.id)}
          {@const state = selection.stateOf(ids)}
          <!-- Mirrors TableGroupHeader's typography (a feature component, so not importable from core).
               `pe-4`: shadcn's Table.Cell drops its end padding when it contains a checkbox
               (`[&:has([role=checkbox])]:pe-0`), which would push the counter against the border. -->
          <div class="flex items-center justify-between gap-3 pe-4">
            <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Checkbox
                class="mr-1"
                checked={state.all}
                indeterminate={state.some}
                onCheckedChange={() => selection.toggleMany(ids)}
                aria-label={m.import_lines_select_group({ label: group?.label ?? '' })} />
              <span class="text-sm font-semibold text-foreground">{group?.label || '-'}</span>
              {#if group?.description}
                <span class="text-xs text-muted-foreground">{group.description}</span>
              {/if}
            </div>
            <span class="shrink-0 text-xs text-muted-foreground tabular-nums">
              {ids.filter(id => selection.has(id)).length}/{ids.length}
            </span>
          </div>
        {/snippet}
      </DataTable>
    </div>

    <Dialog.Footer>
      <Button type="button" variant="outline" onclick={() => (open = false)}>{m.cancel()}</Button>
      <Button type="button" disabled={selection.count === 0} onclick={handleConfirm}>
        {m.common_import()} ({selection.count})
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
