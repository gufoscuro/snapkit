<!--
  @component InvoicePayments
  @description Payments recap for a single invoice, grouped by scadenza. Each
  due date shows its collection progress (residual / paid / total), payment
  status, and the list of recorded payments (each removable). Collectable
  scadenze expose "record payment" (dialog) and "mark as paid" (records the
  residual). Fetches the invoice and feeds it to page state so InvoiceSidebar
  renders its header + menu on this subpage.
  @keywords invoice, payments, scadenza, record, delete, history, collect, subpage
  @uses RequestPlaceholder, PaymentProgressCell, InvoicePaymentStatusBadge, RecordPaymentDialog
  @api GET /api/legal-entities/{legalEntity}/invoices/{invoice} -> Invoice
  @api POST /api/legal-entities/{legalEntity}/invoice-due-dates/{invoiceDueDate}/payments
  @api DELETE /api/legal-entities/{legalEntity}/invoice-due-dates/{invoiceDueDate}/payments/{payment}
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { InvoicePaymentsContract as contract } from './InvoicePayments.contract.js'
</script>

<script lang="ts">
  import ActionButton from '$components/core/ActionButton.svelte'
  import RequestPlaceholder from '$components/core/common/RequestPlaceholder.svelte'
  import GroupTitle from '$components/features/globals/GroupTitle.svelte'
  import InvoicePaymentStatusBadge from '$components/features/invoices/InvoicePaymentStatusBadge.svelte'
  import {
    deletePayment,
    isDueDateCollectable,
    markDueDatePaid,
  } from '$components/features/invoices/invoice-payment-actions'
  import RecordPaymentDialog from '$components/features/payments/RecordPaymentDialog.svelte'
  import { Button } from '$components/ui/button'
  import { confirmAction } from '$components/ui/confirm-action-dialog'
  import Separator from '$components/ui/separator/separator.svelte'
  import { useProvides } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages.js'
  import type { Invoice, InvoiceDueDate, InvoicePayment } from '$lib/types/api-types'
  import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
  import { getPaymentMethodLabel } from '$lib/utils/enum-labels'
  import { floatToPriceString } from '$lib/utils/prices'
  import { api, type SafeApiResponse } from '$lib/utils/request'
  import type { SnippetProps } from '$utils/runtime'
  import IconCash from '@tabler/icons-svelte/icons/cash'
  import IconCircleCheck from '@tabler/icons-svelte/icons/circle-check'
  import IconTrash from '@tabler/icons-svelte/icons/trash'
  import { onDestroy, onMount } from 'svelte'
  import { InvoicePaymentsContract } from './InvoicePayments.contract.js'

  let { pageDetails, legalEntity }: SnippetProps = $props()

  const invoiceId = $derived(pageDetails.params.uuid)
  const legalEntityId = $derived(legalEntity?.id)

  // Feed the invoice into page state so InvoiceSidebar (which consumes it)
  // renders the header + subpage menu on this subpage.
  const invoiceHandle = useProvides(InvoicePaymentsContract, 'invoice')
  const breadcrumbTitle = useBreadcrumbTitle()

  let invoice = $state<Invoice | null>(null)
  let promise = $state<Promise<SafeApiResponse<Invoice>> | null>(null)

  const dueDates = $derived(invoice?.due_dates ?? [])
  const currency = $derived(invoice?.currency)

  function formatDate(value: string): string {
    const date = new Date(value)
    return isNaN(date.getTime()) ? value : date.toLocaleDateString()
  }

  async function fetchInvoice(): Promise<SafeApiResponse<Invoice>> {
    const res = await api.safe.get<Invoice>(`/legal-entities/${legalEntityId}/invoices/${invoiceId}`)
    if (res.data) {
      invoice = res.data
      invoiceHandle.set(res.data)
      breadcrumbTitle.setLabel('invoice-details', res.data.document_number || m.new_invoice())
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
    breadcrumbTitle.clearLabel('invoice-details')
  })

  // Record-payment dialog state
  let dialogOpen = $state(false)
  let dialogDueDate = $state<InvoiceDueDate | null>(null)

  function canCollect(dueDate: InvoiceDueDate): boolean {
    return isDueDateCollectable(invoice?.state, Number(dueDate.residual_amount) || 0, invoice?.document_type)
  }

  function openRecord(dueDate: InvoiceDueDate) {
    dialogDueDate = dueDate
    dialogOpen = true
  }

  function handleMarkPaid(dueDate: InvoiceDueDate) {
    const leId = legalEntityId
    if (!leId) return
    confirmAction({
      title: m.mark_as_paid(),
      description: m.mark_as_paid_confirmation({
        amount: floatToPriceString(Number(dueDate.residual_amount) || 0, currency ?? undefined),
      }),
      confirmText: m.mark_as_paid(),
      successMessage: m.payment_recorded_successfully(),
      errorMessage: m.payment_record_error(),
      onConfirm: async () => {
        await markDueDatePaid(leId, dueDate)
        await refresh()
      },
    })
  }

  function handleDelete(dueDate: InvoiceDueDate, payment: InvoicePayment) {
    if (!legalEntityId) return
    confirmAction({
      title: m.confirm_action(),
      description: m.payment_delete_confirmation({
        amount: floatToPriceString(Number(payment.amount) || 0, currency ?? undefined),
      }),
      variant: 'destructive',
      successMessage: m.payment_deleted_successfully(),
      errorMessage: m.payment_delete_error(),
      onConfirm: async () => {
        await deletePayment(legalEntityId, dueDate.id, payment.id)
        await refresh()
      },
    })
  }
