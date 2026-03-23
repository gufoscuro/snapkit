<!--
  @component ItemSidebar
  @description Sidebar template for the item pages
  @keywords sidebar
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { ItemSidebarContract as contract } from './ItemSidebar.contract.js'
</script>

<script lang="ts">
  import Badge from '$components/ui/badge/badge.svelte'
  import Skeleton from '$components/ui/skeleton/skeleton.svelte'
  import { useConsumes } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages'
  import type { MenuItem } from '$lib/stores/tenant-config/types'
  import type { Item } from '$lib/types/api-types.js'
  import { getItemCategoryLabel } from '$lib/utils/enum-labels'
  import { createRoute } from '$utils/route-builder.js'
  import type { SnippetProps } from '$utils/runtime'
  import { ItemSidebarContract } from './ItemSidebar.contract.js'
  import SubpageMenuGroup from './SubpageMenuGroup.svelte'
  import SubpageSidebarBase from './SubpageSidebarBase.svelte'

  const props: SnippetProps = $props()

  const itemHandle = useConsumes(ItemSidebarContract, 'item')
  const item: Item | undefined = $derived(itemHandle.get())

  const pageMenu = $derived.by(() => {
    if (!item)
      return {
        name: m.item(),
        items: [],
      }

    const items: MenuItem[] = [
      {
        type: 'link',
        label: m.overview(),
        pageId: 'item-details',
        params: { uuid: item.id },
      },
      {
        type: 'link',
        label: m.documents(),
        pageId: 'item-documents',
        params: { uuid: item.id },
      },
    ]

    return { name: m.item(), items }
  })
</script>

<SubpageSidebarBase {...props} fallback={createRoute({ $id: 'items' })}>
  {#if !item && !props.pageDetails?.params?.uuid}
    <div class="px-4">
      <h2 class="line-clamp-2 text-lg font-semibold">
        {m.add_new_item()}
      </h2>
    </div>
  {:else if item}
    <div class="px-4 pt-2">
      <h2 class="line-clamp-2 text-lg font-semibold" title={item.name}>
        {item.name}
      </h2>

      <p class="text-sm text-muted-foreground">{item.code}</p>

      {#if item.product_family}
        <p class="mt-2 text-sm text-muted-foreground">
          {m.item_product_information()}: {item.product_family.name}
        </p>
      {/if}

      {#if item.primary_uom}
        <p class="text-sm text-muted-foreground">
          UoM: {item.primary_uom}
        </p>
      {/if}

      {#if item.standard_cost}
        <p class="text-sm text-muted-foreground">
          {m.item_cost_information()}: {item.standard_cost}
          {item.cost_currency ?? ''}
        </p>
      {/if}

      <div class="mt-2">
        <Badge variant="outline">
          {getItemCategoryLabel(item.item_category)}
        </Badge>
      </div>
    </div>

    <SubpageMenuGroup name={pageMenu.name} items={pageMenu.items} />
  {:else}
    <div class="flex flex-col gap-1 px-4 pt-2">
      <Skeleton class="h-7 w-3/4" />
      <Skeleton class="h-5 w-1/4" />
      <Skeleton class="mt-1 h-5 w-3/4" />
      <Skeleton class="h-5 w-full" />
      <Skeleton class="h-5 w-2/4" />
    </div>
  {/if}
</SubpageSidebarBase>
