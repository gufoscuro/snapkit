<!--
  @component SupplierInvoicesFilters
  @description Filter component for the received invoices (fatture ricevute)
  listing. Exposes search, supplier, status (multi), document type (multi),
  payment status, document-date range and the anomaly flags (quarantine,
  possible duplicate, due dates to review) via FilterDropdown. No "add" CTA:
  received invoices arrive from SDI, they are never created by hand.
  Provides filter state consumable by SupplierInvoicesTable.
  @keywords filter, search, supplier invoices, received invoices, fatture ricevute, passive, common
  @uses GenericFilters
  @provides filters
-->

<script lang="ts" module>
  export { GenericFiltersContract as contract } from '../GenericFilters/default/GenericFilters.contract.js'
</script>

<script lang="ts">
  import GenericFilters from '$components/features/common/GenericFilters/default/GenericFilters.svelte'
  import { fetchSupplierFilterOptions } from '$components/features/supplier-invoices/supplier-filter-options'
  import * as m from '$lib/paraglide/messages'
  import {
    supplierInvoiceDocumentTypeLabels,
    supplierInvoiceStatusLabels,
    supplierPaymentStatusLabels,
    toSelectItems,
  } from '$lib/utils/enum-labels'
  import type { FilterConfig, FilterOption } from '$lib/utils/filters'
  import type { SnippetProps } from '$utils/runtime'

  const props: SnippetProps = $props()

  const legalEntityId = $derived(props.legalEntity?.id)

  // Boolean query params: Laravel's `boolean` rule accepts 1/0.
  const yesNoOptions: FilterOption[] = [
    { value: '1', label: m.common_yes() },
    { value: '0', label: m.common_no() },
  ]

  const config: FilterConfig = {
    supplier_id: {
      type: 'customer',
      label: m.supplier(),
      fetchFunction: search => fetchSupplierFilterOptions(legalEntityId, search),
    },
    // Multi-select: the backend takes a comma-separated list (the
    // "da gestire" KPI deep-links here with status=to_link,new).
    status: {
      type: 'tags',
      label: m.filters_state(),
      options: toSelectItems(supplierInvoiceStatusLabels),
    },
    document_type: {
      type: 'tags',
      label: m.document_type(),
      options: toSelectItems(supplierInvoiceDocumentTypeLabels),
    },
    payment_status: {
      type: 'enum',
      label: m.payment_status(),
      options: toSelectItems(supplierPaymentStatusLabels),
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
    quarantined: {
      type: 'enum',
      label: m.supplier_invoice_flag_quarantined(),
      options: yesNoOptions,
    },
    possible_duplicate: {
      type: 'enum',
      label: m.supplier_invoice_flag_possible_duplicate(),
      options: yesNoOptions,
    },
    due_dates_need_review: {
      type: 'enum',
      label: m.supplier_invoice_flag_due_dates_need_review(),
      options: yesNoOptions,
    },
  }
</script>

<GenericFilters {...props} {config} />
