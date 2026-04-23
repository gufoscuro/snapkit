<script lang="ts">
  import type { PageConfig } from '$lib/utils/page-registry'
  import type { Path } from '../types'
  import PageTreeNode from './PageTreeNode.svelte'
  import SectionHeader from './SectionHeader.svelte'

  type Props = {
    pages: PageConfig[]
    selectedPath: Path | null
    onSelect: (path: Path) => void
  }

  let { pages, selectedPath, onSelect }: Props = $props()

  let expanded = $state(true)
</script>

<SectionHeader label="Pages" {expanded} onToggle={() => (expanded = !expanded)}>
  {#if pages.length === 0}
    <div class="px-2 py-1 text-xs italic text-muted-foreground">Nessuna pagina</div>
  {:else}
    {#each pages as page, i (page.$id || i)}
      <PageTreeNode path={['pages', i]} {page} {selectedPath} {onSelect} />
    {/each}
  {/if}
</SectionHeader>
