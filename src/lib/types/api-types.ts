/**
 * Centralized API type definitions
 *
 * This file contains all TypeScript types for API responses across the application.
 * Types should be organized by API namespace (supply-api, product-api, sales-api, etc.)
 */

// ============================================================================
// Common/Shared Types
// ============================================================================

/**
 * Address information (used across multiple entities)
 */
export type AddressAttr = {
  /** Address label/name (e.g., "Main Office", "Warehouse") */
  name: string
  /** Full address string */
  address: string
  /** ISO 3166-1 alpha-2 country code */
  country: string
}

/**
 * Email information (used across multiple entities)
 */
export type EmailAttr = {
  /** Email label/name (e.g., "Main", "Billing", "Support") */
  name: string
  /** Email address */
  email: string
}

/**
 * Phone information (used across multiple entities)
 */
export type PhoneAttr = {
  /** Phone label/name (e.g., "Main", "Mobile", "Office") */
  name: string
  /** Phone number */
  phone: string
}

/**
 * Attribute key-value pair (used for custom metadata)
 */
export type AttributeAttr = {
  /** Attribute name/key */
  name: string
  /** Attribute value */
  value: string
}

/**
 * Price deal/tier (volume-based pricing)
 */
export type PriceDealAttr = {
  /** Minimum quantity for this price tier */
  min_quantity: number
  /** Unit price for this tier */
  unit: number
  /** Optional category/label (e.g., "Wholesale", "Bulk") */
  category?: string
}

/**
 * Pricing information (used across products, materials, etc.)
 */
export type PricesAttr = {
  /** Currency code (ISO 4217) */
  currency: 'EUR' | 'USD' | 'GBP'
  /** Unit price */
  unit: number
  /** VAT percentage */
  vat?: number
  /** Base price before discounts */
  base_price?: number
  /** Discount percentage (0-100) */
  discount_percent?: number
  /** Volume-based pricing tiers */
  deals?: PriceDealAttr[]
}

// ============================================================================
// Supply API Types
// ============================================================================

/**
 * Supplier summary from supply-api GET /supplier endpoint
 */
export type SupplierSummary = {
  id?: string
  name: string
  vat_no: string
  categories: string[]
  default_currency: string
  emails: EmailAttr[]
  phones: PhoneAttr[]
  mode?: 'ordinary' | 'self'
}

/**
 * Bank information for suppliers
 */
export type BankAttr = {
  /** IBAN code */
  iban?: string
  /** Bank name */
  name?: string
  /** SWIFT/BIC code */
  swift?: string
}

/**
 * Supplier details from supply-api GET /supplier/{supplierId} endpoint
 */
export type SupplierDetails = SupplierSummary & {
  /** Addresses (physical locations) */
  addresses: AddressAttr[]
  /** Bank account information */
  bank: BankAttr
  /** Primary contact person name */
  contact_name?: string
  /** Supplier description */
  description?: string
  /** Payment method (e.g., "bank_transfer", "paypal") */
  payment_method?: string
  /** Website URL */
  website?: string
  /** Internal notes */
  notes?: string
  /** Archived status */
  archived?: boolean
  /** Record version */
  version: number
  /** Creation metadata */
  created?: {
    at: string
    by: {
      full_name: string
      id: string
      username: string
    }
  }
  /** Last update metadata */
  updated?: {
    at: string
    by: {
      full_name: string
      id: string
      username: string
    }
  }
  /** Custom form values */
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
  /** Foreign IDs mapping */
  foreign_ids?: Record<string, unknown>
}

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
 * Customer summary from sales-api GET /customer endpoint
 */
export type CustomerSummary = {
  id?: string
  name: string
  vat_no: string
  categories: string[]
  default_currency: string
  emails: Array<{ email: string; name: string }>
  phones: Array<{ name: string; phone: string }>
}

/**
 * Sales channel summary from sales-api GET /sales-channel endpoint
 */
export type SalesChannelSummary = {
  id?: string
  name: string
  status: 'active' | 'inactive'
  type: 'b2b' | 'e-commerce'
}

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

export interface DataWrapper<T> {
  data: T
}

// ============================================================================
// User / Auth API Types
// ============================================================================

/**
 * Permission enum values
 */
export type Permission =
  | 'view-users'
  | 'create-users'
  | 'edit-users'
  | 'delete-users'
  | 'view-teams'
  | 'create-teams'
  | 'edit-teams'
  | 'delete-teams'
  | 'manage-roles'
  | 'view-legal-entities'
  | 'view-customers'
  | 'create-customers'
  | 'edit-customers'
  | 'delete-customers'

/**
 * Legal entity from GET /api/user or GET /api/legal-entities
 */
export type LegalEntity = {
  id: string
  name: string
  created_at: string
  updated_at: string
}

/**
 * User resource from GET /api/user endpoint
 */
export type UserResource = {
  id: string
  name: string
  email: string
  is_superadmin: boolean
  tenant?: {
    id: string
    name: string
    vanity: string
    legal_entities?: LegalEntity[]
  }
  team?: {
    id: string
    name: string
  }
  roles?: Array<{ name: string }>
  all_permissions: Permission[]
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