</script>

<div class="flex flex-col gap-6 p-6 pb-breadcrumbs">
  <RequestPlaceholder {promise}>
    {#snippet content()}
      {#if invoice}
        <div class="flex items-center gap-3">
          <h2 class="text-lg font-semibold">{m.payments()}</h2>
          <InvoicePaymentStatusBadge status={invoice.payment_status} />
        </div>

        {#if dueDates.length === 0}
          <p class="text-sm text-muted-foreground">{m.no_payments_recorded()}</p>
        {:else}
          {#each dueDates as dueDate, i (dueDate.id)}
            {#if i > 0}
              <Separator />
            {/if}
            <GroupTitle heading={`${m.due_date()} ${formatDate(dueDate.due_date)}`}>
              {#snippet description()}
                <span class="my-1 inline-flex">
                  <InvoicePaymentStatusBadge status={dueDate.payment_status} />
                </span>
                <span class="block">
                  {m.amount_residual()}:
                  <span class="font-medium text-foreground">
                    {floatToPriceString(Number(dueDate.residual_amount) || 0, currency ?? undefined)}
                  </span>
                </span>
                <span class="block">
                  {m.amount_paid()}:
                  <span class="font-medium text-foreground">
                    {floatToPriceString(Number(dueDate.paid_amount) || 0, currency ?? undefined)}
                  </span>
                </span>
              {/snippet}

              {#snippet content()}
                {#if dueDate.payments && dueDate.payments.length > 0}
                  <div class="flex flex-col divide-y">
                    {#each dueDate.payments as payment (payment.id)}
                      <div class="flex items-center justify-between gap-3 py-1.5 text-sm">
                        <span class="text-muted-foreground">
                          {formatDate(payment.payment_date)} · {getPaymentMethodLabel(payment.payment_method)}
                        </span>
                        <span class="ml-auto font-medium">
                          {floatToPriceString(Number(payment.amount) || 0, currency ?? undefined)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          class="size-7"
                          aria-label={m.common_delete()}
                          onclick={() => handleDelete(dueDate, payment)}>
                          <IconTrash class="size-4 text-muted-foreground" />
                        </Button>
                      </div>
                    {/each}
                  </div>
                {:else}
                  <p class="text-xs text-muted-foreground">{m.no_payments_recorded()}</p>
                {/if}

                {#if canCollect(dueDate)}
                  <div class="flex gap-2">
                    <Button variant="outline" onclick={() => openRecord(dueDate)}>
                      <IconCash class="size-4" />
                      {m.register_payment()}
                    </Button>
                    <ActionButton
                      variant="outline"
                      size="icon"
                      busyLabel=""
                      tooltip={m.mark_as_paid()}
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
    {/snippet}
  </RequestPlaceholder>
</div>

{#if dialogDueDate && legalEntityId}
  <RecordPaymentDialog bind:open={dialogOpen} {legalEntityId} dueDate={dialogDueDate} {currency} onSaved={refresh} />
{/if}
