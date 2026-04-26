<!--
  @component WarehouseOrderSidebar
  @description Sidebar template for the warehouse order pages
  @keywords sidebar
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { WarehouseOrderSidebarContract as contract } from './WarehouseOrderSidebar.contract.js'
</script>

<script lang="ts">
  import WarehouseOrderPickingBadge from '$components/features/warehouse-orders/WarehouseOrderPickingBadge.svelte'
  import WarehouseOrderStatusBadge from '$components/features/warehouse-orders/WarehouseOrderStatusBadge.svelte'
  import WarehouseOrderTagBadges from '$components/features/warehouse-orders/WarehouseOrderTagBadges.svelte'
  import Skeleton from '$components/ui/skeleton/skeleton.svelte'
  import { useConsumes } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages'
  import type { MenuItem } from '$lib/stores/tenant-config/types'
  import { createRoute } from '$utils/route-builder.js'
  import type { SnippetProps } from '$utils/runtime'
  import { WarehouseOrderSidebarContract } from './WarehouseOrderSidebar.contract.js'
  import SubpageMenuGroup from './SubpageMenuGroup.svelte'
  import SubpageSidebarBase from './SubpageSidebarBase.svelte'

  const props: SnippetProps = $props()

  const warehouseOrderHandle = useConsumes(WarehouseOrderSidebarContract, 'warehouseOrder')
  const warehouseOrder = $derived(warehouseOrderHandle.get())

  const handedOverOnLabel = $derived.by(() => {
    if (!warehouseOrder?.handed_over_at) return null
    const date = new Date(warehouseOrder.handed_over_at)
    if (isNaN(date.getTime())) return null
    return date.toLocaleDateString()
  })

  const pageMenu = $derived.by(() => {
    if (!warehouseOrder)
      return {
        name: m.warehouse_order(),
        items: [],
      }

    const items: MenuItem[] = [
      {
        type: 'link',
        label: m.overview(),
        pageId: 'warehouse-order-details',
        params: { uuid: warehouseOrder.id },
      },
    ]

    return { name: m.warehouse_order(), items }
  })
</script>

<SubpageSidebarBase {...props} fallback={createRoute({ $id: 'warehouse-orders' })}>
  {#if !warehouseOrder && !props.pageDetails?.params?.uuid}
    <div class="px-4">
      <h2 class="line-clamp-2 text-lg font-semibold">
        {m.new_warehouse_order()}
      </h2>
    </div>
  {:else if warehouseOrder}
    <div class="px-4 pt-2">
      <h2 class="line-clamp-2 text-lg font-semibold" title={warehouseOrder.document_number}>
        {warehouseOrder.document_number}
      </h2>

      <div class="mt-2 flex flex-wrap items-center gap-1">
        <WarehouseOrderStatusBadge state={warehouseOrder.state} />

        {#if warehouseOrder.tags?.length > 0}
          <WarehouseOrderTagBadges tags={warehouseOrder.tags} />
        {/if}

        {#if warehouseOrder.picking_status}
          <WarehouseOrderPickingBadge pickingStatus={warehouseOrder.picking_status} />
        {/if}
      </div>

      {#if handedOverOnLabel}
        <div class="mt-2 text-xs text-muted-foreground">
          {m.handed_over_on()}: {handedOverOnLabel}
        </div>
      {/if}
    </div>

    <SubpageMenuGroup name={pageMenu.name} items={pageMenu.items} />
  {:else}
    <div class="flex flex-col gap-1 px-4 pt-2">
      <Skeleton class="h-7 w-3/4" />
      <Skeleton class="h-5 w-1/4" />
      <Skeleton class="mt-1 h-5 w-3/4" />
    </div>
  {/if}
</SubpageSidebarBase>
