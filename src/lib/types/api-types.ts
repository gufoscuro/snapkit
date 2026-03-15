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
  currency: Currency
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
    currency: Currency
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
      currency: Currency
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
    currency: Currency
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

// ============================================================================
// Settings / Configuration Types
// ============================================================================

/**
 * Product family from Moddo API GET /api/legal-entities/{legalEntity}/product-families
 */
export type ProductFamily = {
  id: string
  code: string
  name: string
  description: string
  is_active: boolean
}

export type CommodityCode = {
  id: string
  code: string
  name: string
  description: string
  is_active: boolean
}

export type ProductLine = {
  id: string
  code: string
  name: string
  description: string
  is_active: boolean
}

// ============================================================================
// Warehouse Types
// ============================================================================

export type WarehouseType =
  | 'main'
  | 'consignment'
  | 'subcontracting'
  | 'returns'
  | 'defective'
  | 'spare_parts'
  | 'transit'
  | 'quarantine'

export type ValuationMethod = 'weighted_average' | 'fifo' | 'standard' | 'last_cost'

/**
 * Warehouse from Moddo API GET /api/legal-entities/{legalEntity}/warehouses
 */
export type LegalEntityWarehouse = {
  id: string
  code: string
  description: string
  warehouse_type: WarehouseType
  is_negative_allowed: boolean
  valuation_method: ValuationMethod
  is_active: boolean
  version: number
}

export type ZoneType = 'receiving' | 'storage' | 'shipping' | 'quarantine' | 'production'
export type BinLocationType = 'shelf' | 'floor' | 'cell' | 'picking' | 'bulk'

/**
 * Warehouse address from Moddo API GET /api/legal-entities/{legalEntity}/warehouses/{warehouse}/address
 */
export type WarehouseAddress = {
  id: string
  address_line_1: string
  address_line_2: string
  city: string
  province: string
  postal_code: string
  country_code: string
  version: number
}

/**
 * Warehouse zone from Moddo API GET /api/legal-entities/{legalEntity}/warehouses/{warehouse}/zones
 */
export type WarehouseZone = {
  id: string
  code: string
  description: string
  zone_type: ZoneType
  version: number
}

/**
 * Warehouse bin from Moddo API GET /api/legal-entities/{legalEntity}/warehouses/{warehouse}/zones/{zone}/bins
 */
export type WarehouseBin = {
  id: string
  code: string
  description: string
  location_type: BinLocationType
  max_weight_kg: number
  max_volume_m3: number
  is_active: boolean
  is_default: boolean
  version: number
}

/**
 * Legal entity bank from Moddo API GET /api/legal-entities/{legalEntity}/banks
 */
export type LegalEntityBank = {
  id: string
  code: string
  name: string
  branch: string
  abi: string
  cab: string
  cin: string
  account_number: string
  iban: string
  address: string
  city: string
  province: string
  postal_code: string
  country_code: string
  bic_swift: string
  version: number
}

/**
 * Legal entity email from Moddo API GET /api/legal-entities/{legalEntity}/emails
 */
export type LegalEntityEmail = {
  id: string
  legal_entity_id: string
  label: string
  email: string
  display_name: string
  reply_to: string
  version: number
}

/**
 * Payment term due date from Moddo API
 */
export type PaymentTermDueDate = {
  days: number
  percentage: number
  payment_method: string
  amount_type: string
}

/**
 * Payment term terms structure from Moddo API
 */
export type PaymentTermTerms = {
  reference_date: 'end_of_month' | 'invoice_date'
  due_dates: PaymentTermDueDate[]
}

/**
 * Payment term from Moddo API GET /api/legal-entities/{legalEntity}/payment-terms
 */
