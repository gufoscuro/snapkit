<!--
  @component TransportDocumentsTable
  @description Displays a paginated table of transport documents (DDT) with load more.
  Shows document number (linked to details), customer, state, type, document date,
  shipping date and invoicing status.
  Consumes filter state from page context to filter displayed data.
  @keywords transport-documents, ddt, table, list, pagination, load-more, filters
  @uses ResourceTable
  @api GET /api/legal-entities/{legalEntity}/transport-documents -> TransportDocument[]
  @api DELETE /api/legal-entities/{legalEntity}/transport-documents/{transportDocument}
  @route transport-document-details
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { TransportDocumentsTableContract as contract } from './TransportDocumentsTable.contract.js'
</script>

<script lang="ts">
  import { ResourceTable } from '$lib/components/core/ResourceTable'
  import type { ColumnConfig } from '$lib/components/core/ResourceTable/types'
  import TransportDocumentInvoicingBadge from '$lib/components/features/transport-documents/TransportDocumentInvoicingBadge.svelte'
  import TransportDocumentTypeBadge from '$lib/components/features/transport-documents/TransportDocumentTypeBadge.svelte'
  import { useConsumes } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages.js'
  import type { TransportDocument } from '$lib/types/api-types'
  import { getTransportDocumentStatusLabel } from '$lib/utils/enum-labels'
  import type { FilterQuery } from '$lib/utils/filters'
  import { createArchiveAction } from '$lib/utils/table-actions'
  import { createApiFetcher } from '$lib/utils/table-fetchers'
  import { createRoute } from '$utils/route-builder.js'
  import type { SnippetProps } from '$utils/runtime'
  import { TransportDocumentsTableContract } from './TransportDocumentsTable.contract.js'

  let { legalEntity }: SnippetProps = $props()

  const filtersHandle = useConsumes(TransportDocumentsTableContract, 'filters')
  const filters = $derived(filtersHandle.get() as FilterQuery | undefined)

  const columns: ColumnConfig<TransportDocument>[] = [
    {
      accessorKey: 'state',
      header: '',
      renderer: 'state-indicator',
      rendererConfig: {
        variantMapper: (state: TransportDocument['state']) => {
          if (state === 'carried') return 'success'
          return 'default'
        },
        labelMapper: (state: TransportDocument['state']) => getTransportDocumentStatusLabel(state),
      },
      meta: { cellClassName: 'w-10 px-0' },
    },
    {
      accessorKey: 'document_number',
      header: m.document_number(),
      renderer: 'link',
      rendererConfig: {
        urlBuilder: (row: TransportDocument) =>
          createRoute({ $id: 'transport-document-details', params: { uuid: row.id } }),
      },
    },
    {
      accessorKey: 'customer_snapshot',
      header: m.customer(),
      renderer: 'custom',
      rendererConfig: {
        cellRenderer: (row: TransportDocument) => {
          const snapshot = row.customer_snapshot
          if (Array.isArray(snapshot) && snapshot.length > 0) {
            return ((snapshot[0] as Record<string, unknown>)?.name as string) ?? '-'
          }
          if (snapshot && !Array.isArray(snapshot)) {
            return ((snapshot as Record<string, unknown>)?.name as string) ?? '-'
          }
          return '-'
        },
      },
    },
    {
      accessorKey: 'transport_document_type',
      header: m.transport_document_type(),
      renderer: 'component',
      rendererConfig: {
        component: TransportDocumentTypeBadge,
        propsMapper: (row: TransportDocument) => ({ type: row.transport_document_type }),
      },
    },
    {
      accessorKey: 'document_date',
      header: m.document_date(),
      renderer: 'date',
    },
    {
      accessorKey: 'shipping_date',
      header: m.shipping_date(),
      renderer: 'date',
    },
    {
      accessorKey: 'invoicing_status',
      header: m.invoicing_status(),
      renderer: 'component',
      rendererConfig: {
        component: TransportDocumentInvoicingBadge,
        propsMapper: (row: TransportDocument) => ({ invoicingStatus: row.invoicing_status }),
      },
    },
    {
      header: '',
      renderer: 'actions',
      rendererConfig: {
        actions: [
          createArchiveAction<TransportDocument>({
            apiUrl: doc => `/legal-entities/${legalEntity?.id}/transport-documents/${doc.id}`,
            confirmMessage: doc => m.archive_transport_document_confirmation({ name: doc.document_number }),
            successMessage: doc => m.transport_document_archived_success({ name: doc.document_number }),
            errorMessage: m.transport_document_archive_error(),
          }),
        ],
      },
      meta: { cellClassName: 'p-0 h-10 w-12' },
    },
  ]

  const transportDocumentApiUrl = $derived(
    legalEntity?.id ? `/legal-entities/${legalEntity.id}/transport-documents` : null,
  )
  const fetchTransportDocuments = $derived(
    transportDocumentApiUrl ? createApiFetcher<TransportDocument>(transportDocumentApiUrl) : null,
  )
</script>

{#if legalEntity && fetchTransportDocuments}
  <ResourceTable
    {columns}
    fetchFunction={fetchTransportDocuments}
    {filters}
    columnsStorageId="transport-document-table" />
{/if}
