import { Type } from '@sinclair/typebox'
import type { ComponentContract } from '$lib/contexts/page-state'

const SalesOrderStatusSchema = Type.Union([
  Type.Literal('open'),
  Type.Literal('approved'),
  Type.Literal('rejected'),
])

const SalesOrderTagSchema = Type.Union([
  Type.Literal('sent'),
])

const SalesOrderFulfillmentStatusSchema = Type.Union([
  Type.Literal('in_progress'),
  Type.Literal('picked'),
  Type.Literal('partially_shipped'),
  Type.Literal('fully_shipped'),
  Type.Null(),
])

export const SalesOrderDataSchema = Type.Object({
  id: Type.String(),
  document_number: Type.String(),
  document_date: Type.String(),
  sales_transaction_type: Type.String(),
  customer_id: Type.String(),
  currency: Type.String(),
  payment_term_id: Type.String(),
  incoterm: Type.String(),
  incoterm_location: Type.String(),
  customer_purchase_order: Type.String(),
  customer_purchase_order_date: Type.String(),
  legal_entity_bank_id: Type.String(),
  confirmation_date: Type.String(),
  requested_delivery_date: Type.String(),
  state: SalesOrderStatusSchema,
  tags: Type.Array(SalesOrderTagSchema),
  fulfillment_status: SalesOrderFulfillmentStatusSchema,
  net_value: Type.Number(),
  gross_value: Type.Number(),
  notes_internal: Type.String(),
  notes_external: Type.String(),
  version: Type.Number(),
})

/**
 * Contract for SalesOrderDetails component.
 * - Provides: salesOrder data (shared with sidebar and other consumers on the page)
 * - Consumes: nothing
 */
export const SalesOrderDetailsContract = {
  $id: 'SalesOrderDetails',
  provides: {
    salesOrder: SalesOrderDataSchema,
  },
  consumes: {},
} as const satisfies ComponentContract
