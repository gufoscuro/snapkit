<script lang="ts">
  import * as m from '$lib/paraglide/messages'
  import Braces from '@lucide/svelte/icons/braces'

  type Props = {
    selected: boolean
    onSelect: () => void
  }

  let { selected, onSelect }: Props = $props()
</script>

<!-- Sits above the tree sections as a peer of Pages/Menus/Resources/Policies, but it
     addresses the whole config rather than a node inside it: no chevron, no children. -->
<div class="mb-1 select-none">
  <button
    type="button"
    title={m.admin_raw_root_description()}
    class="flex w-full items-center gap-1.5 rounded px-1 py-1 text-left text-sm font-semibold hover:bg-muted {selected
      ? 'bg-accent text-accent-foreground'
      : ''}"
    onclick={onSelect}>
    <Braces class="size-4 text-muted-foreground" />
    <span>{m.admin_raw_root()}</span>
  </button>
</div>
