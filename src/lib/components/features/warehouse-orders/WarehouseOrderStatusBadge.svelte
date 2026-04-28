<!--
  @component WarehouseOrderStatusBadge
  @description Badge showing warehouse order state with a colored state icon.
  Combines the outline Badge with icon indicators for open/handed_over states.
  @keywords warehouse-order, status, badge, state
-->
<script lang="ts">
  import Badge from '$components/ui/badge/badge.svelte'
  import IconCircleCheck from '@tabler/icons-svelte/icons/circle-check'
  import IconCircleDashed from '@tabler/icons-svelte/icons/circle-dashed'
  import type { WarehouseOrder } from '$lib/types/api-types'
  import { getWarehouseOrderStatusLabel } from '$lib/utils/enum-labels'

  let { state }: { state: WarehouseOrder['state'] } = $props()
</script>

<Badge variant="outline" class="px-1.5">
  {#if state === 'handed_over'}
    <IconCircleCheck class="size-3 text-green-500 dark:text-green-400" />
  {:else}
    <IconCircleDashed class="size-3 text-muted-foreground" />
  {/if}
  {getWarehouseOrderStatusLabel(state)}
</Badge>
