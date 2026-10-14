<!--
  @component SupplierInvoicePayments
  @description "Scadenze e pagamenti" subpage of a received invoice. Top: the
  payment schedule as an editable table (PUT …/due-dates, versioned — a stale
  version reloads the invoice), clearable, editable only while no payment is
  recorded and never on a TD04 credit note. Warns when the schedule was
  generated automatically (to review) and when Σ scadenze ≠ net payable.
  Below: per-scadenza payment progress and history, with record / mark-as-paid
  / delete. Payments are allowed on invoices still to link. Provides the
  invoice to page state for SupplierInvoiceSidebar.
  @keywords supplier invoice, received invoice, due dates, scadenze, payments, pagamenti, record, delete, payables, subpage
  @uses RequestPlaceholder, InvoiceDueDatesEditor, PaymentProgressCell, InvoicePaymentStatusBadge, RecordPaymentDialog
  @api GET /api/legal-entities/{legalEntity}/supplier-invoices/{supplierInvoice} -> SupplierInvoice
  @api PUT /api/legal-entities/{legalEntity}/supplier-invoices/{supplierInvoice}/due-dates
  @api POST /api/legal-entities/{legalEntity}/supplier-invoice-due-dates/{supplierInvoiceDueDate}/payments
  @api DELETE /api/legal-entities/{legalEntity}/supplier-invoice-due-dates/{supplierInvoiceDueDate}/payments/{payment}
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { SupplierInvoicePaymentsContract as contract } from './SupplierInvoicePayments.contract.js'
</script>

