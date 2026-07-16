<!--
  @component InvoicesTable
  @description Displays a paginated table of invoices (FatturaPA) with load more.
  Shows state badge, document number (linked to details), customer, document type,
  total amount and document date. Consumes filter state from page context.
  @keywords invoices, table, list, pagination, load-more, fatturapa, billing
  @uses ResourceTable
  @api GET /api/legal-entities/{legalEntity}/invoices -> Invoice[]
  @api DELETE /api/legal-entities/{legalEntity}/invoices/{invoice}
  @route invoice-details
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { InvoicesTableContract as contract } from './InvoicesTable.contract.js'
</script>

<script lang="ts">
  import { ResourceTable } from '$lib/components/core/ResourceTable'
  import type { ColumnConfig } from '$lib/components/core/ResourceTable/types'
  import InvoiceStateBadge from '$lib/components/features/invoices/InvoiceStateBadge.svelte'
  import { useConsumes } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages.js'
  import type { Invoice, InvoiceState } from '$lib/types/api-types'
  import { getInvoiceDocumentTypeLabel } from '$lib/utils/enum-labels'
  import type { FilterQuery } from '$lib/utils/filters'
  import { createArchiveAction } from '$lib/utils/table-actions'
  import { createApiFetcher } from '$lib/utils/table-fetchers'
  import { createRoute } from '$utils/route-builder.js'
  import type { SnippetProps } from '$utils/runtime'
  import { InvoicesTableContract } from './InvoicesTable.contract.js'

  let { legalEntity }: SnippetProps = $props()

  const filtersHandle = useConsumes(InvoicesTableContract, 'filters')
  const filters = $derived(filtersHandle.get() as FilterQuery | undefined)

  const columns: ColumnConfig<Invoice>[] = [
    {
      accessorKey: 'document_number',
      header: m.document_number(),
      renderer: 'link',
      rendererConfig: {
        urlBuilder: (row: Invoice) => createRoute({ $id: 'invoice-details', params: { uuid: row.id } }),
      },
    },
    {
      accessorKey: 'customer_snapshot',
      header: m.customer(),
      renderer: 'custom',
      rendererConfig: {
        cellRenderer: (row: Invoice) => {
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
      accessorKey: 'document_type',
      header: m.document_type(),
      renderer: 'badge',
      rendererConfig: {
        variantMapper: () => 'outline',
        labelMapper: (type: Invoice['document_type']) => getInvoiceDocumentTypeLabel(type),
      },
    },
    {
      accessorKey: 'document_date',
      header: m.document_date(),
      renderer: 'date',
    },
    {
      accessorKey: 'state',
      header: m.invoice_state(),
      renderer: 'component',
      rendererConfig: {
        component: InvoiceStateBadge,
        propsMapper: (row: Invoice) => ({ state: row.state as InvoiceState }),
      },
    },
    {
      accessorKey: 'total_amount',
      header: m.total(),
      renderer: 'currency',
      rendererConfig: {
        currencyAccessor: (row: Invoice) => row.currency,
      },
    },
    {
      header: '',
      renderer: 'actions',
      rendererConfig: {
        // Triggers DELETE /invoices/{id} (soft delete). Distinct from the
        // `transition=archive` shown in InvoicesDetails, which is the SDI
        // "rejected escape hatch" that consumes the number. The pre-check
        // reads `is_archivable` from GET /{id}; when the backend rejects
        // (409), the error toast surfaces.
        actions: [
          createArchiveAction<Invoice>({
            apiUrl: row => `/legal-entities/${legalEntity?.id}/invoices/${row.id}`,
            confirmMessage: row => m.invoice_delete_confirmation({ name: row.document_number }),
            successMessage: () => m.invoice_deleted_successfully(),
            errorMessage: m.invoice_action_error(),
          }),
        ],
      },
      meta: { cellClassName: 'p-0 h-10 w-12' },
    },
  ]

  const apiUrl = $derived(legalEntity?.id ? `/legal-entities/${legalEntity.id}/invoices` : null)
  const fetchInvoices = $derived(apiUrl ? createApiFetcher<Invoice>(apiUrl) : null)
</script>

{#if legalEntity && fetchInvoices}
  <ResourceTable {columns} fetchFunction={fetchInvoices} {filters} columnsStorageId="invoices-table" />
{/if}