export type PaymentTerm = {
  id: string
  code: string
  name: string
  description: string
  terms: PaymentTermTerms
  is_active: boolean
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
  | 'view-suppliers'
  | 'create-suppliers'
  | 'edit-suppliers'
  | 'delete-suppliers'
  | 'view-items'
  | 'create-items'
  | 'edit-items'
  | 'delete-items'
  | 'view-product-families'
  | 'create-product-families'
  | 'edit-product-families'
  | 'delete-product-families'
  | 'view-product-lines'
  | 'create-product-lines'
  | 'edit-product-lines'
  | 'delete-product-lines'
  | 'view-commodity-codes'
  | 'create-commodity-codes'
  | 'edit-commodity-codes'
  | 'delete-commodity-codes'
  | 'view-payment-terms'
  | 'create-payment-terms'
  | 'edit-payment-terms'
  | 'delete-payment-terms'
  | 'view-banks'
  | 'create-banks'
  | 'edit-banks'
  | 'delete-banks'
  | 'view-emails'
  | 'create-emails'
  | 'edit-emails'
  | 'delete-emails'
  | 'view-quotations'
  | 'create-quotations'
  | 'edit-quotations'
  | 'delete-quotations'
  | 'view-sales-orders'
  | 'create-sales-orders'
  | 'edit-sales-orders'
  | 'delete-sales-orders'
  | 'view-pre-deliveries'
  | 'create-pre-deliveries'
  | 'edit-pre-deliveries'
  | 'delete-pre-deliveries'
  | 'view-warehouses'
  | 'create-warehouses'
  | 'edit-warehouses'
  | 'delete-warehouses'
  | 'view-transport-documents'
  | 'create-transport-documents'
  | 'edit-transport-documents'
  | 'delete-transport-documents'

export type CustomerType = 'company' | 'individual' | 'public_entity' | 'consortium' | 'association'
export type CustomerStatus = 'active' | 'suspended' | 'ceased' | 'prospect'
export type SupplierType = 'courier'
export type SupplierStatus = 'active' | 'suspended' | 'ceased' | 'prospect'
export type AtecoCode =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'O'
  | 'P'
  | 'Q'
  | 'R'
  | 'S'
  | 'T'
  | 'U'
  | 'V'
export type CompanySize = 'micro' | 'small' | 'medium' | 'large' | 'enterprise'
export type EmployeeCountRange = '1_9' | '10_49' | '50_249' | '250_999' | '1000_plus'
export type AnnualRevenueRange = 'under_2m' | '2m_10m' | '10m_50m' | '50m_250m' | 'over_250m'
export type Currency =
  | 'EUR'
  | 'USD'
  | 'GBP'
  | 'CHF'
  | 'JPY'
  | 'CNY'
  | 'CAD'
  | 'AUD'
  | 'SEK'
  | 'NOK'
  | 'DKK'
  | 'PLN'
  | 'CZK'
  | 'HUF'
  | 'RON'
  | 'BGN'
  | 'TRY'
  | 'BRL'
  | 'INR'
  | 'AED'
  | 'SAR'

export type CustomerAddress = {
  id: string
  type: 'billing' | 'shipping' | 'legal'
  is_default: boolean
  address_line_1: string
  address_line_2: string
  city: string
  province: string
  region: string
  postal_code: string
  country_code: string
  receiving_hours: string
  delivery_instructions: string
  warehouse_assignment: string
  version: number
}

export type CustomerContact = {
  id: string
  type: 'primary' | 'technical_support' | 'administrative' | 'logistics' | 'quality' | 'purchasing' | 'sales'
  name: string
  job_title: string
  phone: string
  mobile_phone: string
  email: string
  version: number
}

/**
 * Customer from Moddo API GET /api/legal-entities/{legalEntity}/customers
 */
export type Customer = {
  id: string
  type: CustomerType
  status: CustomerStatus
  name: string
  last_name: string
  trade_name: string
  eori_code: string
  ateco_code: AtecoCode | null
  parent_id: string
  company_size: CompanySize | null
  employee_count_range: EmployeeCountRange | null
  annual_revenue_range: AnnualRevenueRange | null
  founded_year: number | null
  language_code: string
  registration_country_code: string
  default_currency: Currency
  vat_number: string
  tax_id: string
  sdi_code: string
  pec: string
  email: string
  phone: string
  fax: string
  website: string
  notes: string
  custom_fields: Record<string, unknown>
  version: number
  addresses?: CustomerAddress[]
  contacts?: CustomerContact[]
}

export type SupplierAddress = {
  id: string
  type: 'billing' | 'shipping' | 'legal'
  is_default: boolean
  address_line_1: string
  address_line_2: string
  city: string
  province: string
  region: string
  postal_code: string
  country_code: string
  receiving_hours: string
  delivery_instructions: string
  warehouse_assignment: string
  version: number
}

export type SupplierContact = {
  id: string
  type: 'primary' | 'technical_support' | 'administrative' | 'logistics' | 'quality' | 'purchasing' | 'sales'
  name: string
  job_title: string
  phone: string
  mobile_phone: string
  email: string
  version: number
}

/**
 * Supplier from Moddo API GET /api/legal-entities/{legalEntity}/suppliers
 */
export type Supplier = {
  id: string
  type: SupplierType
  status: SupplierStatus
  name: string
  trade_name: string
  ateco_code: AtecoCode | null
  parent_id: string
  company_size: CompanySize | null
  employee_count_range: EmployeeCountRange | null
  language_code: string
  registration_country_code: string
  default_currency: Currency
  vat_number: string
  tax_id: string
  pec: string
  email: string
  phone: string
  fax: string
  website: string
  notes: string
  custom_fields: Record<string, unknown>
  version: number
  addresses?: SupplierAddress[]
  contacts?: SupplierContact[]
}

export type LegalEntityAddress = {
  id: string
  type: 'legal' | 'operational'
  is_default: boolean
  address_line_1: string
  address_line_2: string
  city: string
  province: string
  region: string
  postal_code: string
  country_code: string
  version: number
}

/**
 * Legal entity from GET /api/user or GET /api/legal-entities/{id}
 */
export type LegalEntity = {
  id: string
  name: string
  last_name: string
  trade_name: string
  eori_code: string
  ateco_code: AtecoCode | null
  vat_number: string
  tax_id: string
  sdi_code: string
  pec: string
  email: string
  phone: string
  fax: string
  website: string
  registration_country_code: string
  tax_regime: string
  rea_office: string
  rea_number: string
  liquidation_status: string
  notes: string
  version: number
  addresses?: LegalEntityAddress[]
  banks?: LegalEntityBank[]
  emails?: LegalEntityEmail[]
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

// ============================================================================
// Item API Types
// ============================================================================

export type ItemCategory =
  | 'finished_good'
  | 'raw_material'
  | 'semi_finished'
  | 'component'
  | 'phantom'
  | 'packaging'
  | 'subcontract'
  | 'service_expense'
  | 'kit'

export type ItemStatus = 'active' | 'inactive' | 'obsolete'

export type AbcClass = 'A' | 'B' | 'C' | 'D'

export type UnitOfMeasure =
  | 'PZ'
  | 'KG'
  | 'G'
  | 'T'
  | 'LT'
  | 'ML'
  | 'M'
  | 'CM'
  | 'MM'
  | 'M2'
  | 'M3'
  | 'SET'
  | 'BOX'
  | 'PAL'
  | 'ROL'
  | 'FOG'
  | 'PR'
  | 'CF'
  | 'H'
  | 'NR'

export type WeightUnit = 'KG' | 'G' | 'LB' | 'OZ' | 'T'

export type DimensionUnit = 'MM' | 'CM' | 'M' | 'IN' | 'FT'

/**
 * Item from Moddo API GET /api/legal-entities/{legalEntity}/items
 */
export type Item = {
  id: string
  code: string
  alternative_code: string
  name: string
  description: string
  image: string
  item_category: ItemCategory
  item_status: ItemStatus
  upc_ean_code: string
  abc_class: AbcClass | null
  product_family: ProductFamily | null
  product_line: ProductLine | null
  commodity_code: CommodityCode | null
  primary_uom: UnitOfMeasure | null
  secondary_uom: UnitOfMeasure | null
  uom_conversion_factor: number
  gross_weight: number
  net_weight: number
  weight_uom: WeightUnit | null
  length: number
  width: number
  height: number
  dimension_uom: DimensionUnit | null
  standard_cost: number
  cost_currency: Currency | null
  country_of_origin: string
  hs_tariff_code: string
  custom_fields: Record<string, unknown>
  notes: string
  version: number
}

// ============================================================================
// Documents API Types
// ============================================================================

/**
 * Document tag
 */
export type DocumentTag = {
  id: string
  name: string
  slug: string
}

/**
 * Document (file attached to any entity)
 */
export type Document = {
  id: string
  legal_entity_id: string
  documentable_type: string
  documentable_id: string
  original_filename: string
  mime_type: string
  size: number
  description: string
  tags?: DocumentTag[]
  uploader?: {
    id: string
    name: string
    email: string
  }
  created_at: string
  download_url?: string
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