<script lang="ts">
  import ActionButton from '$components/core/ActionButton.svelte'
  import RequestPlaceholder from '$components/core/common/RequestPlaceholder.svelte'
  import BusyButton from '$components/core/form/BusyButton.svelte'
  import FormErrorMessage from '$components/core/form/FormErrorMessage.svelte'
  import FormUtil, { type FailurePayload } from '$components/core/form/FormUtil.svelte'
  import InvoiceDueDatesEditor, {
    type InvoiceDueDateInput,
  } from '$components/features/form/InvoiceDueDatesEditor.svelte'
  import GroupTitle from '$components/features/globals/GroupTitle.svelte'
  import InvoicePaymentStatusBadge from '$components/features/invoices/InvoicePaymentStatusBadge.svelte'
  import RecordPaymentDialog from '$components/features/payments/RecordPaymentDialog.svelte'
  import { formatCalendarDay } from '$components/features/supplier-invoices/format'
  import {
    canEditSupplierDueDates,
    deleteSupplierPayment,
    isSupplierDueDatePayable,
    markSupplierDueDatePaid,
    recordSupplierPayment,
    syncSupplierInvoiceDueDates,
    toastUnmappedValidationErrors,
  } from '$components/features/supplier-invoices/supplier-invoice-actions'
  import * as Alert from '$components/ui/alert'
  import { Button } from '$components/ui/button'
  import { confirmAction } from '$components/ui/confirm-action-dialog'
  import Separator from '$components/ui/separator/separator.svelte'
  import { useProvides } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages.js'
  import type { SupplierInvoice, SupplierInvoiceDueDate, SupplierInvoicePayment } from '$lib/types/api-types'
  import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
  import { getPaymentMethodLabel } from '$lib/utils/enum-labels'
  import { hasPermission } from '$lib/utils/permissions'
  import { floatToPriceString } from '$lib/utils/prices'
  import { api, ApiError, type SafeApiResponse } from '$lib/utils/request'
  import type { SnippetProps } from '$utils/runtime'
  import AlertCircleIcon from '@lucide/svelte/icons/alert-circle'
  import IconCash from '@tabler/icons-svelte/icons/cash'
  import IconCircleCheck from '@tabler/icons-svelte/icons/circle-check'
  import IconTrash from '@tabler/icons-svelte/icons/trash'
  import { onDestroy, onMount } from 'svelte'
  import { toast } from 'svelte-sonner'
  import { SupplierInvoicePaymentsContract } from './SupplierInvoicePayments.contract.js'

  let { pageDetails, legalEntity, user }: SnippetProps = $props()

  const invoiceId = $derived(pageDetails.params.uuid)
  const legalEntityId = $derived(legalEntity?.id)

  const invoiceHandle = useProvides(SupplierInvoicePaymentsContract, 'supplierInvoice')
  const breadcrumbTitle = useBreadcrumbTitle()

  const canEdit = $derived(hasPermission(user, 'edit-supplier-invoices'))

  let invoice = $state<SupplierInvoice | null>(null)
  let promise = $state<Promise<SafeApiResponse<SupplierInvoice>> | null>(null)

  const dueDates = $derived(invoice?.due_dates ?? [])
  const currency = $derived(invoice?.currency)
  const isCreditNote = $derived(invoice?.document_type === 'TD04')
  const scheduleEditable = $derived(!!invoice && canEdit && canEditSupplierDueDates(invoice))

  async function fetchInvoice(): Promise<SafeApiResponse<SupplierInvoice>> {
    const res = await api.safe.get<SupplierInvoice>(`/legal-entities/${legalEntityId}/supplier-invoices/${invoiceId}`)
    if (res.data) {
      invoice = res.data
      invoiceHandle.set(res.data)
      breadcrumbTitle.setLabel('supplier-invoice-details', res.data.document_number)
    }
    return res
  }

  /** Silent re-fetch after a mutation — updates `invoice` without a spinner flash. */
  async function refresh() {
    await fetchInvoice()
  }

  onMount(() => {
    if (legalEntityId && invoiceId) promise = fetchInvoice()
  })

  onDestroy(() => {
    invoiceHandle.unset()
    breadcrumbTitle.clearLabel('supplier-invoice-details')
  })

  function money(value: string | number | null | undefined): string {
    return floatToPriceString(Number(value) || 0, currency ?? undefined)
  }

  // ── Schedule editing ─────────────────────────────────────────────────────

  type ScheduleValues = { due_dates: InvoiceDueDateInput[] }

  const scheduleInitialValues = $derived<ScheduleValues>({
    due_dates: dueDates.map(d => ({
      position: d.position,
      due_date: d.due_date,
      amount: Number(d.amount) || 0,
      payment_method: d.payment_method ?? 'MP05',
    })),
  })

  async function saveSchedule(values: ScheduleValues): Promise<SupplierInvoice> {
    if (!legalEntityId || !invoice) throw new Error('Missing invoice')
    try {
      return await syncSupplierInvoiceDueDates(legalEntityId, invoice.id, {
        version: invoice.version,
        due_dates: (values.due_dates ?? []).map((d, i) => ({
          position: i + 1,
          due_date: d.due_date,
          amount: Number(d.amount),
          ...(d.payment_method ? { payment_method: d.payment_method } : {}),
        })),
      })
    } catch (err) {
      toastUnmappedValidationErrors(err, ['due_dates'])
      throw err
    }
  }

  async function handleScheduleSaved() {
    toast.success(m.supplier_invoice_due_dates_saved())
    // The PUT answers with the invoice, but refetching keeps payments and
    // derived flags (mismatch / need review) authoritative.
    await refresh()
  }

  async function handleScheduleFailure({ error }: FailurePayload) {
    // Someone else changed the invoice meanwhile: reload to the current version.
    if (error instanceof ApiError && error.status === 409) {
      toast.warning(m.supplier_invoice_due_dates_stale())
      await refresh()
    }
  }

  // ── Payments ─────────────────────────────────────────────────────────────

  let dialogOpen = $state(false)
  let dialogDueDate = $state<SupplierInvoiceDueDate | null>(null)

  function canPay(dueDate: SupplierInvoiceDueDate): boolean {
    return canEdit && isSupplierDueDatePayable(dueDate.residual_amount, invoice?.document_type)
  }

  function openRecord(dueDate: SupplierInvoiceDueDate) {
    dialogDueDate = dueDate
    dialogOpen = true
  }

  function handleMarkPaid(dueDate: SupplierInvoiceDueDate) {
    const leId = legalEntityId
    if (!leId) return
    confirmAction({
      title: m.mark_as_settled(),
      description: m.mark_as_settled_confirmation({ amount: money(dueDate.residual_amount) }),
      confirmText: m.mark_as_settled(),
      successMessage: m.payment_recorded_successfully(),
      errorMessage: m.payment_record_error(),
      onConfirm: async () => {
        await markSupplierDueDatePaid(leId, dueDate)
        await refresh()
      },
    })
  }

  function handleDelete(dueDate: SupplierInvoiceDueDate, payment: SupplierInvoicePayment) {
    const leId = legalEntityId
    if (!leId) return
    confirmAction({
      title: m.confirm_action(),
      description: m.payment_delete_confirmation({ amount: money(payment.amount) }),
      variant: 'destructive',
      successMessage: m.payment_deleted_successfully(),
      errorMessage: m.payment_delete_error(),
      onConfirm: async () => {
        await deleteSupplierPayment(leId, dueDate.id, payment.id)
        await refresh()
      },
    })
  }
