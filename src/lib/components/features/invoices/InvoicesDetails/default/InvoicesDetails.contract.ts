import { Type } from '@sinclair/typebox'
import type { ComponentContract } from '$lib/contexts/page-state'

const InvoiceDocumentTypeSchema = Type.Union([
  Type.Literal('TD01'),
  Type.Literal('TD02'),
  Type.Literal('TD04'),
  Type.Literal('TD05'),
  Type.Literal('TD24'),
  Type.Literal('TD25'),
])

const InvoiceStateSchema = Type.Union([
  Type.Literal('draft'),
  Type.Literal('sent'),
  Type.Literal('delivered'),
  Type.Literal('accepted'),
  Type.Literal('rejected'),
  Type.Literal('archived'),
  Type.Literal('error'),
])

export const InvoiceDataSchema = Type.Object({
  id: Type.String(),
  document_number: Type.String(),
  document_date: Type.String(),
  document_type: InvoiceDocumentTypeSchema,
  customer_id: Type.String(),
  sales_order_id: Type.String(),
  payment_term_id: Type.String(),
  legal_entity_bank_id: Type.String(),
  currency: Type.String(),
  total_net: Type.Number(),
  total_tax: Type.Number(),
  total_amount: Type.Number(),
  state: InvoiceStateSchema,
  notes_external: Type.String(),
  notes_internal: Type.String(),
  version: Type.Number(),
  available_transitions: Type.Optional(Type.Array(Type.String())),
})

/**
 * Contract for InvoicesDetails component.
 * - Provides: invoice data (shared with sidebar/sibling snippets on the page)
 * - Consumes: nothing
 */
export const InvoicesDetailsContract = {
  $id: 'InvoicesDetails',
  provides: {
    invoice: InvoiceDataSchema,
  },
  consumes: {},
} as const satisfies ComponentContract
