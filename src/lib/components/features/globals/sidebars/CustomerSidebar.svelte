<!--
  @component CustomerSidebar
  @description Sidebar template for the customer pages
  @keywords sidebar
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { CustomerSidebarContract as contract } from './CustomerSidebar.contract.js'
</script>

<script lang="ts">
  import Skeleton from '$components/ui/skeleton/skeleton.svelte'
  import StatusBadge from '$lib/components/core/ResourceTable/renderers/StatusBadge.svelte'
  import CustomerTagBadges from '$lib/components/features/customers/CustomerTagBadges.svelte'
  import { useConsumes } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages'
  import type { MenuItem } from '$lib/stores/tenant-config/types'
  import type { Customer } from '$lib/types/api-types.js'
  import { getCustomerCommercialStatusLabel } from '$lib/utils/enum-labels'
  import { createRoute } from '$utils/route-builder.js'
  import type { SnippetProps } from '$utils/runtime'
  import { CustomerSidebarContract } from './CustomerSidebar.contract.js'
  import SubpageMenuGroup from './SubpageMenuGroup.svelte'
  import SubpageSidebarBase from './SubpageSidebarBase.svelte'

  const props: SnippetProps = $props()

  const customerHandle = useConsumes(CustomerSidebarContract, 'customer')
  const customer: Customer | undefined = $derived(customerHandle.get())

  const pageMenu = $derived.by(() => {
    if (!customer)
      return {
        name: m.customer(),
        items: [],
      }

    const items: MenuItem[] = [
      {
        type: 'link',
        label: m.overview(),
        pageId: 'customer-details',
        params: { uuid: customer.id },
      },
      {
        type: 'link',
        label: m.addresses(),
        pageId: 'customer-addresses',
        params: { uuid: customer.id },
      },
      {
        type: 'link',
        label: m.contacts(),
        pageId: 'customer-contacts',
        params: { uuid: customer.id },
      },
      {
        type: 'link',
        label: m.documents(),
        pageId: 'customer-documents',
        params: { uuid: customer.id },
      },
    ]

    return { name: m.customer(), items }
  })
</script>

<SubpageSidebarBase {...props} fallback={createRoute({ $id: 'customers' })}>
  {#if !customer && !props.pageDetails?.params?.uuid}
    <div class="px-4">
      <h2 class="line-clamp-2 text-lg font-semibold">
        {m.add_new_customer()}
      </h2>
    </div>
  {:else if customer}
    <div class="px-4 pt-2">
      <h2 class="line-clamp-2 text-lg font-semibold" title={customer.name}>
        {customer.name}
      </h2>
      <p class="text-sm text-muted-foreground">
        {m.email()}: <a class="font-semibold" href="mailto:{customer.email}">{customer.email}</a>
      </p>
      <p class="text-sm text-muted-foreground">
        {m.phone()}: <a class="font-semibold" href="tel:{customer.phone}">{customer.phone}</a>
      </p>

      <div class="mt-2 flex flex-wrap items-center gap-0.5">
        <StatusBadge
          variant={customer.commercial_status === 'active' ? 'active' : 'in-progress'}
          label={getCustomerCommercialStatusLabel(customer.commercial_status)} />

        {#if customer.tags.length > 0}
          <CustomerTagBadges tags={customer.tags} />
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