</script>

<div class="flex flex-col gap-6 p-6 pb-breadcrumbs">
  <RequestPlaceholder {promise}>
    {#snippet content()}
      {#if invoice}
        {@const inv = invoice}
        <div class="flex items-center gap-3">
          <h2 class="text-lg font-semibold">{m.due_dates_and_payments()}</h2>
          <InvoicePaymentStatusBadge status={inv.payment_status} payable />
        </div>

        {#if isCreditNote}
          <Alert.Root class="max-w-md lg:max-w-none">
            <AlertCircleIcon />
            <Alert.Description>{m.supplier_invoice_credit_note_no_due_dates()}</Alert.Description>
          </Alert.Root>
        {:else}
          {#if inv.due_dates_need_review}
            <Alert.Root class="max-w-md lg:max-w-none">
              <AlertCircleIcon />
              <Alert.Title>{m.supplier_invoice_flag_due_dates_need_review()}</Alert.Title>
              <Alert.Description>{m.supplier_invoice_due_dates_need_review_help()}</Alert.Description>
            </Alert.Root>
          {/if}
          {#if inv.due_dates_mismatch}
            <Alert.Root variant="destructive" class="max-w-md lg:max-w-none">
              <AlertCircleIcon />
              <Alert.Title>{m.supplier_invoice_flag_due_dates_mismatch()}</Alert.Title>
              <Alert.Description>
                {m.supplier_invoice_due_dates_mismatch_help({
                  scheduled: money(inv.scheduled_total),
                  net: money(inv.net_payable),
                })}
              </Alert.Description>
            </Alert.Root>
          {/if}

          <!-- Schedule -->
          <GroupTitle heading={m.supplier_invoice_schedule()}>
            {#snippet description()}
              {#if scheduleEditable}
                {m.supplier_invoice_schedule_description()}
              {:else if canEdit}
                {m.supplier_invoice_schedule_locked()}
              {:else}
                {m.supplier_invoice_schedule_readonly()}
              {/if}
            {/snippet}

            {#snippet content()}
              {#if scheduleEditable}
                <!-- Remount on every new version so the editor re-seeds from the saved rows. -->
                {#key inv.version}
                  <FormUtil
                    initialValues={scheduleInitialValues}
                    showCustomFields={false}
                    onSubmit={saveSchedule as (values: ScheduleValues) => Promise<unknown>}
                    onSuccess={handleScheduleSaved}
                    onFailure={handleScheduleFailure}
                    class="flex min-w-0 flex-col gap-3">
                    {#snippet withContext()}
                      <FormErrorMessage />
                      <InvoiceDueDatesEditor
                        name="due_dates"
                        label={m.supplier_invoice_schedule()}
                        showLabel={false}
                        value={scheduleInitialValues.due_dates}
                        currency={currency ?? undefined}
                        expectedTotal={Number(inv.net_payable) || 0} />
                    {/snippet}
                    {#snippet bottom()}
                      <div class="flex justify-end">
                        <BusyButton type="submit">{m.save_changes()}</BusyButton>
                      </div>
                    {/snippet}
                  </FormUtil>
                {/key}
              {:else if dueDates.length === 0}
                <p class="text-sm text-muted-foreground">{m.supplier_invoice_no_due_dates()}</p>
              {:else}
                <div class="flex flex-col divide-y text-sm">
                  {#each dueDates as dueDate (dueDate.id)}
                    <div class="flex items-center justify-between gap-3 py-1.5">
                      <span>{formatCalendarDay(dueDate.due_date)}</span>
                      <span class="text-muted-foreground">
                        {dueDate.payment_method ? getPaymentMethodLabel(dueDate.payment_method) : '-'}
                      </span>
                      <span class="ml-auto font-medium">{money(dueDate.amount)}</span>
                    </div>
                  {/each}
                </div>
              {/if}
            {/snippet}
          </GroupTitle>

          {#if dueDates.length > 0}
            <Separator />

            <!-- Payments, grouped by scadenza -->
            {#each dueDates as dueDate, i (dueDate.id)}
              {#if i > 0}
                <Separator />
              {/if}
              <GroupTitle heading={`${m.due_date()} ${formatCalendarDay(dueDate.due_date)}`}>
                {#snippet description()}
                  <span class="my-1 inline-flex">
                    <InvoicePaymentStatusBadge status={dueDate.payment_status} payable />
                  </span>
                  <span class="block">
                    {m.amount_residual()}:
                    <span class="font-medium text-foreground">{money(dueDate.residual_amount)}</span>
                  </span>
                  <span class="block">
                    {m.amount_settled()}:
                    <span class="font-medium text-foreground">{money(dueDate.paid_amount)}</span>
                  </span>
                {/snippet}

                {#snippet content()}
                  {#if dueDate.payments && dueDate.payments.length > 0}
                    <div class="flex flex-col divide-y">
                      {#each dueDate.payments as payment (payment.id)}
                        <div class="flex items-center justify-between gap-3 py-1.5 text-sm">
                          <span class="text-muted-foreground">
                            {formatCalendarDay(payment.payment_date)}
                            {#if payment.payment_method}· {getPaymentMethodLabel(payment.payment_method)}{/if}
                          </span>
                          <span class="ml-auto font-medium">{money(payment.amount)}</span>
                          {#if canEdit}
                            <Button
                              variant="ghost"
                              size="icon"
                              class="size-7"
                              aria-label={m.common_delete()}
                              onclick={() => handleDelete(dueDate, payment)}>
                              <IconTrash class="size-4 text-muted-foreground" />
                            </Button>
                          {/if}
                        </div>
                      {/each}
                    </div>
                  {:else}
                    <p class="text-xs text-muted-foreground">{m.no_payments_recorded()}</p>
                  {/if}

                  {#if canPay(dueDate)}
                    <div class="flex gap-2">
                      <Button variant="outline" onclick={() => openRecord(dueDate)}>
                        <IconCash class="size-4" />
                        {m.register_payment()}
                      </Button>
                      <ActionButton
                        variant="outline"
                        size="icon"
                        busyLabel=""
                        tooltip={m.mark_as_settled()}
                        onclick={() => handleMarkPaid(dueDate)}>
                        <IconCircleCheck class="size-4" />
                      </ActionButton>
                    </div>
                  {/if}
                {/snippet}
              </GroupTitle>
            {/each}
          {/if}
        {/if}
      {/if}
    {/snippet}
  </RequestPlaceholder>
</div>

{#if dialogDueDate && legalEntityId}
  <RecordPaymentDialog
    bind:open={dialogOpen}
    {legalEntityId}
    dueDate={dialogDueDate}
    {currency}
    onRecord={(dueDateId, input) => recordSupplierPayment(legalEntityId, dueDateId, input)}
    onSaved={refresh} />
{/if}
