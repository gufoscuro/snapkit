<!--
  @component TransportDocumentSidebar
  @description Sidebar template for the transport document (DDT) pages.
  Shows the document number with state, type and invoicing badges,
  plus the carried-on date when available.
  @keywords sidebar, transport-document, ddt
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { TransportDocumentSidebarContract as contract } from './TransportDocumentSidebar.contract.js'
</script>

<script lang="ts">
  import TransportDocumentInvoicingBadge from '$components/features/transport-documents/TransportDocumentInvoicingBadge.svelte'
  import TransportDocumentStatusBadge from '$components/features/transport-documents/TransportDocumentStatusBadge.svelte'
  import TransportDocumentTypeBadge from '$components/features/transport-documents/TransportDocumentTypeBadge.svelte'
  import Skeleton from '$components/ui/skeleton/skeleton.svelte'
  import { useConsumes } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages'
  import type { MenuItem } from '$lib/stores/tenant-config/types'
  import type { TransportDocumentType } from '$lib/types/api-types'
  import { createRoute } from '$utils/route-builder.js'
  import type { SnippetProps } from '$utils/runtime'
  import { TransportDocumentSidebarContract } from './TransportDocumentSidebar.contract.js'
  import SubpageMenuGroup from './SubpageMenuGroup.svelte'
  import SubpageSidebarBase from './SubpageSidebarBase.svelte'

  const props: SnippetProps = $props()

  const transportDocumentHandle = useConsumes(TransportDocumentSidebarContract, 'transportDocument')
  const transportDocument = $derived(transportDocumentHandle.get())

  const carriedOnLabel = $derived.by(() => {
    if (!transportDocument?.carried_at) return null
    const date = new Date(transportDocument.carried_at)
    if (isNaN(date.getTime())) return null
    return date.toLocaleDateString()
  })

  const pageMenu = $derived.by(() => {
    if (!transportDocument)
      return {
        name: m.transport_document(),
        items: [],
      }

    const items: MenuItem[] = [
      {
        type: 'link',
        label: m.overview(),
        pageId: 'transport-document-details',
        params: { uuid: transportDocument.id },
      },
    ]

    return { name: m.transport_document(), items }
  })
</script>

<SubpageSidebarBase {...props} fallback={createRoute({ $id: 'transport-documents' })}>
  {#if !transportDocument && !props.pageDetails?.params?.uuid}
    <div class="px-4">
      <h2 class="line-clamp-2 text-lg font-semibold">
        {m.new_transport_document()}
      </h2>
    </div>
  {:else if transportDocument}
    <div class="px-4 pt-2">
      <h2 class="line-clamp-2 text-lg font-semibold" title={transportDocument.document_number}>
        {transportDocument.document_number}
      </h2>

      <div class="mt-2 flex flex-wrap items-center gap-1">
        <TransportDocumentStatusBadge state={transportDocument.state} />

        {#if transportDocument.transport_document_type}
          <TransportDocumentTypeBadge type={transportDocument.transport_document_type as TransportDocumentType} />
        {/if}

        <TransportDocumentInvoicingBadge invoicingStatus={transportDocument.invoicing_status} />
      </div>

      {#if carriedOnLabel}
        <div class="mt-2 text-xs text-muted-foreground">
          {m.carried_on()}: {carriedOnLabel}
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
