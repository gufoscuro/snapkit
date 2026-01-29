<script lang="ts">
  import type { ExtendedOption } from '$utils/generics'

  type Props = {
    items?: Array<ExtendedOption>
    removeItem?: (item: ExtendedOption, event: MouseEvent) => void
    placeholder: string
  }

  let {
    items = [],
    removeItem = () => {},
    placeholder,
  }: Props = $props()

  const selected = $derived(items?.[0])
</script>

<div class="flex flex-wrap gap-1 truncate">
  {#if selected}
    <div class="overflow-ellipsis font-semibold">{selected.label}</div>
  {:else}
    {placeholder}
  {/if}
</div>
