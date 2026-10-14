import type { RecordPaymentInput } from '$lib/components/features/invoices/invoice-payment-actions'
import type {
  PaymentMethod,
  SupplierInvoice,
  SupplierInvoiceDueDate,
  SupplierInvoicePayment,
} from '$lib/types/api-types'
import { todayLocalISO } from '$lib/utils/date'
import { api, ApiError, extractApiErrorMessage } from '$lib/utils/request'
import { toast } from 'svelte-sonner'

const base = (legalEntityId: string) => `/legal-entities/${legalEntityId}`

/**
 * Marks the invoice as seen (`new` → `viewed`). The backend no-ops on `viewed`
 * and on `to_link`, so callers only need to fire it when the status is `new`.
 */
export function markSupplierInvoiceViewed(legalEntityId: string, id: string): Promise<SupplierInvoice> {
  return api.post<SupplierInvoice>(`${base(legalEntityId)}/supplier-invoices/${id}/view`)
}

/**
 * Creates a supplier from the cedente and links the invoice to it. 422 when a
 * supplier (archived ones included) already holds the cedente P.IVA/CF — the
 * caller should then offer "Collega" instead.
 */
export function createSupplierFromInvoice(legalEntityId: string, id: string): Promise<SupplierInvoice> {
  return api.post<SupplierInvoice>(`${base(legalEntityId)}/supplier-invoices/${id}/create-supplier`)
}

/**
 * Links (or re-links to a different) supplier. Never touches due dates or
 * payments. `update_identifiers` writes the cedente P.IVA/CF onto the supplier
 * and needs `edit-suppliers` too (403 otherwise).
 */
export function linkSupplierInvoice(
  legalEntityId: string,
  id: string,
  input: { supplier_id: string; update_identifiers?: boolean },
): Promise<SupplierInvoice> {
  return api.post<SupplierInvoice>(`${base(legalEntityId)}/supplier-invoices/${id}/link`, { data: input })
}

/**
 * Re-runs the automatic match. Only valid on a `to_link` invoice (422
 * otherwise). When it still fails, the response's `match` says why.
 */
export function relinkSupplierInvoice(legalEntityId: string, id: string): Promise<SupplierInvoice> {
  return api.post<SupplierInvoice>(`${base(legalEntityId)}/supplier-invoices/${id}/relink`)
}

export type SupplierInvoiceDueDateInput = {
  position: number
  due_date: string
  amount: number
  payment_method?: PaymentMethod
}

/**
 * Replaces the whole schedule (an empty list clears it). 409 on a stale
 * `version`; 422 on a TD04 or while any scadenza holds a payment.
 */
export function syncSupplierInvoiceDueDates(
  legalEntityId: string,
  id: string,
  input: { version: number; due_dates: SupplierInvoiceDueDateInput[] },
): Promise<SupplierInvoice> {
  return api.put<SupplierInvoice>(`${base(legalEntityId)}/supplier-invoices/${id}/due-dates`, { data: input })
}

/** Records a payment on a scadenza. `amount` must not exceed the residual (422). */
export function recordSupplierPayment(
  legalEntityId: string,
  dueDateId: string,
  input: RecordPaymentInput,
): Promise<SupplierInvoicePayment> {
  return api.post<SupplierInvoicePayment>(`${base(legalEntityId)}/supplier-invoice-due-dates/${dueDateId}/payments`, {
    data: input,
  })
}

export function deleteSupplierPayment(legalEntityId: string, dueDateId: string, paymentId: string): Promise<void> {
  return api.delete(`${base(legalEntityId)}/supplier-invoice-due-dates/${dueDateId}/payments/${paymentId}`)
}

/** "Segna come pagato": pays the whole residual today with the scadenza's own method. */
export function markSupplierDueDatePaid(
  legalEntityId: string,
  dueDate: Pick<SupplierInvoiceDueDate, 'id' | 'residual_amount' | 'payment_method'>,
): Promise<SupplierInvoicePayment> {
  return recordSupplierPayment(legalEntityId, dueDate.id, {
    payment_date: todayLocalISO(),
    amount: Number(dueDate.residual_amount) || 0,
    payment_method: dueDate.payment_method,
  })
}

/**
 * Whether a scadenza can take a payment. Unlike issued invoices there is no
 * state gate: every received invoice is payable, `to_link` ones included —
 * only the residual and the credit-note exclusion matter.
 */
export function isSupplierDueDatePayable(residualAmount: number | string, documentType?: string): boolean {
  if (documentType === 'TD04') return false
  return (Number(residualAmount) || 0) > 0
}

/** The schedule is editable unless the invoice is a credit note or any scadenza holds a payment. */
export function canEditSupplierDueDates(invoice: Pick<SupplierInvoice, 'document_type' | 'due_dates'>): boolean {
  if (invoice.document_type === 'TD04') return false
  return !(invoice.due_dates ?? []).some(d => (d.payments?.length ?? 0) > 0 || (Number(d.paid_amount) || 0) > 0)
}

/** Display name of the cedente: company name, else "first last". */
export function cedenteName(snapshot: SupplierInvoice['cedente_snapshot'] | undefined | null): string {
  if (!snapshot) return ''
  if (snapshot.name) return snapshot.name
  return [snapshot.first_name, snapshot.last_name].filter(Boolean).join(' ')
}

/**
 * FormUtil maps a 422 onto field errors by key, but only the fields a form
 * renders can show them: business-rule errors keyed elsewhere (`supplier_invoice`,
 * `due_dates.0.amount`, a hidden switch…) would leave just the generic banner.
 * Toast those messages so the user learns why; then rethrow for FormUtil.
 */
export function toastUnmappedValidationErrors(err: unknown, renderedFields: string[]): void {
  if (!(err instanceof ApiError) || err.status !== 422) return
  const errors = (err.data?.errors ?? {}) as Record<string, unknown>
  const messages = Object.entries(errors)
    .filter(([field]) => !renderedFields.includes(field))
    .flatMap(([, msgs]) => (Array.isArray(msgs) ? msgs.slice(0, 1) : []))
    .map(String)
  const fallback = Object.keys(errors).length === 0 ? extractApiErrorMessage(err) : undefined
  for (const message of fallback ? [fallback] : messages) toast.error(message)
}
