<!--
  @component QuotationSidebar
  @description Sidebar template for the quotation pages
  @keywords sidebar
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { QuotationSidebarContract as contract } from './QuotationSidebar.contract.js'
</script>

<script lang="ts">
  import Badge from '$components/ui/badge/badge.svelte'
  import QuotationTagBadges from '$components/features/quotations/QuotationTagBadges.svelte'
  import Skeleton from '$components/ui/skeleton/skeleton.svelte'
  import { useConsumes } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages'
  import type { MenuItem } from '$lib/stores/tenant-config/types'
  import { getQuotationStatusLabel, getQuotationStatusVariant } from '$lib/utils/enum-labels'
  import { createRoute } from '$utils/route-builder.js'
  import type { SnippetProps } from '$utils/runtime'
  import { QuotationSidebarContract } from './QuotationSidebar.contract.js'
  import SubpageMenuGroup from './SubpageMenuGroup.svelte'
  import SubpageSidebarBase from './SubpageSidebarBase.svelte'

  const props: SnippetProps = $props()

  const quotationHandle = useConsumes(QuotationSidebarContract, 'quotation')
  const quotation = $derived(quotationHandle.get())

  const pageMenu = $derived.by(() => {
    if (!quotation)
      return {
        name: m.quotation(),
        items: [],
      }

    const items: MenuItem[] = [
      {
        type: 'link',
        label: m.overview(),
        pageId: 'quotation-details',
        params: { uuid: quotation.id },
      },
      // TODO: uncomment when quotation documents API endpoint is available
      // {
      //   type: 'link',
      //   label: m.documents(),
      //   pageId: 'quotation-documents',
      //   params: { uuid: quotation.id },
      // },
    ]

    return { name: m.quotation(), items }
  })
</script>

<SubpageSidebarBase {...props} fallback={createRoute({ $id: 'quotations' })}>
  {#if !quotation && !props.pageDetails?.params?.uuid}
    <div class="px-4">
      <h2 class="line-clamp-2 text-lg font-semibold">
        {m.new_quotation()}
      </h2>
    </div>
  {:else if quotation}
    <div class="px-4 pt-2">
      <h2 class="line-clamp-2 text-lg font-semibold" title={quotation.document_number}>
        {quotation.document_number}
      </h2>

      <div class="mt-2 flex flex-wrap items-center gap-1">
        <Badge variant={getQuotationStatusVariant(quotation.state)}>
          {getQuotationStatusLabel(quotation.state)}
        </Badge>

        {#if quotation.tags?.length > 0}
          <QuotationTagBadges tags={quotation.tags} />
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
