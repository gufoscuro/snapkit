<!--
  @component SalesOrderFulfillmentBadge
  @description Badge showing the fulfillment status of a sales order.
  Renders nothing when fulfillment_status is null.
  @keywords sales-order, fulfillment, badge, status
-->
<script lang="ts">
  import StatusBadge from '$lib/components/core/ResourceTable/renderers/StatusBadge.svelte'
  import type { SalesOrderFulfillmentStatus } from '$lib/types/api-types'
  import { getSalesOrderFulfillmentStatusLabel } from '$lib/utils/enum-labels'
  import type { StatusVariant } from '$lib/components/core/ResourceTable/renderers/StatusBadge.svelte'

  let { fulfillmentStatus }: { fulfillmentStatus: SalesOrderFulfillmentStatus | null } = $props()

  function getVariant(status: SalesOrderFulfillmentStatus): StatusVariant {
    if (status === 'fully_shipped') return 'active'
    if (status === 'partially_shipped') return 'in-progress'
    if (status === 'picked') return 'paused'
    return 'neutral'
  }
</script>

{#if fulfillmentStatus}
  <StatusBadge variant={getVariant(fulfillmentStatus)} label={getSalesOrderFulfillmentStatusLabel(fulfillmentStatus)} />
{/if}
