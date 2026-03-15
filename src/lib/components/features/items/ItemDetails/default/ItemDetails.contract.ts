import type { ComponentContract } from '$lib/contexts/page-state'
import { Type } from '@sinclair/typebox'

const ItemCategorySchema = Type.Union([
  Type.Literal('finished_good'),
  Type.Literal('raw_material'),
  Type.Literal('semi_finished'),
  Type.Literal('component'),
  Type.Literal('phantom'),
  Type.Literal('packaging'),
  Type.Literal('subcontract'),
  Type.Literal('service_expense'),
  Type.Literal('kit'),
])

const ItemStatusSchema = Type.Union([
  Type.Literal('active'),
  Type.Literal('inactive'),
  Type.Literal('obsolete'),
])

const AbcClassSchema = Type.Union([
  Type.Literal('A'),
  Type.Literal('B'),
  Type.Literal('C'),
  Type.Literal('D'),
])

const UnitOfMeasureSchema = Type.Union([
  Type.Literal('PZ'),
  Type.Literal('KG'),
  Type.Literal('G'),
  Type.Literal('T'),
  Type.Literal('LT'),
  Type.Literal('ML'),
  Type.Literal('M'),
  Type.Literal('CM'),
  Type.Literal('MM'),
  Type.Literal('M2'),
  Type.Literal('M3'),
  Type.Literal('SET'),
  Type.Literal('BOX'),
  Type.Literal('PAL'),
  Type.Literal('ROL'),
  Type.Literal('FOG'),
  Type.Literal('PR'),
  Type.Literal('CF'),
  Type.Literal('H'),
  Type.Literal('NR'),
])

const WeightUnitSchema = Type.Union([
  Type.Literal('KG'),
  Type.Literal('G'),
  Type.Literal('LB'),
  Type.Literal('OZ'),
  Type.Literal('T'),
])

const DimensionUnitSchema = Type.Union([
  Type.Literal('MM'),
  Type.Literal('CM'),
  Type.Literal('M'),
  Type.Literal('IN'),
  Type.Literal('FT'),
])

const CurrencySchema = Type.Union([
  Type.Literal('EUR'),
  Type.Literal('USD'),
  Type.Literal('GBP'),
  Type.Literal('CHF'),
  Type.Literal('JPY'),
  Type.Literal('CNY'),
  Type.Literal('CAD'),
  Type.Literal('AUD'),
  Type.Literal('SEK'),
  Type.Literal('NOK'),
  Type.Literal('DKK'),
  Type.Literal('PLN'),
  Type.Literal('CZK'),
  Type.Literal('HUF'),
  Type.Literal('RON'),
  Type.Literal('BGN'),
  Type.Literal('TRY'),
  Type.Literal('BRL'),
  Type.Literal('INR'),
  Type.Literal('AED'),
  Type.Literal('SAR'),
])

const RelatedEntitySchema = Type.Object({
  id: Type.String(),
  code: Type.String(),
  name: Type.String(),
  description: Type.String(),
  is_active: Type.Boolean(),
})

export const ItemDataSchema = Type.Object({
  id: Type.String(),
  code: Type.String(),
  alternative_code: Type.String(),
  name: Type.String(),
  description: Type.String(),
  image: Type.String(),
  item_category: ItemCategorySchema,
  item_status: ItemStatusSchema,
  upc_ean_code: Type.String(),
  abc_class: Type.Union([AbcClassSchema, Type.Null()]),
  product_family: Type.Union([RelatedEntitySchema, Type.Null()]),
  product_line: Type.Union([RelatedEntitySchema, Type.Null()]),
  commodity_code: Type.Union([RelatedEntitySchema, Type.Null()]),
  primary_uom: Type.Union([UnitOfMeasureSchema, Type.Null()]),
  secondary_uom: Type.Union([UnitOfMeasureSchema, Type.Null()]),
  uom_conversion_factor: Type.Number(),
  gross_weight: Type.Number(),
  net_weight: Type.Number(),
  weight_uom: Type.Union([WeightUnitSchema, Type.Null()]),
  length: Type.Number(),
  width: Type.Number(),
  height: Type.Number(),
  dimension_uom: Type.Union([DimensionUnitSchema, Type.Null()]),
  standard_cost: Type.Number(),
  cost_currency: Type.Union([CurrencySchema, Type.Null()]),
  country_of_origin: Type.String(),
  hs_tariff_code: Type.String(),
  custom_fields: Type.Record(Type.String(), Type.Unknown()),
  notes: Type.String(),
  version: Type.Number(),
})

/**
 * Contract for ItemDetails component.
 * - Provides: item data (shared with sidebar and other consumers on the page)
 * - Consumes: nothing
 */
export const ItemDetailsContract = {
  $id: 'ItemDetails',
  provides: {
    item: ItemDataSchema,
  },
  consumes: {},
} as const satisfies ComponentContract
