import type { ComponentContract } from '$lib/contexts/page-state'
import { Type } from '@sinclair/typebox'

/**
 * Schema for the supplier data provided by this component.
 * Matches the Supplier type from api-types.ts.
 */
const AtecoCodeSchema = Type.Union([
  Type.Literal('A'),
  Type.Literal('B'),
  Type.Literal('C'),
  Type.Literal('D'),
  Type.Literal('E'),
  Type.Literal('F'),
  Type.Literal('G'),
  Type.Literal('H'),
  Type.Literal('I'),
  Type.Literal('J'),
  Type.Literal('K'),
  Type.Literal('L'),
  Type.Literal('M'),
  Type.Literal('N'),
  Type.Literal('O'),
  Type.Literal('P'),
  Type.Literal('Q'),
  Type.Literal('R'),
  Type.Literal('S'),
  Type.Literal('T'),
  Type.Literal('U'),
  Type.Literal('V'),
])

const CompanySizeSchema = Type.Union([
  Type.Literal('micro'),
  Type.Literal('small'),
  Type.Literal('medium'),
  Type.Literal('large'),
  Type.Literal('enterprise'),
])

const EmployeeCountRangeSchema = Type.Union([
  Type.Literal('1_9'),
  Type.Literal('10_49'),
  Type.Literal('50_249'),
  Type.Literal('250_999'),
  Type.Literal('1000_plus'),
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

export const SupplierDataSchema = Type.Object({
  id: Type.String(),
  type: Type.Union([
    Type.Literal('courier'),
  ]),
  status: Type.Union([
    Type.Literal('active'),
    Type.Literal('suspended'),
    Type.Literal('ceased'),
    Type.Literal('prospect'),
  ]),
  name: Type.String(),
  trade_name: Type.String(),
  ateco_code: Type.Union([AtecoCodeSchema, Type.Null()]),
  parent_id: Type.String(),
  company_size: Type.Union([CompanySizeSchema, Type.Null()]),
  employee_count_range: Type.Union([EmployeeCountRangeSchema, Type.Null()]),
  language_code: Type.String(),
  default_currency: CurrencySchema,
  registration_country_code: Type.String(),
  vat_number: Type.String(),
  tax_id: Type.String(),
  pec: Type.String(),
  email: Type.String(),
  phone: Type.String(),
  fax: Type.String(),
  website: Type.String(),
  notes: Type.String(),
  custom_fields: Type.Record(Type.String(), Type.Unknown()),
  version: Type.Number(),
})

/**
 * Contract for SupplierDetails component.
 * - Provides: supplier data (shared with sidebar and other consumers on the page)
 * - Consumes: nothing
 */
export const SupplierDetailsContract = {
  $id: 'SupplierDetails',
  provides: {
    supplier: SupplierDataSchema,
  },
  consumes: {},
} as const satisfies ComponentContract
