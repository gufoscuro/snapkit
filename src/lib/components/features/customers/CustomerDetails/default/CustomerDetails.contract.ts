import { Type } from '@sinclair/typebox'
import type { ComponentContract } from '$lib/contexts/page-state'

/**
 * Schema for the customer data provided by this component.
 * Matches the Customer type from api-types.ts.
 */
export const CustomerDataSchema = Type.Object({
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
  vat_number: Type.String(),
  tax_id: Type.String(),
  email: Type.String(),
  phone: Type.String(),
  pec: Type.String(),
  language_code: Type.String(),
  registration_country_code: Type.String(),
  version: Type.Number(),
})

/**
 * Contract for CustomerDetails component.
 * - Provides: customer data (shared with sidebar and other consumers on the page)
 * - Consumes: nothing
 */
export const CustomerDetailsContract = {
  $id: 'CustomerDetails',
  provides: {
    customer: CustomerDataSchema,
  },
  consumes: {},
} as const satisfies ComponentContract
