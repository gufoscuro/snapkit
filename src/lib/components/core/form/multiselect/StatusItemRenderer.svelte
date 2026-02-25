<script lang="ts">
  import StatusBadge from '$lib/components/core/ResourceTable/renderers/StatusBadge.svelte'
  import type { StatusVariant } from '$lib/components/core/ResourceTable/types'
  import type { ExtendedOption } from '$utils/generics'

  let { option }: { option: ExtendedOption } = $props()

  const variant = $derived((option.attr as { variant: StatusVariant } | undefined)?.variant ?? 'neutral')
</script>

<StatusBadge {variant} label={option.label} />
