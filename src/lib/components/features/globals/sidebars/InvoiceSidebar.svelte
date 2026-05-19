<!--
  @component InvoiceSidebar
  @description Sidebar template for the invoice detail page. In create mode
  (no record yet) shows the "Nuova fattura" header. When an invoice is provided
  (e.g. after a successful create that doesn't redirect away), shows the
  document number, the SDI status badge and a summary of currency + total.
  @keywords sidebar, invoice, fatturapa
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { InvoiceSidebarContract as contract } from './InvoiceSidebar.contract.js'
</script>

<script lang="ts">
  import InvoiceStateBadge from '$components/features/invoices/InvoiceStateBadge.svelte'
  import Skeleton from '$components/ui/skeleton/skeleton.svelte'
  import { useConsumes } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages'
  import type { MenuItem } from '$lib/stores/tenant-config/types'
  import type { InvoiceState } from '$lib/types/api-types'
  import { floatToPriceString } from '$lib/utils/prices'
  import { createRoute } from '$utils/route-builder.js'
  import type { SnippetProps } from '$utils/runtime'
  import { InvoiceSidebarContract } from './InvoiceSidebar.contract.js'
  import SubpageMenuGroup from './SubpageMenuGroup.svelte'
  import SubpageSidebarBase from './SubpageSidebarBase.svelte'

  const props: SnippetProps = $props()

  const invoiceHandle = useConsumes(InvoiceSidebarContract, 'invoice')
  const invoice = $derived(invoiceHandle.get())

  const documentDateLabel = $derived.by(() => {
    if (!invoice?.document_date) return null
    const date = new Date(invoice.document_date)
    if (isNaN(date.getTime())) return null
    return date.toLocaleDateString()
  })

  const pageMenu = $derived.by(() => {
    if (!invoice) return { name: m.invoice(), items: [] }
    const items: MenuItem[] = [
      {
        type: 'link',
        label: m.overview(),
        pageId: 'invoice-details',
        params: { uuid: invoice.id },
      },
    ]
    return { name: m.invoice(), items }
  })
</script>

<SubpageSidebarBase {...props} fallback={createRoute({ $id: 'to-invoice' })}>
  {#if !invoice && !props.pageDetails?.params?.uuid}
    <div class="px-4">
      <h2 class="line-clamp-2 text-lg font-semibold">
        {m.new_invoice()}
      </h2>
    </div>
  {:else if invoice}
    <div class="px-4 pt-2">
      <h2 class="line-clamp-2 text-lg font-semibold" title={invoice.document_number}>
        {invoice.document_number}
      </h2>

      <div class="mt-2 flex flex-wrap items-center gap-1">
        <InvoiceStateBadge state={invoice.state as InvoiceState} />
      </div>

      {#if documentDateLabel}
        <div class="mt-2 text-xs text-muted-foreground">
          {m.document_date()}: {documentDateLabel}
        </div>
      {/if}

      {#if invoice.total_amount}
        <div class="mt-1 text-xs text-muted-foreground">
          {m.total()}: {floatToPriceString(invoice.total_amount, invoice.currency)}
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
