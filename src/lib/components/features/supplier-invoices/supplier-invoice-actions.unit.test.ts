import { describe, expect, it, vi } from 'vitest'

vi.mock('$lib/utils/request', () => ({
  api: {},
  ApiError: class extends Error {},
  extractApiErrorMessage: () => undefined,
}))
vi.mock('svelte-sonner', () => ({ toast: { error: vi.fn() } }))

import type { SupplierInvoice, SupplierInvoiceDueDate } from '$lib/types/api-types'
import { flattenValues, formatCalendarDay } from './format'
import { canEditSupplierDueDates, cedenteName, isSupplierDueDatePayable } from './supplier-invoice-actions'

const dueDate = (over: Partial<SupplierInvoiceDueDate> = {}) =>
  ({ id: 'd', paid_amount: '0.00', payments: [], ...over }) as SupplierInvoiceDueDate

describe('isSupplierDueDatePayable', () => {
  it('accepts a positive residual, string or number', () => {
    expect(isSupplierDueDatePayable(10, 'TD01')).toBe(true)
    expect(isSupplierDueDatePayable('0.01')).toBe(true)
  })

  it('rejects a settled scadenza and credit notes', () => {
    expect(isSupplierDueDatePayable(0, 'TD01')).toBe(false)
    expect(isSupplierDueDatePayable(50, 'TD04')).toBe(false)
  })
})

describe('canEditSupplierDueDates', () => {
  it('is editable without payments', () => {
    expect(canEditSupplierDueDates({ document_type: 'TD01', due_dates: [dueDate()] })).toBe(true)
    expect(canEditSupplierDueDates({ document_type: 'TD01', due_dates: undefined })).toBe(true)
  })

  it('locks once any scadenza holds a payment', () => {
    const paid = dueDate({ paid_amount: '10.00' })
    expect(canEditSupplierDueDates({ document_type: 'TD01', due_dates: [dueDate(), paid] })).toBe(false)
  })

  it('locks credit notes', () => {
    expect(canEditSupplierDueDates({ document_type: 'TD04', due_dates: [] })).toBe(false)
  })
})

describe('cedenteName', () => {
  it('prefers the company name, else joins first and last name', () => {
    expect(cedenteName({ name: 'ACME Srl' })).toBe('ACME Srl')
    expect(cedenteName({ first_name: 'Mario', last_name: 'Rossi' })).toBe('Mario Rossi')
    expect(cedenteName(null as SupplierInvoice['cedente_snapshot'])).toBe('')
  })
})

describe('flattenValues', () => {
  it('joins non-empty scalars, nested objects included', () => {
    expect(flattenValues({ street: 'Via Roma 1', zip: '20100', city: 'Milano', extra: '', n: null })).toBe(
      'Via Roma 1 · 20100 · Milano',
    )
    expect(flattenValues({ id: 'PO-1', meta: { date: '2026-01-02' } })).toBe('PO-1 · 2026-01-02')
  })
})

describe('formatCalendarDay', () => {
  it('keeps the stored calendar day', () => {
    expect(formatCalendarDay('2026-03-31')).toBe(
      new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeZone: 'UTC' }).format(
        new Date(Date.UTC(2026, 2, 31)),
      ),
    )
    expect(formatCalendarDay(null)).toBe('-')
  })
})
