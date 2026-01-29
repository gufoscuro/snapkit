/**
 * Number Formatting Utilities
 *
 * Locale-aware number formatting and parsing functions.
 */

/**
 * Convert dot decimal notation to comma (e.g., "1.50" -> "1,50")
 */
export function dotToComma(input: string): string {
  return input.replace(/\./g, ',')
}

/**
 * Convert comma decimal notation to dot (e.g., "1,50" -> "1.50")
 */
export function commaToDot(input: string): string {
  return input.replace(/,/g, '.')
}

/**
 * Parse a localized number string to float
 * Handles both comma and dot as decimal separators
 */
export function parseLocalizedNumber(input: string): number {
  if (!input) return 0

  // Remove thousands separators (spaces, dots used as thousands sep)
  let normalized = input.replace(/\s/g, '')

  // Determine decimal separator by finding the last occurrence of . or ,
  const lastDot = normalized.lastIndexOf('.')
  const lastComma = normalized.lastIndexOf(',')

  if (lastComma > lastDot) {
    // Comma is the decimal separator (European format)
    normalized = normalized.replace(/\./g, '').replace(',', '.')
  } else if (lastDot > lastComma) {
    // Dot is the decimal separator (US format)
    normalized = normalized.replace(/,/g, '')
  }

  const parsed = parseFloat(normalized)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Format a number with specified decimal places
 */
export function formatNumber(
  value: number,
  options: {
    decimals?: number
    decimalSeparator?: '.' | ','
    thousandsSeparator?: string
    useGrouping?: boolean
  } = {}
): string {
  const { decimals = 2, decimalSeparator = ',', thousandsSeparator = '.', useGrouping = true } = options

  const fixed = value.toFixed(decimals)
  const [intPart, decPart] = fixed.split('.')

  // Add thousands separator
  const formattedInt = useGrouping
    ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator)
    : intPart

  return decPart ? `${formattedInt}${decimalSeparator}${decPart}` : formattedInt
}

/**
 * Round a number to specified decimal places
 */
export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
