import type {
  ItemPriceHistoryAggregates,
  ItemPriceHistorySummary,
  ItemSalesOrderLine,
} from '$lib/types/api-types'

/**
 * Mock data for ItemPriceHistory preview — the backend's own example, which is
 * the whole feature in two rows: 100 pieces went at €5, 1 piece went at €10.
 *
 * Note row 2: `unit_price` is 6 but `effective_unit_price` is 5, because of the
 * 16.67% discount. Rendering `unit_price` would show €6 for a line we sold at €5.
 */
export const mockSalesOrderLines: ItemSalesOrderLine[] = [
  {
    document_id: '019fad1d-51d3-71aa-8e67-0cf7d342ac46',
    document_number: 'SO-2025-0913',
    document_date: '2025-09-02',
    state: 'approved',
    currency: 'EUR',
    customer_id: '019fad1d-51c0-71cc-ba83-6b4401065aa9',
    customer_name: 'Bianchi SpA',
    line_id: '019fad1d-51d5-705a-96a0-99e90c656d9a',
    description: 'Flangia zincata DN50',
    quantity: 1,
    uom: 'PZ',
    unit_price: 10,
    discount_percent: null,
    discount_amount: null,
    net_value: 10,
    effective_unit_price: 10,
    sales_transaction_type: 'VEN',
    is_historical: false,
  },
  {
    document_id: '019fad1d-51cd-7363-901d-af72d1455c45',
    document_number: 'SO-2025-0412',
    document_date: '2025-03-11',
    state: 'approved',
    currency: 'EUR',
    customer_id: '019fad1d-51c0-71cc-ba83-6b4401065aa9',
    customer_name: 'Bianchi SpA',
    line_id: '019fad1d-51d0-71bd-a63a-06a2ba3aa53a',
    description: 'Flangia zincata DN50',
    quantity: 100,
    uom: 'PZ',
    unit_price: 6,
    discount_percent: 16.67,
    discount_amount: null,
    net_value: 500,
    effective_unit_price: 5,
    sales_transaction_type: 'VEN',
    is_historical: false,
  },
]

/**
 * The weighted average is 510/101 = 5.0495, not the plain mean of 5 and 10
 * (7.50): almost all the volume went at €5.
 */
export const mockSummary: ItemPriceHistorySummary = {
  line_count: 2,
  total_quantity: 101,
  min_price: 5,
  max_price: 10,
  weighted_average_price: 5.0495,
  last_price: 10,
  last_date: '2025-09-02',
}

export const mockAggregates: ItemPriceHistoryAggregates = {
  summary: mockSummary,
  mixed_uom: false,
  mixed_currency: false,
}

/** The edge case: the summary is suppressed and the UI must say why. */
export const mockMixedUomAggregates: ItemPriceHistoryAggregates = {
  summary: null,
  mixed_uom: true,
  mixed_currency: false,
}
