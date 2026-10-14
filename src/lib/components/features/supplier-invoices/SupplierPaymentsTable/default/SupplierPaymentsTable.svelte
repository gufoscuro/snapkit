<!--
  @component SupplierPaymentsTable
  @description "Da pagare": paginated, cross-invoice list of received-invoice
  due dates (scadenze fornitori). Without a payment_status filter the backend
  returns only open scadenze. Each row shows the source invoice (linked to its
  "Scadenze e pagamenti" subpage) over the supplier — or the cedente while still
  to link — the due date, payment progress (residual / paid / total) in the
  invoice currency, payment method, payment status and the invoice status.
  Payable rows expose "record payment" (dialog) and "mark as paid" (records the
  whole residual). Consumes filter state from page context; publishes CSV export.
  @keywords payments, due-dates, to pay, da pagare, payables, supplier invoices, scadenzario, table, record
  @uses ResourceTable, RecordCustomerCell, PaymentProgressCell, InvoicePaymentStatusBadge, SupplierInvoiceStatusBadge, RecordPaymentDialog
  @api GET /api/legal-entities/{legalEntity}/supplier-invoice-due-dates -> SupplierInvoiceDueDate[]
  @api POST /api/legal-entities/{legalEntity}/supplier-invoice-due-dates/{supplierInvoiceDueDate}/payments
  @route supplier-invoice-payments
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { SupplierPaymentsTableContract as contract } from './SupplierPaymentsTable.contract.js'
</script>

