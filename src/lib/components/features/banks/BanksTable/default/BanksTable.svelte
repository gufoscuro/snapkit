<!--
  @component BanksTable
  @description Displays a paginated table of banks with load more functionality.
  Shows bank code, name, IBAN, and BIC/SWIFT.
  Consumes filter state from page context to filter displayed data.
  @keywords banks, table, list, pagination, load-more, filters, settings
  @uses ResourceTable
  @api GET /api/legal-entities/{legalEntity}/banks (Moddo API) -> LegalEntityBank[]
  @api DELETE /api/legal-entities/{legalEntity}/banks/{bank} (Moddo API)
-->
<script lang="ts" module>
  export { BanksTableContract as contract } from './BanksTable.contract.js'
</script>

<script lang="ts">
  import { ResourceTable } from '$lib/components/core/ResourceTable'
  import type { ColumnConfig } from '$lib/components/core/ResourceTable/types'
  import { useConsumes } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages.js'
  import type { LegalEntityBank } from '$lib/types/api-types'
  import type { FilterQuery } from '$lib/utils/filters'
  import { createArchiveAction } from '$lib/utils/table-actions'
  import { createApiFetcher } from '$lib/utils/table-fetchers'
  import type { SnippetProps } from '$utils/runtime'
  import { BanksTableContract } from './BanksTable.contract.js'

  let { legalEntity }: SnippetProps = $props()

  const filtersHandle = useConsumes(BanksTableContract, 'filters')
  const filters = $derived(filtersHandle.get() as FilterQuery | undefined)

  const columns: ColumnConfig<LegalEntityBank>[] = [
    {
      accessorKey: 'code',
      header: m.code(),
      renderer: 'link',
      rendererConfig: {
        urlBuilder: (row) => `/settings/banks/upsert/${row.id}`,
      },
    },
    {
      accessorKey: 'name',
      header: m.name(),
      renderer: 'text',
    },
    {
      accessorKey: 'iban',
      header: m.bank_iban(),
      renderer: 'text',
    },
    {
      accessorKey: 'bic_swift',
      header: m.bank_bic_swift(),
      renderer: 'text',
    },
    {
      header: '',
      renderer: 'actions',
      rendererConfig: {
        actions: [
          createArchiveAction({
            apiUrl: (bank) => `/legal-entities/${legalEntity?.id}/banks/${bank.id}`,
            confirmMessage: (bank) => m.archive_bank_confirmation({ name: bank.name }),
            successMessage: (bank) => m.bank_archived_success({ name: bank.name }),
            errorMessage: m.bank_archive_error(),
          }),
        ],
      },
      meta: { cellClassName: 'p-0 h-10 w-12' },
    },
  ]

  const banksApiUrl = $derived(
    legalEntity?.id ? `/legal-entities/${legalEntity.id}/banks` : null
  )
  const fetchBanks = $derived(
    banksApiUrl ? createApiFetcher<LegalEntityBank>(banksApiUrl) : null
  )
</script>

{#if legalEntity && fetchBanks}
  <ResourceTable {columns} fetchFunction={fetchBanks} {filters} />
{/if}
