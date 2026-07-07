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
  import { usePageChat } from '$lib/chat/hooks/usePageChat'
  import { invoicesFilterChatRegistration } from '$lib/chat/page-tools/invoices-filter'
  import * as m from '$lib/paraglide/messages'
  import type { CustomerSummary, InvoicePaymentStatus, InvoiceState } from '$lib/types/api-types'
  import { invoicePaymentStatusLabels, invoiceStateLabels } from '$lib/utils/enum-labels'
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

  usePageChat(invoicesFilterChatRegistration)

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

  const paymentStatusOptions: { value: InvoicePaymentStatus; label: string }[] = (
    Object.keys(invoicePaymentStatusLabels) as InvoicePaymentStatus[]
  ).map(value => ({ value, label: invoicePaymentStatusLabels[value]() }))

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
    // Single-select: the backend matches one status and never returns schedule-less
    // invoices (TD04 / pre-feature) for any payment_status value.
    payment_status: {
      type: 'enum',
      label: m.payment_status(),
      options: paymentStatusOptions,
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
