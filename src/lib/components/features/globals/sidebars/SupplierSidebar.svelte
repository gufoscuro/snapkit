<!--
  @component SupplierSidebar
  @description Sidebar template for the supplier pages
  @keywords sidebar
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { SupplierSidebarContract as contract } from './SupplierSidebar.contract.js'
</script>

<script lang="ts">
  import CustomerTagBadges from '$components/features/customers/CustomerTagBadges.svelte'

  import Skeleton from '$components/ui/skeleton/skeleton.svelte'
  import { useConsumes } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages'
  import type { MenuItem } from '$lib/stores/tenant-config/types'
  import type { Supplier } from '$lib/types/api-types.js'
  import { createRoute } from '$utils/route-builder.js'
  import type { SnippetProps } from '$utils/runtime'
  import SubpageMenuGroup from './SubpageMenuGroup.svelte'
  import SubpageSidebarBase from './SubpageSidebarBase.svelte'
  import { SupplierSidebarContract } from './SupplierSidebar.contract.js'

  const props: SnippetProps = $props()

  const supplierHandle = useConsumes(SupplierSidebarContract, 'supplier')
  const supplier: Supplier | undefined = $derived(supplierHandle.get())

  const pageMenu = $derived.by(() => {
    if (!supplier)
      return {
        name: m.supplier(),
        items: [],
      }

    const items: MenuItem[] = [
      {
        type: 'link',
        label: m.overview(),
        pageId: 'supplier-details',
        params: { uuid: supplier.id },
      },
      {
        type: 'link',
        label: m.addresses(),
        pageId: 'supplier-addresses',
        params: { uuid: supplier.id },
      },
      {
        type: 'link',
        label: m.contacts(),
        pageId: 'supplier-contacts',
        params: { uuid: supplier.id },
      },
      {
        type: 'link',
        label: m.documents(),
        pageId: 'supplier-documents',
        params: { uuid: supplier.id },
      },
    ]

    return { name: m.supplier(), items }
  })
</script>

<SubpageSidebarBase {...props} fallback={createRoute({ $id: 'suppliers' })}>
  {#if !supplier && !props.pageDetails?.params?.uuid}
    <div class="px-4">
      <h2 class="line-clamp-2 text-lg font-semibold">
        {m.add_new_supplier()}
      </h2>
    </div>
  {:else if supplier}
    <div class="px-4 pt-2">
      <h2 class="line-clamp-2 text-lg font-semibold" title={supplier.name}>
        {supplier.name}
      </h2>

      <!-- <p class="">{getSupplierTypeLabel(supplier.type)}</p> -->
      <p class="mt-1 text-sm text-muted-foreground">{m.vat_no()}: {supplier.vat_number}</p>
      <p class="text-sm text-muted-foreground">{m.email()}: <a href="mailto:{supplier.email}">{supplier.email}</a></p>
      <p class="text-sm text-muted-foreground">{m.phone()}: <a href="tel:{supplier.phone}">{supplier.phone}</a></p>

      <div class="mt-2 flex flex-wrap items-center gap-0.5">
        {#if supplier.tags.length > 0}
          <CustomerTagBadges tags={supplier.tags} />
        {/if}
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
