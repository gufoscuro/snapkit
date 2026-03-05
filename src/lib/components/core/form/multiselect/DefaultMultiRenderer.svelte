<script lang="ts">
  import { badgeVariants } from '$lib/components/ui/badge/badge.svelte'
  import type { ExtendedOption } from '$utils/generics'

  type Props = {
    items?: Array<ExtendedOption>
    placeholder: string
    removeItem: (option: ExtendedOption, event: MouseEvent) => void
  }

  let { items = [], placeholder, removeItem }: Props = $props()
</script>

<div class="flex flex-wrap gap-1">
  {#each items as item (item.value)}
    <button
      class="{badgeVariants({
        variant: 'secondary',
      })} hover:bg-primary hover:text-primary-foreground focus-visible:bg-primary focus-visible:text-primary-foreground"
      onclick={event => removeItem?.(item, event)}>
      {item.label}
    </button>
  {:else}
    {placeholder}
  {/each}
</div>
