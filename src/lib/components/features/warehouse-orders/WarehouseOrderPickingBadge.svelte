<!--
  @component WarehouseOrderPickingBadge
  @description Badge showing the picking status of a warehouse order.
  Renders nothing when picking_status is null.
  @keywords warehouse-order, picking, badge, status
-->
<script lang="ts">
  import StatusBadge from '$lib/components/core/ResourceTable/renderers/StatusBadge.svelte'
  import type { StatusVariant } from '$lib/components/core/ResourceTable/renderers/StatusBadge.svelte'
  import type { WarehouseOrderPickingStatus } from '$lib/types/api-types'
  import { getWarehouseOrderPickingStatusLabel } from '$lib/utils/enum-labels'

  let { pickingStatus }: { pickingStatus: WarehouseOrderPickingStatus | null } = $props()

  function getVariant(status: WarehouseOrderPickingStatus): StatusVariant {
    if (status === 'full') return 'active'
    if (status === 'partial') return 'in-progress'
    return 'neutral'
  }
</script>

{#if pickingStatus}
  <StatusBadge variant={getVariant(pickingStatus)} label={getWarehouseOrderPickingStatusLabel(pickingStatus)} />
{/if}
