<!--
  @component RecordPaymentDialog
  @description Modal form to record a single payment against an invoice scadenza.
  Prefills payment date (today), amount (the scadenza's residual) and payment
  method (the scadenza's own method), all editable. Enforces `0.01 ≤ amount ≤
  residual` client-side; the backend's residual/state 422s surface as inline
  field errors via FormUtil. Decoupled so both the "to collect" table and the
  invoice payments subpage can mount it. Two-way bind `open` to control it.
  @keywords payment, record, dialog, modal, scadenza, invoice, form, collect
  @api POST /api/legal-entities/{legalEntity}/invoice-due-dates/{invoiceDueDate}/payments
-->
<script lang="ts">
  import FormErrorMessage from '$components/core/form/FormErrorMessage.svelte'
  import FormUtil, { type SuccessPayload } from '$components/core/form/FormUtil.svelte'
  import BusyButton from '$components/core/form/BusyButton.svelte'
  import DateField from '$components/core/form/DateField.svelte'
  import SelectField from '$components/core/form/SelectField.svelte'
  import TextField from '$components/core/form/TextField.svelte'
  import { v } from '$components/core/form/validation'
  import { recordPayment } from '$components/features/invoices/invoice-payment-actions'
  import { Button } from '$components/ui/button'
  import * as Dialog from '$components/ui/dialog'
  import * as m from '$lib/paraglide/messages'
  import type { Currency, InvoiceDueDate, InvoicePayment, PaymentMethod } from '$lib/types/api-types'
  import { paymentMethodLabels, toSelectItems } from '$lib/utils/enum-labels'
  import { todayLocalISO } from '$lib/utils/date'
  import { floatToPriceString } from '$lib/utils/prices'
  import { toast } from 'svelte-sonner'

  type Props = {
    open: boolean
    legalEntityId: string
    dueDate: InvoiceDueDate
    currency?: Currency | string | null
    onSaved?: (payment: InvoicePayment) => void
  }

  let { open = $bindable(false), legalEntityId, dueDate, currency, onSaved }: Props = $props()

  type FormValues = {
    payment_date: string
    amount: number
    payment_method: PaymentMethod | ''
  }

  const residual = $derived(Number(dueDate.residual_amount) || 0)

  const initialValues = $derived<FormValues>({
    payment_date: todayLocalISO(),
    amount: residual,
    payment_method: dueDate.payment_method ?? '',
  })

  const validate = $derived(
    v
      .schema<FormValues>({
        payment_date: [v.required({ field: m.payment_date() })],
        amount: [
          v.required({ field: m.payment_amount() }),
          v.min(0.01, { field: m.payment_amount() }),
          v.max(residual, { field: m.payment_amount() }),
        ],
      })
      .build(),
  )

  const paymentMethodItems = toSelectItems(paymentMethodLabels)

  function handleSubmit(values: FormValues): Promise<InvoicePayment> {
    return recordPayment(legalEntityId, dueDate.id, {
      payment_date: values.payment_date,
      amount: Number(values.amount),
      payment_method: values.payment_method || undefined,
    })
  }

  function handleSuccess({ result }: SuccessPayload<FormValues>) {
    toast.success(m.payment_recorded_successfully())
    onSaved?.(result as unknown as InvoicePayment)
    open = false
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="sm:max-w-md">
    <Dialog.Header>
      <Dialog.Title>{m.register_payment()}</Dialog.Title>
      <Dialog.Description>
        {m.payment_amount_help({ residual: floatToPriceString(residual, currency ?? undefined) })}
      </Dialog.Description>
    </Dialog.Header>

    <FormUtil
      {initialValues}
      {validate}
      showCustomFields={false}
      onSubmit={handleSubmit as (values: FormValues) => Promise<unknown>}
      onSuccess={handleSuccess}
      class="flex min-w-0 flex-col gap-4">
      {#snippet withContext()}
        <FormErrorMessage />

        <DateField name="payment_date" label={m.payment_date()} width="w-full min-w-0" />

        <TextField
          name="amount"
          type="number"
          label={m.payment_amount()}
          rightLabel={String(currency ?? '')}
          width="w-full min-w-0" />

        <SelectField
          name="payment_method"
          label={m.payment_method()}
          items={paymentMethodItems}
          width="w-full min-w-0"
          allowClear />
      {/snippet}

      {#snippet bottom()}
        <Dialog.Footer>
          <Button type="button" variant="outline" onclick={() => (open = false)}>{m.cancel()}</Button>
          <BusyButton type="submit">{m.register_payment()}</BusyButton>
        </Dialog.Footer>
      {/snippet}
    </FormUtil>
  </Dialog.Content>
</Dialog.Root>
