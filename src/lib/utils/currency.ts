/**
 * Currency Utilities
 *
 * Functions to work with currencies defined in $lib/config/currencies.ts
 */

import { CURRENCIES, DEFAULT_CURRENCY_CODE, type CurrencyConfig } from '$lib/config/currencies'
import type { ExtendedOption } from './generics'

// Re-export constants for convenience
export { DEFAULT_CURRENCY_CODE, type CurrencyConfig } from '$lib/config/currencies'

/**
 * Find a currency config by code
 */
export function findCurrency(code: string): CurrencyConfig | undefined {
  return CURRENCIES.find((c) => c.code === code)
}

/**
 * Get the currency symbol for display
 */
export function getCurrencySymbol(code: string): string {
  return findCurrency(code)?.symbol ?? code
}

/**
 * Get dropdown options for all available currencies
 * Returns options in format "€ (EUR)", "$ (USD)", etc.
 */
export function getCurrencyOptions(): Array<ExtendedOption> {
  return CURRENCIES.map((currency) => ({
    label: `${currency.symbol} (${currency.code})`,
    value: currency.code,
    attr: { displayed: currency.symbol },
  }))
}

/**
 * Validate if a currency code exists
 */
export function validateCurrency(code: string): boolean {
  if (!code) return false
  return CURRENCIES.some((c) => c.code === code)
}
