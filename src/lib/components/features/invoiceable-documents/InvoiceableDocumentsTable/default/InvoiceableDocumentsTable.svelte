<!--
  @component InvoiceableDocumentsTable
  @description Displays a paginated table of documents waiting to be invoiced.
  Aggregates order advances, transport documents and direct orders from
  GET /invoiceable-documents. Shows source document number (linked to the source
  document detail), document date, customer, document type, transaction type,
  invoiceable lines count, total and a unified fulfillment/invoicing status.
  Consumes filter state from page context to filter displayed data.
  @keywords invoiceable-documents, table, list, pagination, filters, invoicing, to-invoice
  @uses ResourceTable
  @api GET /api/legal-entities/{legalEntity}/invoiceable-documents -> InvoiceableDocument[]
  @route sales-order-details, transport-document-details
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { InvoiceableDocumentsTableContract as contract } from './InvoiceableDocumentsTable.contract.js'
</script>

<script lang="ts">
  import { goto } from '$app/navigation'
  import { ResourceTable } from '$lib/components/core/ResourceTable'
  import type { ColumnConfig } from '$lib/components/core/ResourceTable/types'
  import { useConsumes } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages.js'
  import type { InvoiceableDocument } from '$lib/types/api-types'
  import { getInvoiceableDocumentTypeLabel, salesTransactionTypeLabels } from '$lib/utils/enum-labels'
  import type { FilterQuery } from '$lib/utils/filters'
  import { createApiFetcher } from '$lib/utils/table-fetchers'
  import { createRoute } from '$utils/route-builder.js'
  import type { SnippetProps } from '$utils/runtime'
  import FilePlusIcon from '@lucide/svelte/icons/file-plus'
  import { InvoiceableDocumentsTableContract } from './InvoiceableDocumentsTable.contract.js'

  let { legalEntity }: SnippetProps = $props()

  const filtersHandle = useConsumes(InvoiceableDocumentsTableContract, 'filters')
  const filters = $derived(filtersHandle.get() as FilterQuery | undefined)

  const columns: ColumnConfig<InvoiceableDocument>[] = [
    {
      accessorKey: 'source.document_number',
      header: m.document_number(),
      renderer: 'link',
      rendererConfig: {
        urlBuilder: (row: InvoiceableDocument) =>
          row.source.type === 'sales_order'
            ? createRoute({ $id: 'sales-order-details', params: { uuid: row.source.id } })
            : createRoute({ $id: 'transport-document-details', params: { uuid: row.source.id } }),
      },
    },
    {
      accessorKey: 'source.document_date',
      header: m.document_date(),
      renderer: 'date',
    },
    {
      accessorKey: 'customer_snapshot',
      header: m.customer(),
      renderer: 'custom',
      rendererConfig: {
        cellRenderer: (row: InvoiceableDocument) => {
          const snapshot = row.customer_snapshot as unknown
          if (Array.isArray(snapshot) && snapshot.length > 0) {
            return ((snapshot[0] as Record<string, unknown>)?.name as string) ?? '-'
          }
          if (snapshot && typeof snapshot === 'object') {
            return ((snapshot as Record<string, unknown>).name as string) ?? '-'
          }
          return '-'
        },
      },
    },
    {
      accessorKey: 'type',
      header: m.document_type(),
      renderer: 'badge',
      rendererConfig: {
        variantMapper: () => 'outline',
        labelMapper: (type: InvoiceableDocument['type']) => getInvoiceableDocumentTypeLabel(type),
      },
    },
    {
      accessorKey: 'sales_transaction_type',
      header: m.sales_transaction_type(),
      renderer: 'custom',
      rendererConfig: {
        cellRenderer: (row: InvoiceableDocument) =>
          salesTransactionTypeLabels[row.sales_transaction_type]?.() ?? row.sales_transaction_type,
      },
    },
    {
      accessorKey: 'amount.total',
      header: m.total(),
      renderer: 'currency',
      rendererConfig: {
        currencyAccessor: (row: InvoiceableDocument) => row.currency,
      },
    },
    // Disabled the fullfillment/invoicing status badge for now as it adds complexity that can lead to lack of clarity for users
    // {
    //   accessorKey: 'fulfillment_status',
    //   header: m.status(),
    //   renderer: 'component',
    //   rendererConfig: {
    //     component: InvoiceableDocumentStatusBadge,
    //     propsMapper: (row: InvoiceableDocument) => ({ row }),
    //   },
    // },
    {
      header: '',
      renderer: 'actions',
      rendererConfig: {
        actions: [
          {
            icon: FilePlusIcon,
            variant: 'ghost',
            label: m.invoice_create_from_invoiceable(),
            onClick: (row: InvoiceableDocument) => {
              const url = createRoute({
                $id: 'invoice-details',
                // `slice_position` addresses the specific unpaid slice; the invoice
                // prefill only consumes it for Acconto/SAL sources.
                query: { source_type: row.type, source_id: row.source.id, slice_position: String(row.slice_position) },
              })
              // eslint-disable-next-line svelte/no-navigation-without-resolve
              goto(url)
            },
          },
        ],
      },
      meta: { cellClassName: 'p-0 h-10 w-12' },
    },
  ]

  const apiUrl = $derived(legalEntity?.id ? `/legal-entities/${legalEntity.id}/invoiceable-documents` : null)
  const fetchInvoiceableDocuments = $derived(apiUrl ? createApiFetcher<InvoiceableDocument>(apiUrl) : null)
</script>

{#if legalEntity && fetchInvoiceableDocuments}
  <ResourceTable
    {columns}
    fetchFunction={fetchInvoiceableDocuments}
    {filters}
    columnsStorageId="invoiceable-documents-table" />
{/if}
