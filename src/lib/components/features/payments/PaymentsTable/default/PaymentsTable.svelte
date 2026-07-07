<!--
  @component PaymentsTable
  @description Displays a paginated, cross-invoice list of invoice due dates to be
  collected ("payments to receive"). Each row shows the source invoice (linked to
  its payments subpage), customer, due date, collection progress (residual / paid
  / total), payment method, and the scadenza's payment status. Collectable rows
  expose two actions: record a payment (dialog) and "mark as paid" (one-click,
  records the residual). Consumes filter state from page context.
  @keywords payments, due-dates, to-collect, receivables, invoices, table, list, record
  @uses ResourceTable, InvoiceStateBadge, InvoicePaymentStatusBadge, PaymentProgressCell, RecordPaymentDialog
  @api GET /api/legal-entities/{legalEntity}/invoice-due-dates -> InvoiceDueDate[]
  @route invoice-payments
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { PaymentsTableContract as contract } from './PaymentsTable.contract.js'
</script>

<script lang="ts">
  import { ResourceTable } from '$lib/components/core/ResourceTable'
  import type { Action, ActionHelpers, ColumnConfig } from '$lib/components/core/ResourceTable/types'
  import RecordCustomerCell from '$lib/components/features/common/RecordCustomerCell.svelte'
  import InvoiceStateBadge from '$lib/components/features/invoices/InvoiceStateBadge.svelte'
  import InvoicePaymentStatusBadge from '$lib/components/features/invoices/InvoicePaymentStatusBadge.svelte'
  import { isDueDateCollectable, markDueDatePaid } from '$lib/components/features/invoices/invoice-payment-actions'
  import PaymentProgressCell from '$lib/components/features/payments/PaymentProgressCell.svelte'
  import RecordPaymentDialog from '$lib/components/features/payments/RecordPaymentDialog.svelte'
  import { confirmAction } from '$lib/components/ui/confirm-action-dialog'
  import { useConsumes } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages.js'
  import type { InvoiceDueDate, InvoiceState } from '$lib/types/api-types'
  import { getPaymentMethodLabel } from '$lib/utils/enum-labels'
  import type { FilterQuery } from '$lib/utils/filters'
  import { floatToPriceString } from '$lib/utils/prices'
  import { createApiFetcher } from '$lib/utils/table-fetchers'
  import { createRoute } from '$utils/route-builder.js'
  import type { SnippetProps } from '$utils/runtime'
  import IconCash from '@tabler/icons-svelte/icons/cash'
  import IconCircleCheck from '@tabler/icons-svelte/icons/circle-check'
  import { PaymentsTableContract } from './PaymentsTable.contract.js'

  let { legalEntity }: SnippetProps = $props()

  const filtersHandle = useConsumes(PaymentsTableContract, 'filters')
  const filters = $derived(filtersHandle.get() as FilterQuery | undefined)

  // Record-payment dialog state. `refreshTable` is captured from the action's
  // helpers so the dialog can refetch the list after a successful save (the
  // table exposes `refresh` only through action helpers, not as a public method).
  let dialogOpen = $state(false)
  let dialogDueDate = $state<InvoiceDueDate | null>(null)
  let refreshTable = $state<(() => Promise<void>) | null>(null)

  function canCollect(row: InvoiceDueDate): boolean {
    return isDueDateCollectable(row.invoice?.state, Number(row.residual_amount) || 0, row.invoice?.document_type)
  }

  const recordAction: Action<InvoiceDueDate> = {
    icon: IconCash,
    variant: 'ghost',
    label: m.register_payment(),
    visible: canCollect,
    onClick: (row: InvoiceDueDate, helpers: ActionHelpers<InvoiceDueDate>) => {
      dialogDueDate = row
      refreshTable = helpers.refresh
      dialogOpen = true
    },
  }

  const markPaidAction: Action<InvoiceDueDate> = {
    icon: IconCircleCheck,
    variant: 'ghost',
    label: m.mark_as_paid(),
    visible: canCollect,
    onClick: (row: InvoiceDueDate, helpers: ActionHelpers<InvoiceDueDate>) => {
      const legalEntityId = legalEntity?.id
      if (!legalEntityId) return
      confirmAction({
        title: m.mark_as_paid(),
        description: m.mark_as_paid_confirmation({
          amount: floatToPriceString(Number(row.residual_amount) || 0),
        }),
        confirmText: m.mark_as_paid(),
        successMessage: m.payment_recorded_successfully(),
        errorMessage: m.payment_record_error(),
        onConfirm: async () => {
          await markDueDatePaid(legalEntityId, row)
          await helpers.refresh()
        },
      })
    },
  }

  const columns: ColumnConfig<InvoiceDueDate>[] = [
    {
      // Invoice number (linked) + customer stacked into one identity column. The
      // link jumps to that invoice's payments subpage (record/history), not the
      // generic invoice overview. Degrades to plain text if `invoice` is missing.
      accessorKey: 'invoice.document_number',
      header: m.document_number(),
      renderer: 'component',
      rendererConfig: {
        component: RecordCustomerCell,
        propsMapper: (row: InvoiceDueDate) => ({
          code: row.invoice?.document_number,
          customerName: row.invoice?.customer_name,
          href: row.invoice ? createRoute({ $id: 'invoice-payments', params: { uuid: row.invoice.id } }) : undefined,
        }),
      },
    },
    {
      accessorKey: 'due_date',
      header: m.due_date(),
      renderer: 'date',
    },
    {
      // Residual / paid / total condensed into one progress cell.
      accessorKey: 'residual_amount',
      header: m.amount(),
      renderer: 'component',
      rendererConfig: {
        component: PaymentProgressCell,
        propsMapper: (row: InvoiceDueDate) => ({
          residual: Number(row.residual_amount) || 0,
          paid: Number(row.paid_amount) || 0,
          total: Number(row.amount) || 0,
        }),
      },
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
      accessorKey: 'payment_status',
      header: m.payment_status(),
      renderer: 'component',
      rendererConfig: {
        component: InvoicePaymentStatusBadge,
        propsMapper: (row: InvoiceDueDate) => ({ status: row.payment_status }),
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
    {
      header: '',
      renderer: 'actions',
      rendererConfig: {
        actions: [recordAction, markPaidAction],
      },
      meta: { cellClassName: 'p-0 h-10 w-12' },
    },
  ]

  const apiUrl = $derived(legalEntity?.id ? `/legal-entities/${legalEntity.id}/invoice-due-dates` : null)
  const fetchDueDates = $derived(apiUrl ? createApiFetcher<InvoiceDueDate>(apiUrl) : null)
</script>

{#if legalEntity && fetchDueDates}
  <ResourceTable {columns} fetchFunction={fetchDueDates} {filters} columnsStorageId="payments-table" />

  {#if dialogDueDate}
    <RecordPaymentDialog
      bind:open={dialogOpen}
      legalEntityId={legalEntity.id}
      dueDate={dialogDueDate}
      onSaved={() => refreshTable?.()} />
  {/if}
{/if}
