<!--
  @component TransportDocumentsFilters
  @description Filter component for the transport-documents (DDT) listing. Exposes
  search plus state (multi-select), invoicing-status, customer and incoterm filters
  via FilterDropdown. Includes a primary "Nuovo DDT" CTA on the right.
  Provides filter state consumable by TransportDocumentsTable.
  @keywords filter, search, transport-documents, ddt, common
  @uses GenericFilters
  @provides filters
-->

<script lang="ts" module>
  export { GenericFiltersContract as contract } from '../GenericFilters/default/GenericFilters.contract.js'
</script>

<script lang="ts">
  import GenericFilters from '$components/features/common/GenericFilters/default/GenericFilters.svelte'
  import Button from '$components/ui/button/button.svelte'
  import { usePageChat } from '$lib/chat/hooks/usePageChat'
  import { makeFilterChatRegistration } from '$lib/chat/page-tools/filter-registration'
  import * as m from '$lib/paraglide/messages'
  import type { CustomerSummary } from '$lib/types/api-types'
  import {
    configToSelectItems,
    incotermLabels,
    toSelectItems,
    transportDocumentInvoicingStatusConfig,
    transportDocumentStateConfig,
  } from '$lib/utils/enum-labels'
  import {
    createQueryRequestObject,
    type FilterConfig,
    type FilterOption,
    type PaginatedResponse,
  } from '$lib/utils/filters'
  import { api } from '$lib/utils/request'
  import { createRoute } from '$utils/route-builder.js'
  import type { SnippetProps } from '$utils/runtime'

  const props: SnippetProps = $props()

  const legalEntityId = $derived(props.legalEntity?.id)

  async function fetchCustomers(search: string): Promise<FilterOption[]> {
    if (!legalEntityId) return []
    const params = createQueryRequestObject({ search })
    const res = await api.get<PaginatedResponse<CustomerSummary>>(`/legal-entities/${legalEntityId}/customers`, {
      queryParams: params,
    })
    return res.data.map(c => ({ value: c.id as string, label: c.name }))
  }

  const config: FilterConfig = {
    customer_id: {
      type: 'customer',
      label: m.customer(),
      fetchFunction: fetchCustomers,
    },
    state: {
      type: 'tags',
      label: m.filters_state(),
      options: configToSelectItems(transportDocumentStateConfig),
    },
    invoicing_status: {
      type: 'enum',
      label: m.invoicing_status(),
      options: configToSelectItems(transportDocumentInvoicingStatusConfig),
    },
    incoterm: {
      type: 'enum',
      label: m.incoterm(),
      options: toSelectItems(incotermLabels),
    },
  }

  usePageChat(
    makeFilterChatRegistration({
      id: 'transport-documents-filter',
      toolName: 'filter_transport_documents',
      resourceLabel: 'transport documents (DDT)',
      config,
    }),
  )
</script>

<GenericFilters {...props} {config}>
  <Button variant="default" href={createRoute({ $id: 'transport-document-details' })}>
    {m.add_new_transport_document()}
  </Button>
</GenericFilters>
