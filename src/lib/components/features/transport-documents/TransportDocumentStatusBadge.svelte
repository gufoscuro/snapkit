<!--
  @component TransportDocumentStatusBadge
  @description Badge showing transport document state with a colored state icon.
  Combines the outline Badge with icon indicators for open/carried states.
  @keywords transport-document, ddt, status, badge, state
-->
<script lang="ts">
  import Badge from '$components/ui/badge/badge.svelte'
  import IconCircleCheck from '@tabler/icons-svelte/icons/circle-check'
  import IconCircleDashed from '@tabler/icons-svelte/icons/circle-dashed'
  import type { TransportDocument } from '$lib/types/api-types'
  import { getTransportDocumentStatusLabel } from '$lib/utils/enum-labels'

  let { state }: { state: TransportDocument['state'] } = $props()
</script>

<Badge variant="outline" class="px-1.5">
  {#if state === 'carried'}
    <IconCircleCheck class="size-3 text-green-500 dark:text-green-400" />
  {:else}
    <IconCircleDashed class="size-3 text-muted-foreground" />
  {/if}
  {getTransportDocumentStatusLabel(state)}
</Badge>
