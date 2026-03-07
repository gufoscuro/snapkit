<!--
  @component PaymentTermsTable
  @description Displays a paginated table of payment terms with load more functionality.
  Shows code, name, description, and active status.
  Consumes filter state from page context to filter displayed data.
  @keywords payment-terms, table, list, pagination, load-more, filters, settings
  @uses ResourceTable
  @api GET /api/legal-entities/{legalEntity}/payment-terms (Moddo API) -> PaymentTerm[]
  @api DELETE /api/legal-entities/{legalEntity}/payment-terms/{paymentTerm} (Moddo API)
-->
<script lang="ts" module>
  export { PaymentTermsTableContract as contract } from './PaymentTermsTable.contract.js'
</script>

<script lang="ts">
  import { ResourceTable } from '$lib/components/core/ResourceTable'
  import type { ColumnConfig } from '$lib/components/core/ResourceTable/types'
  import { useConsumes } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages.js'
  import type { PaymentTerm } from '$lib/types/api-types'
  import type { FilterQuery } from '$lib/utils/filters'
  import { createArchiveAction } from '$lib/utils/table-actions'
  import { createApiFetcher } from '$lib/utils/table-fetchers'
  import type { SnippetProps } from '$utils/runtime'
  import { PaymentTermsTableContract } from './PaymentTermsTable.contract.js'

  let { legalEntity }: SnippetProps = $props()

  const filtersHandle = useConsumes(PaymentTermsTableContract, 'filters')
  const filters = $derived(filtersHandle.get() as FilterQuery | undefined)

  const columns: ColumnConfig<PaymentTerm>[] = [
    {
      accessorKey: 'code',
      header: m.code(),
      renderer: 'link',
      rendererConfig: {
        urlBuilder: (row) => `/settings/payment-terms/upsert/${row.id}`,
      },
    },
    {
      accessorKey: 'name',
      header: m.name(),
      renderer: 'text',
    },
    {
      accessorKey: 'description',
      header: m.description(),
      renderer: 'text',
    },
    {
      header: '',
      renderer: 'actions',
      rendererConfig: {
        actions: [
          createArchiveAction({
            apiUrl: (pt) => `/legal-entities/${legalEntity?.id}/payment-terms/${pt.id}`,
            confirmMessage: (pt) => m.archive_payment_term_confirmation({ name: pt.name }),
            successMessage: (pt) => m.payment_term_archived_success({ name: pt.name }),
            errorMessage: m.payment_term_archive_error(),
          }),
        ],
      },
      meta: { cellClassName: 'p-0 h-10 w-12' },
    },
  ]

  const apiUrl = $derived(
    legalEntity?.id ? `/legal-entities/${legalEntity.id}/payment-terms` : null
  )
  const fetchPaymentTerms = $derived(
    apiUrl ? createApiFetcher<PaymentTerm>(apiUrl) : null
  )
</script>

{#if legalEntity && fetchPaymentTerms}
  <ResourceTable {columns} fetchFunction={fetchPaymentTerms} {filters} />
{/if}
