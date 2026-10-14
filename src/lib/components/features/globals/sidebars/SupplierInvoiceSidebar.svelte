<!--
  @component SupplierInvoiceSidebar
  @description Sidebar template for a received invoice (fattura ricevuta) and
  its subpages. Shows the document number, the status badge (Da agganciare /
  Nuova / Vista), the supplier — or the cedente while still to link — document
  date and net payable, then the subpage menu (overview, scadenze e pagamenti,
  documenti). Consumes the invoice from page state.
  @keywords sidebar, supplier invoice, received invoice, fattura ricevuta, passive
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { SupplierInvoiceSidebarContract as contract } from './SupplierInvoiceSidebar.contract.js'
</script>

<script lang="ts">
  import { cedenteName } from '$components/features/supplier-invoices/supplier-invoice-actions'
  import SupplierInvoiceStatusBadge from '$components/features/supplier-invoices/SupplierInvoiceStatusBadge.svelte'
  import Skeleton from '$components/ui/skeleton/skeleton.svelte'
  import { useConsumes } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages'
  import type { MenuItem } from '$lib/stores/tenant-config/types'
  import { formatCalendarDay } from '$lib/components/features/supplier-invoices/format'
  import { floatToPriceString } from '$lib/utils/prices'
  import { createRoute } from '$utils/route-builder.js'
  import type { SnippetProps } from '$utils/runtime'
  import SubpageMenuGroup from './SubpageMenuGroup.svelte'
  import SubpageSidebarBase from './SubpageSidebarBase.svelte'
  import { SupplierInvoiceSidebarContract } from './SupplierInvoiceSidebar.contract.js'

  const props: SnippetProps = $props()

  const invoiceHandle = useConsumes(SupplierInvoiceSidebarContract, 'supplierInvoice')
  const invoice = $derived(invoiceHandle.get())

  const counterpart = $derived(invoice ? invoice.supplier?.name || cedenteName(invoice.cedente_snapshot) : '')

  const menuItems = $derived.by((): MenuItem[] => {
    if (!invoice) return []
    const params = { uuid: invoice.id }
    return [
      { type: 'link', label: m.overview(), pageId: 'supplier-invoice-details', params },
      { type: 'link', label: m.due_dates_and_payments(), pageId: 'supplier-invoice-payments', params },
      { type: 'link', label: m.documents(), pageId: 'supplier-invoice-documents', params },
    ]
  })
</script>

<SubpageSidebarBase {...props} fallback={createRoute({ $id: 'supplier-invoices' })}>
  {#if invoice}
    <div class="px-4 pt-2">
      <h2 class="line-clamp-2 text-lg font-semibold" title={invoice.document_number}>
        {invoice.document_number}
      </h2>

      <div class="mt-2 flex flex-wrap items-center gap-1">
        <SupplierInvoiceStatusBadge status={invoice.status} />
      </div>

      {#if counterpart}
        <div class="mt-2 line-clamp-2 text-sm">{counterpart}</div>
      {/if}

      {#if invoice.document_date}
        <div class="mt-1 text-xs text-muted-foreground">
          {m.document_date()}: {formatCalendarDay(invoice.document_date)}
        </div>
      {/if}

      {#if invoice.net_payable}
        <div class="mt-1 text-xs text-muted-foreground">
          {m.net_payable()}: {floatToPriceString(Number(invoice.net_payable) || 0, invoice.currency)}
        </div>
      {/if}
    </div>

    <SubpageMenuGroup name={m.supplier_invoice()} items={menuItems} />
  {:else}
    <div class="flex flex-col gap-1 px-4 pt-2">
      <Skeleton class="h-7 w-3/4" />
      <Skeleton class="h-5 w-1/4" />
      <Skeleton class="mt-1 h-5 w-3/4" />
    </div>
  {/if}
</SubpageSidebarBase>
