/**
 * Centralized API type definitions
 *
 * This file contains all TypeScript types for API responses across the application.
 * Types should be organized by API namespace (supply-api, product-api, sales-api, etc.)
 */

// ============================================================================
// Supply API Types
// ============================================================================

/**
 * Raw material summary from supply-api GET /raw-material endpoint
 */
export type RawMaterialSummary = {
  id?: string
  external_id: string
  name: string
  description?: string
  categories: string[]
  supplier_id: string
  supplier_attr?: {
    address?: string
    country?: string
    id?: string
    name: string
    vat: string
  }
  uom: string
  minimum_quantity: number
  lead_time?: string
  prod_id?: string
  /** Pricing information including unit price, currency, VAT, and volume discounts */
  prices?: {
    base_price?: number
    currency: 'EUR' | 'USD' | 'GBP'
    deals?: Array<{
      category?: string
      min_quantity: number
      unit: number
    }>
    discount_percent?: number
    unit: number
    vat?: number
  }
  aggregate_of_id?: string
  aggregate_quantity?: number
  purchasable_product_id?: string
  created?: {
    at: string
    by: {
      full_name: string
      id: string
      username: string
    }
  }
}

/**
 * Supply order summary from supply-api GET /order endpoint
 */
export type SupplyOrderSummary = {
  id?: string
  name: string
  internal_id?: string
  status: 'draft' | 'sent' | 'accepted' | 'shipped' | 'rejected'
  expected_delivery_time: string
  total_vat_incl: number
  default_currency?: string
  supplier_attr?: {
    id?: string
    name: string
    vat: string
  }
  warehouse_attr?: {
    id: string
    name: string
  }
}

/**
 * Supply order details from supply-api GET /order/{orderId} endpoint
 */
export type SupplyOrderDetails = SupplyOrderSummary & {
  archived?: boolean
  created?: {
    at: string
    by: {
      full_name: string
      id: string
      username: string
    }
  }
  updated?: {
    at: string
    by: {
      full_name: string
      id: string
      username: string
    }
  }
  custom_form_values?: {
    generation?: number
    values?: Array<{
      filters?: Array<{ name: string; value: string }>
      index: number
      label: string
      name: string
      type: string
      value?: unknown
    }>
  }
  foreign_ids?: Record<string, unknown>
  notes?: string
  version: number
  buyer_attr?: {
    address?: string
    country?: string
    id?: string
    name: string
    vat: string
  }
  payment_method: string
  raw_materials: Array<{
    external_lot?: string
    extra_id: string
    id?: string
    item_id?: string
    lot?: string
    meta?: Record<string, unknown>
    name: string
    order_id?: string
    prices?: {
      base_price?: number
      currency: 'EUR' | 'USD' | 'GBP'
      deals?: Array<{
        category?: string
        min_quantity: number
        unit: number
      }>
      discount_percent?: number
      unit: number
      vat?: number
    }
    quantity: number
    uom: string
  }>
  shipping_address: string
  supplier_id: string
  total: number
}

// ============================================================================
// Sales API Types
// ============================================================================

/**
 * Sales order summary from sales-api GET /order endpoint
 */
export type SalesOrderSummary = {
  id?: string
  internal_id?: string
  external_id?: string
  status: 'draft' | 'accepted' | 'sent'
  shipped?: 'completed' | 'not shipped' | 'partial'
  expected_shipping_time: string
  total_vat_incl: number
  default_currency?: string
  time?: string
  priority?: number
  customer_attr?: {
    id?: string
    name: string
    vat: string
    address?: string
    country?: string
  }
  sales_channel_attr?: {
    id: string
    name: string
    extra_id?: string
  }
}

// ============================================================================
// Product API Types
// ============================================================================

/**
 * Product summary from product-api GET /product endpoint
 */
export type ProductSummary = {
  id?: string
  name: string
  internal_id?: string
  semi_id?: string
  master_type?: string
  categories: string[]
  type: 'producible' | 'purchasable' | 'bundle'
  uom: string
  /** Pricing information including unit price, currency, VAT, and volume discounts */
  prices: {
    base_price?: number
    currency: 'EUR' | 'USD' | 'GBP'
    deals?: Array<{
      category?: string
      min_quantity: number
      unit: number
    }>
    discount_percent?: number
    unit: number
    vat?: number
  }
  created?: {
    at: string
    by: {
      full_name: string
      id: string
      username: string
    }
  }
}

/**
 * Product inventory item summary from product-api GET /inventory/product endpoint
 */
export type ProductInventoryItemSummary = {
  id?: string
  name: string
  internal_id: string
  product_id: string
  lot?: string
  external_lot?: string
  order_id?: string
  order_external_id?: string
  order_internal_id?: string
  semi_id?: string
  uom: string
  categories: string[]
  buckets?: {
    available?: number
    committed?: number
    in_stock?: number
  }
  warehouse_id?: string
  warehouse_attr?: {
    id: string
    name: string
    supplier_id?: string
  }
  created?: {
    at: string
    by: {
      full_name: string
      id: string
      username: string
    }
  }
}

/**
 * Price calculation result from sales-api POST /customer/{customerId}/products/{productId}/_calculate-price
 */
export type CalculatePriceResult = {
  /** The applicable unit price before discount */
  applicable_price: number
  /** The absolute discount amount per unit */
  discount_amount: number
  /** The discount percentage applied (0-100) */
  discount_percent: number
  /** The final unit price after discount */
  final_price: number
  /** Profit margin percentage. Null if no purchase cost is available. */
  margin_percent?: number
  /** Applied offer details if any */
  applied_offer?: {
    offer_id?: string
    offer_internal_id?: string
  }
}
