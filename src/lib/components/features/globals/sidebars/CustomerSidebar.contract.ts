import { Type } from '@sinclair/typebox'
import type { ComponentContract } from '$lib/contexts/page-state'

/**
 * Schema for the customer data consumed by this component.
 * Matches the shape provided by CustomerDetails.
 */
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
