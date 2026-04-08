import { Type } from '@sinclair/typebox'
import type { ComponentContract } from '$lib/contexts/page-state'

const QuotationStatusSchema = Type.Union([
  Type.Literal('open'),
  Type.Literal('approved'),
  Type.Literal('rejected'),
  Type.Literal('superseded'),
])

const QuotationTagSchema = Type.Union([
  Type.Literal('expired'),
  Type.Literal('sent'),
])

export const QuotationDataSchema = Type.Object({
  id: Type.String(),
  document_number: Type.String(),
  revision_number: Type.Number(),
  parent_id: Type.String(),
  document_date: Type.String(),
  sales_transaction_type: Type.String(),
  customer_id: Type.String(),
  currency: Type.String(),
  valid_from: Type.String(),
  valid_to: Type.String(),
  payment_term_id: Type.String(),
  incoterm: Type.String(),
  incoterm_location: Type.String(),
  state: QuotationStatusSchema,
  tags: Type.Array(QuotationTagSchema),
  net_value: Type.Number(),
  gross_value: Type.Number(),
  notes_internal: Type.String(),
  notes_external: Type.String(),
  version: Type.Number(),
})

/**
 * Contract for QuotationDetails component.
 * - Provides: quotation data (shared with sidebar and other consumers on the page)
 * - Consumes: nothing
 */
export const QuotationDetailsContract = {
  $id: 'QuotationDetails',
  provides: {
    quotation: QuotationDataSchema,
  },
  consumes: {},
} as const satisfies ComponentContract
