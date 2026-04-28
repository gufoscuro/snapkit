import { Type } from '@sinclair/typebox'
import type { ComponentContract } from '$lib/contexts/page-state'

const TransportDocumentStateSchema = Type.Union([Type.Literal('open'), Type.Literal('carried')])

const TransportDocumentInvoicingStatusSchema = Type.Union([
  Type.Literal('none'),
  Type.Literal('partial'),
  Type.Literal('full'),
  Type.Null(),
])

export const TransportDocumentDataSchema = Type.Object({
  id: Type.String(),
  document_number: Type.String(),
  document_date: Type.String(),
  sales_transaction_type: Type.String(),
  transport_document_type: Type.String(),
  customer_id: Type.String(),
  ship_to_address_id: Type.String(),
  warehouse_id: Type.String(),
  carrier_id: Type.String(),
  transport_reason: Type.String(),
  transport_method: Type.Union([Type.String(), Type.Null()]),
  shipping_date: Type.String(),
  shipping_time: Type.String(),
  packages_count: Type.Number(),
  gross_weight: Type.Number(),
  net_weight: Type.Number(),
  volume: Type.Number(),
  appearance: Type.String(),
  notes_external: Type.String(),
  notes_internal: Type.String(),
  return_deadline: Type.String(),
  incoterm: Type.String(),
  incoterm_location: Type.String(),
  state: TransportDocumentStateSchema,
  carried_at: Type.String(),
  invoicing_status: TransportDocumentInvoicingStatusSchema,
  version: Type.Number(),
})

/**
 * Contract for TransportDocumentDetails component.
 * - Provides: transportDocument data (shared with sidebar and other consumers on the page)
 * - Consumes: nothing
 */
export const TransportDocumentDetailsContract = {
  $id: 'TransportDocumentDetails',
  provides: {
    transportDocument: TransportDocumentDataSchema,
  },
  consumes: {},
} as const satisfies ComponentContract
