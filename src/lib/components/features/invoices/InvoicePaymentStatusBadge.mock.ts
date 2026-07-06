import type { InvoicePaymentStatus } from '$lib/types/api-types'

/**
 * Mock props for InvoicePaymentStatusBadge component preview.
 */
export const mockPaidStatus: { status: InvoicePaymentStatus } = { status: 'paid' }

export const mockPartiallyPaidStatus: { status: InvoicePaymentStatus } = { status: 'partially_paid' }

export const mockUnpaidStatus: { status: InvoicePaymentStatus } = { status: 'unpaid' }

/** Default export for simple use case */
export default mockPartiallyPaidStatus
