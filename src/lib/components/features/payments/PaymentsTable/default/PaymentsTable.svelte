<!--
  @component PaymentsTable
  @description Displays a paginated, cross-invoice list of invoice due dates to be
  collected ("payments to receive"). Shows the due date, source invoice (linked to
  its details), customer, amount, payment method and the parent invoice's state.
  Note: the backend does not track actual cash arrival, so this is the schedule of
  outstanding due dates of issued invoices, not a paid/unpaid ledger. Consumes filter
  state from page context.
  @keywords payments, due-dates, to-collect, receivables, invoices, table, list
  @uses ResourceTable, InvoiceStateBadge
  @api GET /api/legal-entities/{legalEntity}/invoice-due-dates -> InvoiceDueDate[]
  @route invoice-details
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { PaymentsTableContract as contract } from './PaymentsTable.contract.js'
</script>

<script lang="ts">
  import { ResourceTable } from '$lib/components/core/ResourceTable'
  import type { ColumnConfig } from '$lib/components/core/ResourceTable/types'
  import RecordCustomerCell from '$lib/components/features/common/RecordCustomerCell.svelte'
  import InvoiceStateBadge from '$lib/components/features/invoices/InvoiceStateBadge.svelte'
  import { useConsumes } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages.js'
  import type { InvoiceDueDate, InvoiceState } from '$lib/types/api-types'
  import { getPaymentMethodLabel } from '$lib/utils/enum-labels'
  import type { FilterQuery } from '$lib/utils/filters'
  import { createApiFetcher } from '$lib/utils/table-fetchers'
  import { createRoute } from '$utils/route-builder.js'
  import type { SnippetProps } from '$utils/runtime'
  import { PaymentsTableContract } from './PaymentsTable.contract.js'

  let { legalEntity }: SnippetProps = $props()

  const filtersHandle = useConsumes(PaymentsTableContract, 'filters')
  const filters = $derived(filtersHandle.get() as FilterQuery | undefined)

  const columns: ColumnConfig<InvoiceDueDate>[] = [
    {
      // Invoice number (linked) + customer stacked into one identity column.
      // Enriched invoice fields arrive nested under `invoice` on this list endpoint;
      // the href guards on `invoice` and degrades to plain text if it's ever missing.
      accessorKey: 'invoice.document_number',
      header: m.document_number(),
      renderer: 'component',
      rendererConfig: {
        component: RecordCustomerCell,
        propsMapper: (row: InvoiceDueDate) => ({
          code: row.invoice?.document_number,
          customerName: row.invoice?.customer_name,
          href: row.invoice ? createRoute({ $id: 'invoice-details', params: { uuid: row.invoice.id } }) : undefined,
        }),
      },
    },
    {
      accessorKey: 'due_date',
      header: m.due_date(),
      renderer: 'date',
    },
    {
      accessorKey: 'amount',
      header: m.amount(),
      renderer: 'currency',
    },
    {
      accessorKey: 'payment_method',
      header: m.payment_method(),
      renderer: 'badge',
      rendererConfig: {
        variantMapper: () => 'outline',
        labelMapper: (method: InvoiceDueDate['payment_method']) => getPaymentMethodLabel(method),
      },
    },
    {
      accessorKey: 'invoice.state',
      header: m.invoice_state(),
      renderer: 'component',
      rendererConfig: {
        component: InvoiceStateBadge,
        propsMapper: (row: InvoiceDueDate) => ({ state: row.invoice?.state as InvoiceState }),
      },
    },
  ]

  const apiUrl = $derived(legalEntity?.id ? `/legal-entities/${legalEntity.id}/invoice-due-dates` : null)
  const fetchDueDates = $derived(apiUrl ? createApiFetcher<InvoiceDueDate>(apiUrl) : null)
</script>

{#if legalEntity && fetchDueDates}
  <ResourceTable {columns} fetchFunction={fetchDueDates} {filters} columnsStorageId="payments-table" />
{/if}
