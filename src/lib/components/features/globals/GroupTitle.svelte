<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    heading: string
    description?: Snippet
    content: Snippet
    class?: string
  }

  let { heading, description, content, class: className = '' }: Props = $props()
</script>

<div class="flex gap-8 max-lg:flex-col max-lg:gap-4 {className}">
  <div class="shrink-0 lg:w-1/4 lg:max-w-3xs">
    <h2 class="text-lg font-semibold">{heading}</h2>
    {#if description}
      <p class="text-sm text-muted-foreground">{@render description()}</p>
    {/if}
  </div>
  <div class="flex flex-1 flex-col gap-4">
    {@render content()}
  </div>
</div>
