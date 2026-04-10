<!--
  @component SalesOrderSidebar
  @description Sidebar template for the sales order pages
  @keywords sidebar
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { SalesOrderSidebarContract as contract } from './SalesOrderSidebar.contract.js'
</script>

<script lang="ts">
  import SalesOrderFulfillmentBadge from '$components/features/sales-orders/SalesOrderFulfillmentBadge.svelte'
  import SalesOrderStatusBadge from '$components/features/sales-orders/SalesOrderStatusBadge.svelte'
  import SalesOrderTagBadges from '$components/features/sales-orders/SalesOrderTagBadges.svelte'
  import Skeleton from '$components/ui/skeleton/skeleton.svelte'
  import { useConsumes } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages'
  import type { MenuItem } from '$lib/stores/tenant-config/types'
  import { createRoute } from '$utils/route-builder.js'
  import type { SnippetProps } from '$utils/runtime'
  import { SalesOrderSidebarContract } from './SalesOrderSidebar.contract.js'
  import SubpageMenuGroup from './SubpageMenuGroup.svelte'
  import SubpageSidebarBase from './SubpageSidebarBase.svelte'

  const props: SnippetProps = $props()

  const salesOrderHandle = useConsumes(SalesOrderSidebarContract, 'salesOrder')
  const salesOrder = $derived(salesOrderHandle.get())

  const pageMenu = $derived.by(() => {
    if (!salesOrder)
      return {
        name: m.sales_order(),
        items: [],
      }

    const items: MenuItem[] = [
      {
        type: 'link',
        label: m.overview(),
        pageId: 'sales-order-details',
        params: { uuid: salesOrder.id },
      },
    ]

    return { name: m.sales_order(), items }
  })
</script>

<SubpageSidebarBase {...props} fallback={createRoute({ $id: 'sales-orders' })}>
  {#if !salesOrder && !props.pageDetails?.params?.uuid}
    <div class="px-4">
      <h2 class="line-clamp-2 text-lg font-semibold">
        {m.new_sales_order()}
      </h2>
    </div>
  {:else if salesOrder}
    <div class="px-4 pt-2">
      <h2 class="line-clamp-2 text-lg font-semibold" title={salesOrder.document_number}>
        {salesOrder.document_number}
      </h2>

      <div class="mt-2 flex flex-wrap items-center gap-1">
        <SalesOrderStatusBadge state={salesOrder.state} />

        {#if salesOrder.tags?.length > 0}
          <SalesOrderTagBadges tags={salesOrder.tags} />
        {/if}

        {#if salesOrder.fulfillment_status}
          <SalesOrderFulfillmentBadge fulfillmentStatus={salesOrder.fulfillment_status} />
        {/if}
      </div>
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
