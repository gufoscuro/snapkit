<script lang="ts">
  import type { ExtendedOption } from '$utils/generics'

  export let items: Array<ExtendedOption> = []
  export let removeItem: (item: ExtendedOption, event: MouseEvent) => void = () => {}
  export let placeholder: string
  export let colored: boolean = true
</script>

<div class="flex flex-wrap gap-1">
  {#each items as item, index}
    <div class="cursor-pointer rounded border bg-muted/30 px-1 py-0.5" on:click={event => removeItem(item, event)}>
      {item.label}
    </div>
  {:else}
    {placeholder}
  {/each}
</div>
