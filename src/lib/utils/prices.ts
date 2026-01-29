/**
 * Price Formatting Utilities
 *
 * Functions for formatting and parsing currency values.
 */

import {
  CURRENCIES,
  DEFAULT_CURRENCY,
  DEFAULT_CURRENCY_CODE,
  type CurrencyConfig,
} from '$lib/config/currencies'
import { commaToDot, dotToComma, formatNumber, parseLocalizedNumber } from './numbers'

// Re-export for convenience
export { DEFAULT_CURRENCY_CODE } from '$lib/config/currencies'

/**
 * Find a currency config by code
 */
export function findCurrency(code: string): CurrencyConfig | undefined {
  return CURRENCIES.find((c) => c.code === code)
}

/**
 * Get the currency symbol for display
 */
export function getCurrencySymbol(currencyCode: string): string {
  return findCurrency(currencyCode)?.symbol ?? currencyCode
}

/**
 * Format a price input string (used during typing)
 * Strips invalid characters and limits decimal places
 *
 * @param input - Raw input string
 * @param currencyCode - Currency code to determine decimal separator
 * @returns Formatted string suitable for display in input
 */
export function formatPriceInput(input: string, currencyCode: string = DEFAULT_CURRENCY_CODE): string {
  const currency = findCurrency(currencyCode) ?? DEFAULT_CURRENCY
  const decimalSep = currency.decimalSeparator

  // Remove all non-numeric characters except decimal separator
  const allowedChars = decimalSep === ',' ? /[^\d,]/g : /[^\d.]/g
  let cleaned = input.replace(allowedChars, '')

  // Handle multiple decimal separators - keep only the first
  const sepIndex = cleaned.indexOf(decimalSep)
  if (sepIndex !== -1) {
    const beforeSep = cleaned.substring(0, sepIndex)
    const afterSep = cleaned.substring(sepIndex + 1).replace(new RegExp(`\\${decimalSep}`, 'g'), '')
    // Limit decimal places
    const limitedDecimals = afterSep.substring(0, currency.decimals)
    cleaned = `${beforeSep}${decimalSep}${limitedDecimals}`
  }

  return cleaned
}

/**
 * Parse a price string to a float value
 */
export function parsePriceToFloat(input: string): number {
  return parseLocalizedNumber(input)
}

/**
 * Convert a float to a price display string
 *
 * @param value - Numeric value
 * @param currencyCode - Currency code for formatting
 * @returns Formatted price string (e.g., "1.234,56" for EUR)
 */
export function floatToPriceString(value: number, currencyCode: string = DEFAULT_CURRENCY_CODE): string {
  const currency = findCurrency(currencyCode) ?? DEFAULT_CURRENCY

  return formatNumber(value, {
    decimals: currency.decimals,
    decimalSeparator: currency.decimalSeparator,
    thousandsSeparator: currency.thousandsSeparator,
    useGrouping: false, // Don't use thousands separator in input fields
  })
}

/**
 * Format a price for display (with thousands separator)
 *
 * @param value - Numeric value
 * @param currencyCode - Currency code for formatting
 * @returns Formatted price string with thousands separator
 */
export function formatPriceDisplay(value: number, currencyCode: string = DEFAULT_CURRENCY_CODE): string {
  const currency = findCurrency(currencyCode) ?? DEFAULT_CURRENCY

  return formatNumber(value, {
    decimals: currency.decimals,
    decimalSeparator: currency.decimalSeparator,
    thousandsSeparator: currency.thousandsSeparator,
    useGrouping: true,
  })
}

/**
 * Render a complete price with currency symbol
 *
 * @param amount - Numeric amount
 * @param currencyCode - Currency code
 * @returns Formatted string like "€ 1.234,56" or "1.234,56 €"
 */
export function renderPrice(amount: number, currencyCode: string = DEFAULT_CURRENCY_CODE): string {
  const currency = findCurrency(currencyCode) ?? DEFAULT_CURRENCY
  const formattedAmount = formatPriceDisplay(amount, currencyCode)

  if (currency.symbolPosition === 'before') {
    return `${currency.symbol} ${formattedAmount}`
  }
  return `${formattedAmount} ${currency.symbol}`
}

/**
 * Type for price attribute objects (from API)
 */
export type PriceAttr = {
  unit?: number
  total?: number
  currency: string
}

/**
 * Render a unit price from a price attribute object
 */
export function renderUnitPrice(price: PriceAttr | undefined): string | undefined {
  if (!price?.unit) return undefined
  return renderPrice(price.unit, price.currency)
}

/**
 * Render a total price from a price attribute object
 */
export function renderTotalPrice(price: PriceAttr | undefined): string | undefined {
  if (!price?.total) return undefined
  return renderPrice(price.total, price.currency)
}
