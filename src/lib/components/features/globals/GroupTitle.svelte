<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    heading: string
    description?: Snippet
    content: Snippet
  }

  let { heading, description, content }: Props = $props()
</script>

<div class="flex gap-8 max-lg:flex-col max-lg:gap-4">
  <div class="lg:w-1/3">
    <h2 class="text-lg font-semibold">{heading}</h2>
    {#if description}
      <p class="text-sm text-muted-foreground">{@render description()}</p>
    {/if}
  </div>
  <div class="flex flex-col gap-4">
    {@render content()}
  </div>
</div>
