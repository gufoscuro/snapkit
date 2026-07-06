import type { Currency, InvoiceDueDate } from '$lib/types/api-types'

/**
 * Mock props for RecordPaymentDialog component preview.
 *
 * NOTE: the `onSaved` callback is omitted — functions are not serializable when
 * passed from server to client in SvelteKit.
 */
const mockDueDate: InvoiceDueDate = {
  id: '00000000-0000-0000-0000-0000000000d1',
  position: 1,
  due_date: '2026-08-31',
  amount: '1010.00',
  paid_amount: '400.00',
  residual_amount: 610.0,
  payment_status: 'partially_paid',
  payment_method: 'MP05',
}

export const mockRecordPaymentDialogProps: {
  open: boolean
  legalEntityId: string
  dueDate: InvoiceDueDate
  currency: Currency
} = {
  open: true,
  legalEntityId: '00000000-0000-0000-0000-000000000002',
  dueDate: mockDueDate,
  currency: 'EUR',
}

/** Default export for simple use case */
export default mockRecordPaymentDialogProps
