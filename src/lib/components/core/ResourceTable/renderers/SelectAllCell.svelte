<!--
  @component SelectAllCell
  @description Header checkbox toggling every loaded row of a ResourceTable.
  @keywords table, selection, checkbox, bulk, select-all
-->
<script lang="ts">
  import type { TableSelectionState } from '$components/core/common/table-selection.svelte'
  import { Checkbox } from '$lib/components/ui/checkbox'
  import * as m from '$lib/paraglide/messages'

  interface Props {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    selection: TableSelectionState<any>
  }

  const { selection }: Props = $props()
</script>

<Checkbox
  checked={selection.allSelected}
  indeterminate={selection.someSelected}
  onCheckedChange={() => selection.toggleAll()}
  aria-label={m.table_select_all()} />
