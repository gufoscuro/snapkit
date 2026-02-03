/**
 * Currency Configuration
 *
 * Defines available currencies with their display properties.
 */

export type CurrencyConfig = {
  /** ISO 4217 currency code (e.g., 'EUR', 'USD') */
  code: string
  /** Currency symbol (e.g., '€', '$') */
  symbol: string
  /** Symbol position: 'before' or 'after' the amount */
  symbolPosition: 'before' | 'after'
  /** Number of decimal places */
  decimals: number
  /** Decimal separator for this currency's locale */
  decimalSeparator: '.' | ','
  /** Thousands separator for this currency's locale */
  thousandsSeparator: '.' | ',' | ' ' | '' | "'"
}

/**
 * Available currencies
 */
export const CURRENCIES: readonly CurrencyConfig[] = [
  {
    code: 'EUR',
    symbol: '€',
    symbolPosition: 'after',
    decimals: 2,
    decimalSeparator: ',',
    thousandsSeparator: '.',
  },
  {
    code: 'USD',
    symbol: '$',
    symbolPosition: 'before',
    decimals: 2,
    decimalSeparator: '.',
    thousandsSeparator: ',',
  },
  {
    code: 'GBP',
    symbol: '£',
    symbolPosition: 'before',
    decimals: 2,
    decimalSeparator: '.',
    thousandsSeparator: ',',
  },
  {
    code: 'JPY',
    symbol: '¥',
    symbolPosition: 'before',
    decimals: 0,
    decimalSeparator: '.',
    thousandsSeparator: ',',
  },
  {
    code: 'INR',
    symbol: '₹',
    symbolPosition: 'before',
    decimals: 2,
    decimalSeparator: '.',
    thousandsSeparator: ',',
  },
  {
    code: 'KRW',
    symbol: '₩',
    symbolPosition: 'before',
    decimals: 0,
    decimalSeparator: '.',
    thousandsSeparator: ',',
  },
  {
    code: 'RUB',
    symbol: '₽',
    symbolPosition: 'after',
    decimals: 2,
    decimalSeparator: ',',
    thousandsSeparator: ' ',
  },
  {
    code: 'TRY',
    symbol: '₺',
    symbolPosition: 'before',
    decimals: 2,
    decimalSeparator: ',',
    thousandsSeparator: '.',
  },
  {
    code: 'BRL',
    symbol: 'R$',
    symbolPosition: 'before',
    decimals: 2,
    decimalSeparator: ',',
    thousandsSeparator: '.',
  },
  {
    code: 'CAD',
    symbol: 'C$',
    symbolPosition: 'before',
    decimals: 2,
    decimalSeparator: '.',
    thousandsSeparator: ',',
  },
  {
    code: 'AUD',
    symbol: 'A$',
    symbolPosition: 'before',
    decimals: 2,
    decimalSeparator: '.',
    thousandsSeparator: ',',
  },
  {
    code: 'CHF',
    symbol: 'CHF',
    symbolPosition: 'after',
    decimals: 2,
    decimalSeparator: '.',
    thousandsSeparator: "'",
  },
  {
    code: 'HKD',
    symbol: 'HK$',
    symbolPosition: 'before',
    decimals: 2,
    decimalSeparator: '.',
    thousandsSeparator: ',',
  },
  {
    code: 'NZD',
    symbol: 'NZ$',
    symbolPosition: 'before',
    decimals: 2,
    decimalSeparator: '.',
    thousandsSeparator: ',',
  },
  {
    code: 'SGD',
    symbol: 'SGD',
    symbolPosition: 'before',
    decimals: 2,
    decimalSeparator: '.',
    thousandsSeparator: ',',
  },
] as const

/**
 * Default currency code
 */
export const DEFAULT_CURRENCY_CODE = 'EUR'

/**
 * Get default currency config
 */
export const DEFAULT_CURRENCY = CURRENCIES.find((c) => c.code === DEFAULT_CURRENCY_CODE)!
