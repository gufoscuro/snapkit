/**
 * Unit of Measure Utilities
 *
 * Functions to work with UOMs defined in $lib/config/uoms.ts
 */

import { UOMS, UOM_ALIASES, UnitOfMeasures, type UOMConfig } from '$lib/config/uoms'
import * as m from '$lib/paraglide/messages'
import type { ExtendedOption } from './generics'

// Re-export constants for convenience
export { UnitOfMeasures, type UOMConfig } from '$lib/config/uoms'

/**
 * Find a UOM config by ID
 */
export function findUOM(uomId: string): UOMConfig | undefined {
  return UOMS.find((uom) => uom.id === uomId)
}

/**
 * UOM message lookup table - maps i18n keys to message functions
 * This allows type-safe dynamic access to Paraglide messages
 */
const UOM_MESSAGES: Record<string, () => string> = {
  uom_unit: m.uom_unit,
  uom_liter: m.uom_liter,
  uom_meter: m.uom_meter,
  uom_kilogram: m.uom_kilogram,
  uom_square_meter: m.uom_square_meter,
  uom_square_decimeter: m.uom_square_decimeter,
  uom_box: m.uom_box,
  uom_bottle: m.uom_bottle,
  uom_roll: m.uom_roll,
  uom_sheet: m.uom_sheet,
  uom_reel: m.uom_reel,
  uom_cone: m.uom_cone,
  uom_pq: m.uom_pq,
  uom_cq: m.uom_cq,
  uom_dq: m.uom_dq,
  uom_mgl: m.uom_mgl,
}

/**
 * Get the display label for a UOM (localized)
 */
export function getUOMDisplayedSymbol(uomId: string): string {
  const uom = findUOM(uomId)
  if (!uom) return uomId

  const messageFn = UOM_MESSAGES[uom.i18nKey]
  return messageFn ? messageFn() : uomId
}

/**
 * Get the step increment for a UOM
 */
export function getUOMStep(uomId: string): number {
  return findUOM(uomId)?.step ?? 1
}

/**
 * Get the minimum quantity for a UOM
 */
export function getUOMMinQuantity(uomId: string): number {
  return findUOM(uomId)?.minimumQuantity ?? 1
}

/**
 * Validate if a UOM ID exists
 */
export function validateUOM(uomId: string): boolean {
  if (!uomId) return false
  if (uomId === UnitOfMeasures.Unset) return false
  return UOMS.some((uom) => uom.id === uomId)
}

/**
 * Get dropdown options for base (non-aggregate) UOMs
 */
export function getUnitOfMeasureOptions(): Array<ExtendedOption> {
  return UOMS.filter((uom) => !uom.aggregate).map((uom) => ({
    label: getUOMDisplayedSymbol(uom.id),
    value: uom.id,
  }))
}

/**
 * Get dropdown options for aggregate UOMs
 */
export function getAggregateUnitOfMeasureOptions(): Array<ExtendedOption> {
  return UOMS.filter((uom) => uom.aggregate).map((uom) => ({
    label: getUOMDisplayedSymbol(uom.id),
    value: uom.id,
  }))
}

/**
 * Get all UOM options (both base and aggregate)
 */
export function getAllUnitOfMeasureOptions(): Array<ExtendedOption> {
  return UOMS.map((uom) => ({
    label: getUOMDisplayedSymbol(uom.id),
    value: uom.id,
  }))
}

/**
 * Find the best matching UOM ID from input string (fuzzy matching)
 *
 * @param inputUom - The UOM string to match (e.g., from extracted data)
 * @param fallbackToDefault - If true, returns 'unit' as fallback; otherwise returns 'UNSET_UOM'
 * @returns The best matching UOM ID
 */
export function getUomBestMatch(inputUom: string, fallbackToDefault: boolean = false): string {
  if (!inputUom || typeof inputUom !== 'string') {
    return fallbackToDefault ? UnitOfMeasures.Default : UnitOfMeasures.Unset
  }

  const normalizedInput = inputUom.trim().toLowerCase()

  // Try exact match first
  const exactMatch = UOMS.find((uom) => uom.id.toLowerCase() === normalizedInput)
  if (exactMatch) {
    return exactMatch.id
  }

  // Try alias match
  const aliasMatch = UOM_ALIASES[normalizedInput]
  if (aliasMatch) {
    const aliasUom = UOMS.find((uom) => uom.id === aliasMatch)
    if (aliasUom) {
      return aliasUom.id
    }
  }

  // Try partial match
  for (const uom of UOMS) {
    if (normalizedInput.includes(uom.id.toLowerCase()) || uom.id.toLowerCase().includes(normalizedInput)) {
      return uom.id
    }
  }

  return fallbackToDefault ? UnitOfMeasures.Default : UnitOfMeasures.Unset
}

/**
 * Check if a UOM is an aggregate type
 */
export function isAggregateUOM(uomId: string): boolean {
  return findUOM(uomId)?.aggregate ?? false
}

/**
 * Get UOMs filtered by category
 */
export function getUOMsByCategory(category: string): Array<ExtendedOption> {
  return UOMS.filter((uom) => uom.category === category).map((uom) => ({
    label: getUOMDisplayedSymbol(uom.id),
    value: uom.id,
  }))
}
