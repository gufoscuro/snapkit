import { Type } from '@sinclair/typebox'
import type { ComponentContract } from '$lib/contexts/page-state'

/**
 * Schema for the customer data consumed by this component.
 * Matches the shape provided by CustomerDetails.
 */
const AtecoCodeSchema = Type.Union([
  Type.Literal('A'), Type.Literal('B'), Type.Literal('C'), Type.Literal('D'),
  Type.Literal('E'), Type.Literal('F'), Type.Literal('G'), Type.Literal('H'),
  Type.Literal('I'), Type.Literal('J'), Type.Literal('K'), Type.Literal('L'),
  Type.Literal('M'), Type.Literal('N'), Type.Literal('O'), Type.Literal('P'),
  Type.Literal('Q'), Type.Literal('R'), Type.Literal('S'), Type.Literal('T'),
  Type.Literal('U'), Type.Literal('V'),
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

const AnnualRevenueRangeSchema = Type.Union([
  Type.Literal('under_2m'),
  Type.Literal('2m_10m'),
  Type.Literal('10m_50m'),
  Type.Literal('50m_250m'),
  Type.Literal('over_250m'),
])

const CustomerDataSchema = Type.Object({
  id: Type.String(),
  type: Type.Union([
    Type.Literal('company'),
    Type.Literal('individual'),
    Type.Literal('public_entity'),
    Type.Literal('consortium'),
    Type.Literal('association'),
  ]),
  status: Type.Union([
    Type.Literal('active'),
    Type.Literal('suspended'),
    Type.Literal('blocked'),
    Type.Literal('ceased'),
    Type.Literal('prospect'),
  ]),
  name: Type.String(),
  last_name: Type.String(),
  trade_name: Type.String(),
  eori_code: Type.String(),
  ateco_code: Type.Union([AtecoCodeSchema, Type.Null()]),
  parent_id: Type.String(),
  company_size: Type.Union([CompanySizeSchema, Type.Null()]),
  employee_count_range: Type.Union([EmployeeCountRangeSchema, Type.Null()]),
  annual_revenue_range: Type.Union([AnnualRevenueRangeSchema, Type.Null()]),
  founded_year: Type.Number(),
  language_code: Type.String(),
  registration_country_code: Type.String(),
  vat_number: Type.String(),
  tax_id: Type.String(),
  sdi_code: Type.String(),
  pec: Type.String(),
  email: Type.String(),
  phone: Type.String(),
  fax: Type.String(),
  website: Type.String(),
  notes: Type.String(),
  custom_fields: Type.Array(Type.Unknown()),
  version: Type.Number(),
})

/**
 * Contract for CustomerSidebar component.
 * - Provides: nothing
 * - Consumes: customer data (provided by CustomerDetails on the same page)
 */
export const CustomerSidebarContract = {
  $id: 'CustomerSidebar',
  provides: {},
  consumes: {
    customer: CustomerDataSchema,
  },
} as const satisfies ComponentContract