<script lang="ts">
  import { ResourceTable } from '$lib/components/core/ResourceTable'
  import type { Action, ActionHelpers, ColumnConfig } from '$lib/components/core/ResourceTable/types'
  import RecordCustomerCell from '$lib/components/features/common/RecordCustomerCell.svelte'
  import InvoicePaymentStatusBadge from '$lib/components/features/invoices/InvoicePaymentStatusBadge.svelte'
  import PaymentProgressCell from '$lib/components/features/payments/PaymentProgressCell.svelte'
  import RecordPaymentDialog from '$lib/components/features/payments/RecordPaymentDialog.svelte'
  import {
    isSupplierDueDatePayable,
    markSupplierDueDatePaid,
    recordSupplierPayment,
  } from '$lib/components/features/supplier-invoices/supplier-invoice-actions'
  import SupplierInvoiceStatusBadge from '$lib/components/features/supplier-invoices/SupplierInvoiceStatusBadge.svelte'
  import { confirmAction } from '$lib/components/ui/confirm-action-dialog'
  import { useConsumes } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages.js'
  import type { SupplierInvoiceDueDate } from '$lib/types/api-types'
  import { getPaymentMethodLabel } from '$lib/utils/enum-labels'
  import type { FilterQuery } from '$lib/utils/filters'
  import { hasPermission } from '$lib/utils/permissions'
  import { floatToPriceString } from '$lib/utils/prices'
  import { useTableExport } from '$lib/utils/table-export.svelte'
  import { createApiFetcher } from '$lib/utils/table-fetchers'
  import { createRoute } from '$utils/route-builder.js'
  import type { SnippetProps } from '$utils/runtime'
  import IconCash from '@tabler/icons-svelte/icons/cash'
  import IconCircleCheck from '@tabler/icons-svelte/icons/circle-check'
  import { SupplierPaymentsTableContract } from './SupplierPaymentsTable.contract.js'

  let { legalEntity, user }: SnippetProps = $props()

  const filtersHandle = useConsumes(SupplierPaymentsTableContract, 'filters')
  const filters = $derived(filtersHandle.get() as FilterQuery | undefined)

  const canEdit = $derived(hasPermission(user, 'edit-supplier-invoices'))

  // Record-payment dialog state. `refreshTable` is captured from the action's
  // helpers: the table exposes `refresh` only through action helpers.
  let dialogOpen = $state(false)
  let dialogDueDate = $state<SupplierInvoiceDueDate | null>(null)
  let refreshTable = $state<(() => Promise<void>) | null>(null)

  function canPay(row: SupplierInvoiceDueDate): boolean {
    return canEdit && isSupplierDueDatePayable(row.residual_amount, row.supplier_invoice?.document_type)
  }

  const recordAction: Action<SupplierInvoiceDueDate> = {
    icon: IconCash,
    variant: 'ghost',
    label: m.register_payment(),
    visible: canPay,
    onClick: (row: SupplierInvoiceDueDate, helpers: ActionHelpers<SupplierInvoiceDueDate>) => {
      dialogDueDate = row
      refreshTable = helpers.refresh
      dialogOpen = true
    },
  }

  const markPaidAction: Action<SupplierInvoiceDueDate> = {
    icon: IconCircleCheck,
    variant: 'ghost',
    label: m.mark_as_settled(),
    visible: canPay,
    onClick: (row: SupplierInvoiceDueDate, helpers: ActionHelpers<SupplierInvoiceDueDate>) => {
      const legalEntityId = legalEntity?.id
      if (!legalEntityId) return
      confirmAction({
        title: m.mark_as_settled(),
        description: m.mark_as_settled_confirmation({
          amount: floatToPriceString(Number(row.residual_amount) || 0, row.supplier_invoice?.currency),
        }),
        confirmText: m.mark_as_settled(),
        successMessage: m.payment_recorded_successfully(),
        errorMessage: m.payment_record_error(),
        onConfirm: async () => {
          await markSupplierDueDatePaid(legalEntityId, row)
          await helpers.refresh()
        },
      })
    },
  }

  const columns: ColumnConfig<SupplierInvoiceDueDate>[] = [
    {
      // Invoice number (linked to its scadenze/pagamenti subpage) + supplier.
      // Degrades to plain text if `supplier_invoice` wasn't eager-loaded.
      accessorKey: 'supplier_invoice.document_number',
      header: m.document_number(),
      renderer: 'component',
      rendererConfig: {
        component: RecordCustomerCell,
        propsMapper: (row: SupplierInvoiceDueDate) => ({
          code: row.supplier_invoice?.document_number,
          customerName: row.supplier_invoice?.supplier_name || row.supplier_invoice?.cedente_name,
          href: row.supplier_invoice
            ? createRoute({ $id: 'supplier-invoice-payments', params: { uuid: row.supplier_invoice.id } })
            : undefined,
        }),
      },
    },
    {
      accessorKey: 'due_date',
      header: m.due_date(),
      renderer: 'date',
    },
    {
      accessorKey: 'residual_amount',
      header: m.amount(),
      renderer: 'component',
      rendererConfig: {
        component: PaymentProgressCell,
        propsMapper: (row: SupplierInvoiceDueDate) => ({
          residual: Number(row.residual_amount) || 0,
          paid: Number(row.paid_amount) || 0,
          total: Number(row.amount) || 0,
          currency: row.supplier_invoice?.currency,
          paidLabel: m.amount_settled(),
        }),
      },
    },
    {
      accessorKey: 'payment_method',
      header: m.payment_method(),
      renderer: 'custom',
      rendererConfig: {
        cellRenderer: (row: SupplierInvoiceDueDate) =>
          row.payment_method ? getPaymentMethodLabel(row.payment_method) : '-',
      },
    },
    {
      accessorKey: 'payment_status',
      header: m.payment_status(),
      renderer: 'component',
      rendererConfig: {
        component: InvoicePaymentStatusBadge,
        propsMapper: (row: SupplierInvoiceDueDate) => ({ status: row.payment_status, payable: true }),
      },
    },
    {
      accessorKey: 'supplier_invoice.status',
      header: m.status(),
      renderer: 'component',
      rendererConfig: {
        component: SupplierInvoiceStatusBadge,
        propsMapper: (row: SupplierInvoiceDueDate) => ({ status: row.supplier_invoice?.status }),
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

  const apiUrl = $derived(legalEntity?.id ? `/legal-entities/${legalEntity.id}/supplier-invoice-due-dates` : null)
  const fetchDueDates = $derived(apiUrl ? createApiFetcher<SupplierInvoiceDueDate>(apiUrl) : null)

  // Publishes the CSV export to the sibling filters component (page-state channel).
  useTableExport(SupplierPaymentsTableContract, () => fetchDueDates)
</script>

{#if legalEntity && fetchDueDates}
  <ResourceTable {columns} fetchFunction={fetchDueDates} {filters} columnsStorageId="supplier-payments-table" />

  {#if dialogDueDate}
    <RecordPaymentDialog
      bind:open={dialogOpen}
      legalEntityId={legalEntity.id}
      dueDate={dialogDueDate}
      currency={dialogDueDate.supplier_invoice?.currency}
      onRecord={(dueDateId, input) => recordSupplierPayment(legalEntity.id, dueDateId, input)}
      onSaved={() => refreshTable?.()} />
  {/if}
{/if}
