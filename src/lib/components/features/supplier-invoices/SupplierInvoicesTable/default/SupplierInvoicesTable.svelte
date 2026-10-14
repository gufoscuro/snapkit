<!--
  @component SupplierInvoicesTable
  @description Paginated list of received invoices (fatture passive from SDI).
  Each row stacks document number (linked to the detail) over the supplier —
  or the cedente name while still to link — then document type, date, status
  (Da agganciare / Nuova / Vista), anomaly badges (quarantine, possible
  duplicate, due dates to review / mismatch), payment status and net payable.
  Consumes filter state from page context and publishes the CSV export.
  @keywords supplier invoices, received invoices, fatture ricevute, passive, table, list, fatturapa, sdi
  @uses ResourceTable, RecordCustomerCell, SupplierInvoiceStatusBadge, SupplierInvoiceFlagBadges, InvoicePaymentStatusBadge
  @api GET /api/legal-entities/{legalEntity}/supplier-invoices -> SupplierInvoice[]
  @route supplier-invoice-details
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { SupplierInvoicesTableContract as contract } from './SupplierInvoicesTable.contract.js'
</script>

<script lang="ts">
  import { ResourceTable } from '$lib/components/core/ResourceTable'
  import type { ColumnConfig } from '$lib/components/core/ResourceTable/types'
  import RecordCustomerCell from '$lib/components/features/common/RecordCustomerCell.svelte'
  import InvoicePaymentStatusBadge from '$lib/components/features/invoices/InvoicePaymentStatusBadge.svelte'
  import { cedenteName } from '$lib/components/features/supplier-invoices/supplier-invoice-actions'
  import SupplierInvoiceFlagBadges from '$lib/components/features/supplier-invoices/SupplierInvoiceFlagBadges.svelte'
  import SupplierInvoiceStatusBadge from '$lib/components/features/supplier-invoices/SupplierInvoiceStatusBadge.svelte'
  import { useConsumes } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages.js'
  import type { SupplierInvoice } from '$lib/types/api-types'
  import { getSupplierInvoiceDocumentTypeLabel } from '$lib/utils/enum-labels'
  import type { FilterQuery } from '$lib/utils/filters'
  import { useTableExport } from '$lib/utils/table-export.svelte'
  import { createApiFetcher } from '$lib/utils/table-fetchers'
  import { createRoute } from '$utils/route-builder.js'
  import type { SnippetProps } from '$utils/runtime'
  import { SupplierInvoicesTableContract } from './SupplierInvoicesTable.contract.js'

  let { legalEntity }: SnippetProps = $props()

  const filtersHandle = useConsumes(SupplierInvoicesTableContract, 'filters')
  const filters = $derived(filtersHandle.get() as FilterQuery | undefined)

  const columns: ColumnConfig<SupplierInvoice>[] = [
    {
      // While to link there is no supplier yet: show who sent it (the cedente).
      accessorKey: 'document_number',
      header: m.document_number(),
      renderer: 'component',
      rendererConfig: {
        component: RecordCustomerCell,
        propsMapper: (row: SupplierInvoice) => ({
          code: row.document_number,
          customerName: row.supplier?.name || cedenteName(row.cedente_snapshot),
          href: createRoute({ $id: 'supplier-invoice-details', params: { uuid: row.id } }),
        }),
      },
    },
    {
      accessorKey: 'document_type',
      header: m.document_type(),
      renderer: 'badge',
      rendererConfig: {
        variantMapper: () => 'outline',
        labelMapper: (type: SupplierInvoice['document_type']) => getSupplierInvoiceDocumentTypeLabel(type),
      },
    },
    {
      accessorKey: 'document_date',
      header: m.document_date(),
      renderer: 'date',
    },
    {
      accessorKey: 'status',
      header: m.status(),
      renderer: 'component',
      rendererConfig: {
        component: SupplierInvoiceStatusBadge,
        propsMapper: (row: SupplierInvoice) => ({ status: row.status }),
      },
    },
    {
      accessorKey: 'is_quarantined',
      header: m.supplier_invoice_anomalies(),
      renderer: 'component',
      rendererConfig: {
        component: SupplierInvoiceFlagBadges,
        propsMapper: (row: SupplierInvoice) => ({
          quarantined: row.is_quarantined,
          possibleDuplicate: row.is_possible_duplicate,
          dueDatesNeedReview: row.due_dates_need_review,
          dueDatesMismatch: row.due_dates_mismatch,
        }),
      },
    },
    {
      accessorKey: 'payment_status',
      header: m.payment_status(),
      renderer: 'component',
      rendererConfig: {
        component: InvoicePaymentStatusBadge,
        propsMapper: (row: SupplierInvoice) => ({ status: row.payment_status, payable: true }),
      },
    },
    {
      accessorKey: 'net_payable',
      header: m.net_payable(),
      renderer: 'currency',
      rendererConfig: {
        currencyAccessor: (row: SupplierInvoice) => row.currency,
      },
    },
  ]

  const apiUrl = $derived(legalEntity?.id ? `/legal-entities/${legalEntity.id}/supplier-invoices` : null)
  const fetchSupplierInvoices = $derived(apiUrl ? createApiFetcher<SupplierInvoice>(apiUrl) : null)

  // Publishes the CSV export to the sibling filters component (page-state channel).
  useTableExport(SupplierInvoicesTableContract, () => fetchSupplierInvoices)
</script>

{#if legalEntity && fetchSupplierInvoices}
  <ResourceTable {columns} fetchFunction={fetchSupplierInvoices} {filters} columnsStorageId="supplier-invoices-table" />
{/if}
