import type { Currency } from '$lib/types/api-types'

/**
 * Mock props for PaymentProgressCell component preview.
 */
export const mockPartiallyCollected: { residual: number; paid: number; total: number; currency: Currency } = {
  residual: 610.0,
  paid: 400.0,
  total: 1010.0,
  currency: 'EUR',
}

export const mockFullyCollected: { residual: number; paid: number; total: number; currency: Currency } = {
  residual: 0,
  paid: 1010.0,
  total: 1010.0,
  currency: 'EUR',
}

export const mockUncollected: { residual: number; paid: number; total: number; currency: Currency } = {
  residual: 1010.0,
  paid: 0,
  total: 1010.0,
  currency: 'EUR',
}

/** Default export for simple use case */
export default mockPartiallyCollected
