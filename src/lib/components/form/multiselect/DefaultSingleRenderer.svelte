<script lang="ts">
  import type { ExtendedOption } from '$utils/generics'

  export let items: Array<ExtendedOption> = []
  export let removeItem: (item: ExtendedOption, event: MouseEvent) => void = () => {}
  export let placeholder: string

  $: selected = items?.[0]
</script>

<div class="flex flex-wrap gap-1 truncate">
  {#if selected}
    <div class="overflow-ellipsis font-semibold">{selected.label}</div>
  {:else}
    {placeholder}
  {/if}
</div>
