<!--
  @component CategoryBadges
  @description Displays category badges with a "show more" toggle when there are more than 3 categories.
  Shows first 3 categories by default, with a link to expand/collapse.
  @keywords categories, badges, pills, expandable, show-more
  @uses Badge
-->
<script lang="ts">
  import { Badge } from '$lib/components/ui/badge'

  interface Props {
    categories: string[]
    maxVisible?: number
  }

  let { categories, maxVisible = 3 }: Props = $props()

  let expanded = $state(false)

  const hasMore = $derived(categories.length > maxVisible)
  const visibleCategories = $derived(expanded ? categories : categories.slice(0, maxVisible))
  const remainingCount = $derived(categories.length - maxVisible)
</script>

<div class="flex flex-wrap items-center gap-1">
  {#each visibleCategories as category, i (category + i)}
    <Badge variant="secondary" class="text-xs">
      {category}
    </Badge>
  {/each}

  {#if hasMore}
    <button
      type="button"
      onclick={() => (expanded = !expanded)}
      class="text-xs text-primary hover:underline"
    >
      {expanded ? 'Show less' : `+${remainingCount} more`}
    </button>
  {/if}
</div>
