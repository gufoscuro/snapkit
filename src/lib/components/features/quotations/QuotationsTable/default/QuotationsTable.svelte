<!--
  @component QuotationsTable
  @description Displays a paginated table of quotations with load more functionality.
  Shows document number (linked to details), customer, status, document date,
  validity period, currency, net value and incoterm.
  Consumes filter state from page context to filter displayed data.
  @keywords quotations, table, list, pagination, load-more, filters, sales
  @uses ResourceTable
  @api GET /api/legal-entities/{legalEntity}/quotations -> Quotation[]
  @api DELETE /api/legal-entities/{legalEntity}/quotations/{quotation}
  @route quotation-details
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { QuotationsTableContract as contract } from './QuotationsTable.contract.js'
</script>

<script lang="ts">
  import { ResourceTable } from '$lib/components/core/ResourceTable'
  import type { ColumnConfig } from '$lib/components/core/ResourceTable/types'
  import QuotationTagBadges from '$lib/components/features/quotations/QuotationTagBadges.svelte'
  import { useConsumes } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages.js'
  import type { Quotation } from '$lib/types/api-types'
  import { getQuotationStatusLabel } from '$lib/utils/enum-labels'
  import type { FilterQuery } from '$lib/utils/filters'
  import { createArchiveAction } from '$lib/utils/table-actions'
  import { createApiFetcher } from '$lib/utils/table-fetchers'
  import { createRoute } from '$utils/route-builder.js'
  import type { SnippetProps } from '$utils/runtime'
  import { QuotationsTableContract } from './QuotationsTable.contract.js'

  let { legalEntity }: SnippetProps = $props()

  const filtersHandle = useConsumes(QuotationsTableContract, 'filters')
  const filters = $derived(filtersHandle.get() as FilterQuery | undefined)

  const columns: ColumnConfig<Quotation>[] = [
    {
      accessorKey: 'state',
      header: '',
      renderer: 'state-indicator',
      rendererConfig: {
        variantMapper: (state: Quotation['state']) => {
          if (state === 'approved') return 'success'
          if (state === 'rejected') return 'error'
          return 'default'
        },
        labelMapper: (state: Quotation['state']) => getQuotationStatusLabel(state),
      },
      meta: { cellClassName: 'w-10 px-0' },
    },
    {
      accessorKey: 'document_number',
      header: m.document_number(),
      renderer: 'link',
      rendererConfig: {
        urlBuilder: row => createRoute({ $id: 'quotation-details', params: { uuid: row.id } }),
      },
    },
    {
      accessorKey: 'customer_snapshot',
      header: m.customer(),
      renderer: 'custom',
      rendererConfig: {
        cellRenderer: (row: Quotation) => {
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
      accessorKey: 'document_date',
      header: m.document_date(),
      renderer: 'date',
    },
    {
      accessorKey: 'valid_to',
      header: m.valid_to(),
      renderer: 'date',
    },
    {
      accessorKey: 'net_value',
      header: m.net_total(),
      renderer: 'currency',
      rendererConfig: {
        currencyAccessor: (row: Quotation) => row.currency,
      },
    },
    {
      accessorKey: 'tags',
      header: '',
      renderer: 'badges',
      rendererConfig: {
        component: QuotationTagBadges,
      },
    },
    {
      header: '',
      renderer: 'actions',
      rendererConfig: {
        actions: [
          createArchiveAction<Quotation>({
            apiUrl: quotation => `/legal-entities/${legalEntity?.id}/quotations/${quotation.id}`,
            confirmMessage: quotation => m.archive_quotation_confirmation({ name: quotation.document_number }),
            successMessage: quotation => m.quotation_archived_success({ name: quotation.document_number }),
            errorMessage: m.quotation_archive_error(),
          }),
        ],
      },
      meta: { cellClassName: 'p-0 h-10 w-12' },
    },
  ]

  const quotationApiUrl = $derived(legalEntity?.id ? `/legal-entities/${legalEntity.id}/quotations` : null)
  const fetchQuotations = $derived(quotationApiUrl ? createApiFetcher<Quotation>(quotationApiUrl) : null)
</script>

{#if legalEntity && fetchQuotations}
  <ResourceTable {columns} fetchFunction={fetchQuotations} {filters} columnsStorageId="quotation-table" />
{/if}
