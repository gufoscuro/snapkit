/**
 * Unit of Measure Configuration
 *
 * This file defines all available units of measure for the application.
 * Each UOM has properties that control how quantities are displayed and validated.
 */

export type UOMCategory = 'items' | 'liquids' | 'dimensions' | 'weight' | 'surface' | 'packaging' | 'textiles'

export type UOMConfig = {
  /** Unique identifier (e.g., 'unit', 'kilogram', 'meter') */
  id: string
  /** i18n message key for display (e.g., 'uom_unit', 'uom_kilogram') */
  i18nKey: string
  /** Whether this is an aggregate UOM (e.g., box, roll) vs base UOM (e.g., unit, kg) */
  aggregate: boolean
  /** Step increment for quantity inputs */
  step: number
  /** Minimum allowed quantity */
  minimumQuantity: number
  /** Category for grouping UOMs */
  category: UOMCategory
}

/**
 * All available units of measure
 */
export const UOMS: readonly UOMConfig[] = [
  // Base units
  { id: 'unit', i18nKey: 'uom_unit', aggregate: false, step: 1, minimumQuantity: 1, category: 'items' },
  { id: 'liter', i18nKey: 'uom_liter', aggregate: false, step: 0.5, minimumQuantity: 0.001, category: 'liquids' },
  { id: 'meter', i18nKey: 'uom_meter', aggregate: false, step: 0.1, minimumQuantity: 0.001, category: 'dimensions' },
  { id: 'kilogram', i18nKey: 'uom_kilogram', aggregate: false, step: 0.1, minimumQuantity: 0.001, category: 'weight' },
  { id: 'square_meter', i18nKey: 'uom_square_meter', aggregate: false, step: 0.1, minimumQuantity: 0.1, category: 'surface' },
  { id: 'square_decimeter', i18nKey: 'uom_square_decimeter', aggregate: false, step: 0.1, minimumQuantity: 1, category: 'surface' },

  // Aggregate units (packaging)
  { id: 'box', i18nKey: 'uom_box', aggregate: true, step: 1, minimumQuantity: 1, category: 'items' },
  { id: 'bottle', i18nKey: 'uom_bottle', aggregate: true, step: 1, minimumQuantity: 1, category: 'liquids' },
  { id: 'roll', i18nKey: 'uom_roll', aggregate: true, step: 1, minimumQuantity: 1, category: 'packaging' },
  { id: 'sheet', i18nKey: 'uom_sheet', aggregate: true, step: 1, minimumQuantity: 1, category: 'surface' },

  // Textile-specific
  { id: 'reel', i18nKey: 'uom_reel', aggregate: true, step: 1, minimumQuantity: 1, category: 'textiles' },
  { id: 'cone', i18nKey: 'uom_cone', aggregate: true, step: 1, minimumQuantity: 1, category: 'textiles' },
  { id: 'pq', i18nKey: 'uom_pq', aggregate: false, step: 0.1, minimumQuantity: 0.001, category: 'textiles' },
  { id: 'cq', i18nKey: 'uom_cq', aggregate: false, step: 0.1, minimumQuantity: 0.001, category: 'textiles' },
  { id: 'dq', i18nKey: 'uom_dq', aggregate: false, step: 0.1, minimumQuantity: 0.001, category: 'textiles' },
  { id: 'mgl', i18nKey: 'uom_mgl', aggregate: false, step: 0.001, minimumQuantity: 0.001, category: 'textiles' },
] as const

/**
 * Default UOM constants
 */
export const UnitOfMeasures = Object.freeze({
  /** Default base unit */
  Default: 'unit',
  /** Default aggregate unit */
  AggregateDefault: 'box',
  /** Placeholder for unset UOM */
  Unset: 'UNSET_UOM',
})

/**
 * Aliases for fuzzy matching UOM inputs
 * Maps common variations to canonical UOM IDs
 */
export const UOM_ALIASES: Readonly<Record<string, string>> = Object.freeze({
  // Units/Pieces
  pcs: 'unit',
  piece: 'unit',
  pieces: 'unit',
  pc: 'unit',
  units: 'unit',
  u: 'unit',
  each: 'unit',
  nr: 'unit',
  number: 'unit',
  pz: 'unit',
  pzi: 'unit',
  num: 'unit',

  // Weight
  kg: 'kilogram',
  kgs: 'kilogram',
  kilos: 'kilogram',
  kilo: 'kilogram',

  // Volume/Liquid
  l: 'liter',
  liters: 'liter',
  litres: 'liter',
  litre: 'liter',
  lt: 'liter',

  // Length/Dimensions
  m: 'meter',
  meters: 'meter',
  metres: 'meter',
  metre: 'meter',
  mt: 'meter',

  // Surface
  sqm: 'square_meter',
  m2: 'square_meter',
  'm²': 'square_meter',
  'square meter': 'square_meter',
  square_m: 'square_meter',
  sqdm: 'square_decimeter',
  dm2: 'square_decimeter',
  'dm²': 'square_decimeter',
  'square decimeter': 'square_decimeter',
  square_dm: 'square_decimeter',

  // Packaging
  boxes: 'box',
  bx: 'box',
  rolls: 'roll',
  rl: 'roll',
  sheets: 'sheet',
  sh: 'sheet',
  sht: 'sheet',

  // Textiles
  reels: 'reel',
  cones: 'cone',
  cn: 'cone',
})
