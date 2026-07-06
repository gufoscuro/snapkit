import type { InvoiceDueDate, InvoicePayment, PaymentMethod } from '$lib/types/api-types'
import { todayLocalISO } from '$lib/utils/date'
import { api } from '$lib/utils/request'

/**
 * Body accepted by `POST /invoice-due-dates/{invoiceDueDate}/payments`.
 * `amount` must be `>= 0.01` and `<= residual_amount` of the scadenza (the
 * backend rejects overpayment with a 422). `payment_method` is optional — the
 * FE prefills it from the scadenza's method but lets the user override or clear.
 */
export type RecordPaymentInput = {
  payment_date: string
  amount: number
  payment_method?: PaymentMethod | null
}

/**
 * Record a payment against a single scadenza. Only collectable invoices
 * (submitted / sent / delivered / accepted / rejected — never drafts, TD04,
 * archived or error) accept payments; the backend enforces this.
 */
export function recordPayment(
  legalEntityId: string,
  dueDateId: string,
  input: RecordPaymentInput,
): Promise<InvoicePayment> {
  return api.post<InvoicePayment>(`/legal-entities/${legalEntityId}/invoice-due-dates/${dueDateId}/payments`, {
    data: input,
  })
}

/** Delete a recorded payment. Removing all payments unfreezes the schedule. */
export function deletePayment(legalEntityId: string, dueDateId: string, paymentId: string): Promise<void> {
  return api.delete(`/legal-entities/${legalEntityId}/invoice-due-dates/${dueDateId}/payments/${paymentId}`)
}

/**
 * "Mark as paid" shortcut: record a payment equal to the scadenza's residual,
 * dated today, reusing the scadenza's own payment method. One click, no dialog.
 */
export function markDueDatePaid(
  legalEntityId: string,
  dueDate: Pick<InvoiceDueDate, 'id' | 'residual_amount' | 'payment_method'>,
): Promise<InvoicePayment> {
  return recordPayment(legalEntityId, dueDate.id, {
    payment_date: todayLocalISO(),
    amount: dueDate.residual_amount,
    payment_method: dueDate.payment_method,
  })
}

/**
 * Whether a scadenza can currently take a payment: its parent invoice is in a
 * collectable state and there is a positive residual left. Callers still rely
 * on the backend as the source of truth (422), but this drives button
 * visibility so users don't attempt impossible actions.
 */
export const COLLECTABLE_INVOICE_STATES = ['submitted', 'sent', 'delivered', 'accepted', 'rejected'] as const

export function isDueDateCollectable(
  invoiceState: string | undefined,
  residualAmount: number,
  documentType?: string,
): boolean {
  if (documentType === 'TD04') return false
  if (residualAmount <= 0) return false
  return (COLLECTABLE_INVOICE_STATES as readonly string[]).includes(invoiceState ?? '')
}
