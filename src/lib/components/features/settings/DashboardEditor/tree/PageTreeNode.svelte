<script lang="ts">
  import type { PageConfig } from '$lib/utils/page-registry'
  import { pathsEqual } from '$lib/utils/config-tree'
  import ChevronRight from '@lucide/svelte/icons/chevron-right'
  import FileText from '@lucide/svelte/icons/file-text'
  import type { Path } from '../types'
  import Self from './PageTreeNode.svelte'

  type Props = {
    path: Path
    page: PageConfig
    selectedPath: Path | null
    onSelect: (path: Path) => void
  }

  let { path, page, selectedPath, onSelect }: Props = $props()

  let expanded = $state(false)

  const hasChildren = $derived((page.subpages?.length ?? 0) > 0)
  const isSelected = $derived(pathsEqual(path, selectedPath))

  function toggle(e: MouseEvent) {
    e.stopPropagation()
    expanded = !expanded
  }
</script>

<div class="select-none">
  <div
    class="group flex items-center gap-1 rounded px-1 py-1 text-sm hover:bg-muted {isSelected
      ? 'bg-accent text-accent-foreground'
      : ''}">
    {#if hasChildren}
      <button
        type="button"
        class="flex size-4 items-center justify-center"
        onclick={toggle}
        aria-label={expanded ? 'Collapse' : 'Expand'}>
        <ChevronRight class="size-4 transition-transform duration-150 {expanded ? 'rotate-90' : ''}" />
      </button>
    {:else}
      <span class="size-4"></span>
    {/if}

    <button
      type="button"
      class="flex flex-1 items-center gap-1.5 text-left"
      onclick={() => onSelect(path)}>
      <FileText class="size-3.5 text-muted-foreground" />
      <span class="truncate">{page.title || page.$id}</span>
    </button>
  </div>

  {#if expanded && hasChildren}
    <div class="ml-4 border-l border-border/50 pl-2">
      {#each page.subpages ?? [] as subpage, i (subpage.$id || i)}
        <Self path={[...path, 'subpages', i]} page={subpage} {selectedPath} {onSelect} />
      {/each}
    </div>
  {/if}
</div>
