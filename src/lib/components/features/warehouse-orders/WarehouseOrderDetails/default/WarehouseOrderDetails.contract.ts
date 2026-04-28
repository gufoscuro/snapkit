import { Type } from '@sinclair/typebox'
import type { ComponentContract } from '$lib/contexts/page-state'

const WarehouseOrderStateSchema = Type.Union([Type.Literal('open'), Type.Literal('handed_over')])

const WarehouseOrderTagSchema = Type.Union([Type.Literal('transport_document_generated')])

const WarehouseOrderPickingStatusSchema = Type.Union([
  Type.Literal('not_started'),
  Type.Literal('partial'),
  Type.Literal('full'),
  Type.Null(),
])

export const WarehouseOrderDataSchema = Type.Object({
  id: Type.String(),
  document_number: Type.String(),
  document_date: Type.String(),
  sales_transaction_type: Type.String(),
  customer_id: Type.String(),
  ship_to_address_id: Type.String(),
  warehouse_id: Type.String(),
  planned_ship_date: Type.String(),
  carrier_id: Type.String(),
  shipping_method: Type.Union([Type.String(), Type.Null()]),
  incoterm: Type.String(),
  incoterm_location: Type.String(),
  notes_internal: Type.String(),
  state: WarehouseOrderStateSchema,
  tags: Type.Array(WarehouseOrderTagSchema),
  picking_status: WarehouseOrderPickingStatusSchema,
  handed_over_at: Type.String(),
  version: Type.Number(),
})

/**
 * Contract for WarehouseOrderDetails component.
 * - Provides: warehouseOrder data (shared with sidebar and other consumers on the page)
 * - Consumes: nothing
 */
export const WarehouseOrderDetailsContract = {
  $id: 'WarehouseOrderDetails',
  provides: {
    warehouseOrder: WarehouseOrderDataSchema,
  },
  consumes: {},
} as const satisfies ComponentContract
