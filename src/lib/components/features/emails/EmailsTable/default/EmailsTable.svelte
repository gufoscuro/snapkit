<!--
  @component EmailsTable
  @description Displays a paginated table of emails with load more functionality.
  Shows email label, email address, display name, and reply-to.
  Consumes filter state from page context to filter displayed data.
  @keywords emails, table, list, pagination, load-more, filters, settings
  @uses ResourceTable
  @api GET /api/legal-entities/{legalEntity}/emails (Moddo API) -> LegalEntityEmail[]
  @api DELETE /api/legal-entities/{legalEntity}/emails/{email} (Moddo API)
-->
<script lang="ts" module>
  export { EmailsTableContract as contract } from './EmailsTable.contract.js'
</script>

<script lang="ts">
  import { ResourceTable } from '$lib/components/core/ResourceTable'
  import type { ColumnConfig } from '$lib/components/core/ResourceTable/types'
  import { useConsumes } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages.js'
  import type { LegalEntityEmail } from '$lib/types/api-types'
  import type { FilterQuery } from '$lib/utils/filters'
  import { createArchiveAction } from '$lib/utils/table-actions'
  import { createApiFetcher } from '$lib/utils/table-fetchers'
  import type { SnippetProps } from '$utils/runtime'
  import { EmailsTableContract } from './EmailsTable.contract.js'

  let { legalEntity }: SnippetProps = $props()

  const filtersHandle = useConsumes(EmailsTableContract, 'filters')
  const filters = $derived(filtersHandle.get() as FilterQuery | undefined)

  const columns: ColumnConfig<LegalEntityEmail>[] = [
    {
      accessorKey: 'label',
      header: m.email_label(),
      renderer: 'link',
      rendererConfig: {
        urlBuilder: (row) => `/settings/emails/upsert/${row.id}`,
      },
    },
    {
      accessorKey: 'email',
      header: m.email(),
      renderer: 'text',
    },
    {
      accessorKey: 'display_name',
      header: m.email_display_name(),
      renderer: 'text',
    },
    {
      accessorKey: 'reply_to',
      header: m.email_reply_to(),
      renderer: 'text',
    },
    {
      header: '',
      renderer: 'actions',
      rendererConfig: {
        actions: [
          createArchiveAction({
            apiUrl: (email) => `/legal-entities/${legalEntity?.id}/emails/${email.id}`,
            confirmMessage: (email) => m.archive_email_confirmation({ label: email.label }),
            successMessage: (email) => m.email_archived_success({ label: email.label }),
            errorMessage: m.email_archive_error(),
          }),
        ],
      },
      meta: { cellClassName: 'p-0 h-10 w-12' },
    },
  ]

  const emailsApiUrl = $derived(
    legalEntity?.id ? `/legal-entities/${legalEntity.id}/emails` : null
  )
  const fetchEmails = $derived(
    emailsApiUrl ? createApiFetcher<LegalEntityEmail>(emailsApiUrl) : null
  )
</script>

{#if legalEntity && fetchEmails}
  <ResourceTable {columns} fetchFunction={fetchEmails} {filters} />
{/if}
