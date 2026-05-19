<!--
  @component InvoicesFilters
  @description Filter component for the invoices listing.
  Exposes search, customer, state and document-date range filters via
  FilterDropdown. Includes a primary "Nuova fattura" CTA on the right.
  Provides filter state consumable by InvoicesTable.
  @keywords filter, search, invoices, billing, fatturapa, common
  @uses GenericFilters
  @provides filters
-->

<script lang="ts" module>
  export { GenericFiltersContract as contract } from '../GenericFilters/default/GenericFilters.contract.js'
</script>

<script lang="ts">
  import GenericFilters from '$components/features/common/GenericFilters/default/GenericFilters.svelte'
  import Button from '$components/ui/button/button.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { CustomerSummary, InvoiceState } from '$lib/types/api-types'
  import { invoiceStateLabels } from '$lib/utils/enum-labels'
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

  const stateOptions: { value: InvoiceState; label: string }[] = (
    Object.keys(invoiceStateLabels) as InvoiceState[]
  ).map(value => ({ value, label: invoiceStateLabels[value]() }))

  const config: FilterConfig = {
    customer_id: {
      type: 'customer',
      label: m.customer(),
      fetchFunction: fetchCustomers,
    },
    state: {
      type: 'tags',
      label: m.filters_state(),
      options: stateOptions,
    },
    document_date_from: {
      type: 'date',
      label: m.date_from(),
      dayBoundary: 'startOf',
    },
    document_date_to: {
      type: 'date',
      label: m.date_to(),
      dayBoundary: 'endOf',
    },
  }
</script>

<GenericFilters {...props} {config}>
  <Button variant="default" href={createRoute({ $id: 'invoice-details' })}>
    {m.add_new_invoice()}
  </Button>
</GenericFilters>
