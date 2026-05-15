<!--
  @component InvoiceableDocumentsFilters
  @description A filter component for the invoiceable-documents listing.
  Exposes search, customer, date range, sales transaction type and document type
  filters via FilterDropdown. The document_type filter is not yet supported by the
  backend and is currently UI-only (TODO: wire when backend exposes the query param).
  Provides filter state consumable by InvoiceableDocumentsTable.
  @keywords filter, search, invoiceable-documents, invoicing, to-invoice, common
  @uses GenericFilters
  @provides filters
-->

<script lang="ts" module>
  export { GenericFiltersContract as contract } from '../GenericFilters/default/GenericFilters.contract.js'
</script>

<script lang="ts">
  import GenericFilters from '$components/features/common/GenericFilters/default/GenericFilters.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { CustomerSummary, InvoiceableDocumentType } from '$lib/types/api-types'
  import {
    createQueryRequestObject,
    type FilterConfig,
    type FilterOption,
    type PaginatedResponse,
  } from '$lib/utils/filters'
  import { api } from '$lib/utils/request'
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

  const documentTypeOptions: { value: InvoiceableDocumentType; label: string }[] = [
    { value: 'order_advance', label: m.enum_invoiceable_document_type_order_advance() },
    { value: 'transport_document', label: m.enum_invoiceable_document_type_transport_document() },
    { value: 'direct_order', label: m.enum_invoiceable_document_type_direct_order() },
  ]

  const config: FilterConfig = {
    customer_id: {
      type: 'customer',
      label: m.customer(),
      fetchFunction: fetchCustomers,
    },
    date_from: {
      type: 'date',
      label: m.date_from(),
      dayBoundary: 'startOf',
    },
    date_to: {
      type: 'date',
      label: m.date_to(),
      dayBoundary: 'endOf',
    },
    type: {
      type: 'tags',
      label: m.document_type(),
      options: documentTypeOptions,
    },
  }
</script>

<GenericFilters {...props} {config} />
