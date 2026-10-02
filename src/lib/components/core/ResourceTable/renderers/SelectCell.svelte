<!--
  @component SelectCell
  @description Per-row selection checkbox for ResourceTable's synthetic select column.
  @keywords table, selection, checkbox, bulk
-->
<script lang="ts">
  import type { TableSelectionState } from '$components/core/common/table-selection.svelte'
  import { Checkbox } from '$lib/components/ui/checkbox'
  import * as m from '$lib/paraglide/messages'

  interface Props {
    // The store is passed whole — not a plain `checked` boolean — because
    // `renderComponent` snapshots props at creation time, so reactivity has to
    // come from reading the store inside this component.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    selection: TableSelectionState<any>
    id: string | undefined
  }

  const { selection, id }: Props = $props()
</script>

{#if id}
  <Checkbox
    checked={selection.has(id)}
    onCheckedChange={() => selection.toggle(id)}
    aria-label={m.table_select_row()} />
{/if}
