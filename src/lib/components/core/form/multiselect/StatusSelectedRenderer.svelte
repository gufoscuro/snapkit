<script lang="ts">
  import StatusBadge from '$lib/components/core/ResourceTable/renderers/StatusBadge.svelte'
  import type { StatusVariant } from '$lib/components/core/ResourceTable/types'
  import type { ExtendedOption } from '$utils/generics'

  let { items, placeholder }: { items: ExtendedOption[]; placeholder: string } = $props()

  const selected = $derived(items?.[0])
  const variant = $derived((selected?.attr as { variant: StatusVariant } | undefined)?.variant ?? 'neutral')
</script>

{#if selected}
  <StatusBadge {variant} label={selected.label} />
{:else}
  <span class="font-normal text-muted-foreground">{placeholder}</span>
{/if}
