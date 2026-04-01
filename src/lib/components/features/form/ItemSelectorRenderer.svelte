<script lang="ts">
  import type { ExtendedOption } from '$utils/generics'
  import type { Item } from '$lib/types/api-types'

  let { option }: { option: ExtendedOption } = $props()

  const item = $derived(option.attr as Item | undefined)
</script>

<div class="flex flex-col">
  <span>{option.label}</span>
  {#if item?.code}
    <span class="text-xs text-muted-foreground">{item.code}</span>
  {/if}
</div>
