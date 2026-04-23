<script lang="ts">
  import ChevronRight from '@lucide/svelte/icons/chevron-right'
  import type { Snippet } from 'svelte'

  type Props = {
    label: string
    expanded: boolean
    disabled?: boolean
    onToggle: () => void
    children?: Snippet
  }

  let { label, expanded, disabled = false, onToggle, children }: Props = $props()
</script>

<div class="select-none">
  <button
    type="button"
    class="flex w-full items-center gap-1 rounded px-1 py-1 text-left text-sm font-semibold hover:bg-muted disabled:opacity-50"
    {disabled}
    onclick={onToggle}>
    <ChevronRight class="size-4 transition-transform duration-150 {expanded ? 'rotate-90' : ''}" />
    <span>{label}</span>
  </button>

  {#if expanded && children}
    <div class="ml-4">
      {@render children()}
    </div>
  {/if}
</div>
