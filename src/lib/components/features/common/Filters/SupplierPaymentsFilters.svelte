<!--
  @component SupplierPaymentsFilters
  @description Filter component for the "Da pagare" listing (open supplier
  invoice due dates). Exposes search, supplier, payment status, currency and
  due-date range via FilterDropdown. `currency` and the due-date bounds are
  also what the "Da pagare" homepage KPI deep-links with.
  Provides filter state consumable by SupplierPaymentsTable.
  @keywords filter, search, payments, due-dates, payables, to pay, da pagare, supplier, common
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
  import { currencyLabels, supplierPaymentStatusLabels, toSelectItems } from '$lib/utils/enum-labels'
  import type { FilterConfig } from '$lib/utils/filters'
  import type { SnippetProps } from '$utils/runtime'

  const props: SnippetProps = $props()

  const legalEntityId = $derived(props.legalEntity?.id)

  const config: FilterConfig = {
    supplier_id: {
      type: 'customer',
      label: m.supplier(),
      fetchFunction: search => fetchSupplierFilterOptions(legalEntityId, search),
    },
    // Unset = open scadenze only (backend default); pick "Pagata" to see history.
    payment_status: {
      type: 'enum',
      label: m.payment_status(),
      options: toSelectItems(supplierPaymentStatusLabels),
    },
    currency: {
      type: 'enum',
      label: m.currency(),
      options: toSelectItems(currencyLabels),
    },
    due_date_from: {
      type: 'date',
      label: m.date_from(),
      dayBoundary: 'startOf',
    },
    due_date_to: {
      type: 'date',
      label: m.date_to(),
      dayBoundary: 'endOf',
    },
  }
</script>

<GenericFilters {...props} {config} />
