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
 * Amount base a due-date percentage is applied to (`PaymentAmountType` enum).
 */
export type PaymentAmountType = 'imponibile' | 'iva' | 'totale_documento'

/**
 * Payment term due date from Moddo API
 */
export type PaymentTermDueDate = {
  days: number
  percentage: number
  payment_method: PaymentMethod
  amount_type: PaymentAmountType
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
  is_archivable?: boolean
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
  | 'view-warehouses'
  | 'create-warehouses'
  | 'edit-warehouses'
  | 'delete-warehouses'
  | 'view-warehouse-orders'
  | 'create-warehouse-orders'
  | 'edit-warehouse-orders'
  | 'delete-warehouse-orders'
  | 'view-transport-documents'
  | 'create-transport-documents'
  | 'edit-transport-documents'
  | 'delete-transport-documents'
  | 'view-invoices'
  | 'create-invoices'
  | 'edit-invoices'
  | 'delete-invoices'

export type CustomerType = 'company' | 'individual' | 'public_entity' | 'consortium' | 'association'
export type CustomerCommercialStatus = 'active' | 'prospect'
export type CustomerTag = 'suspended' | 'ceased'
export type SupplierType = 'courier'
export type SupplierTag = 'suspended' | 'ceased'
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
  commercial_status: CustomerCommercialStatus
  tags: CustomerTag[]
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
  suspended_at: string
  ceased_at: string
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
  tags: SupplierTag[]
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
  suspended_at: string
  ceased_at: string
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

// ============================================================================
// Customer Commercial Terms Types
// ============================================================================

/**
 * Customer commercial terms from Moddo API
 * GET /api/legal-entities/{legalEntity}/customers/{customer}/commercial-terms
 */
export type VatCode = {
  id: string
  code: string
  description: string
  rate: number
  nature: string
  legal_reference: string
  type: string
  direction: 'vendita' | 'acquisto'
  applies_to: 'beni' | 'servizi' | 'beni_servizi'
  requires_intent_declaration: boolean
  requires_stamp_duty: boolean
  note: string
  is_default: boolean
}

/**
 * Type of a payment composition slice (`PaymentSliceType` enum).
 * - `acconto` — advance
 * - `stato_avanzamento_lavori` — progress billing (SAL)
 * - `saldo` — final balance
 */
export type PaymentSliceType = 'acconto' | 'stato_avanzamento_lavori' | 'saldo'

/**
 * A single slice of a payment composition (Acconto / SAL / Saldo), each with its
 * own percentage and payment term. Shared shape across customer/supplier commercial
 * terms and document payment compositions (quotation / sales order / transport document).
 * `id` is present on responses, omitted on create.
 */
export type PaymentComposition = {
  id?: string
  position: number
  percentage: number
  type: PaymentSliceType
  payment_term_id: string
  payment_term?: PaymentTerm
}

export type CustomerCommercialTerms = {
  id: string
  vat_code_id: string
  vat_code?: VatCode
  iban: string
  bic_swift: string
  support_bank: string
  trade_discount: number
  incoterm: Incoterm
  incoterm_place: string
  free_shipping_threshold: number
  minimum_order_value: number
  composition?: PaymentComposition[]
  version: number
}

/**
 * Supplier commercial terms from Moddo API
 * GET /api/legal-entities/{legalEntity}/suppliers/{supplier}/commercial-terms
 */
export type SupplierCommercialTerms = {
  id: string
  vat_code_id: string
  vat_code?: VatCode
  iban: string
  bic_swift: string
  support_bank: string
  trade_discount: number
  incoterm: Incoterm
  incoterm_place: string
  free_shipping_threshold: number
  minimum_order_value: number
  composition?: PaymentComposition[]
  version: number
}

// ============================================================================
// Quotations API Types
// ============================================================================

export type QuotationTag = 'expired' | 'sent'

export type QuotationStatus = 'open' | 'approved' | 'rejected' | 'superseded'

export type ConversionStatus = 'none' | 'partial' | 'full'

export type Incoterm = 'EXW' | 'FCA' | 'FAS' | 'FOB' | 'CFR' | 'CIF' | 'CPT' | 'CIP' | 'DAP' | 'DPU' | 'DDP'

export type SalesTransactionType =
  | 'VEN'
  | 'VEN-EXP'
  | 'VEN-UE'
  | 'VEN-TRI'
  | 'C/VIS'
  | 'C/VIS-RES'
  | 'C/LAV'
  | 'C/LAV-RES'
  | 'RES'
  | 'OMG'
  | 'TRASF'
  | 'RIP'
  | 'RIP-RES'
  | 'CAMP'

export type QuotationItemType = 'item' | 'descriptive'

/**
 * Quotation item from Moddo API
 */
export type QuotationItem = {
  id: string
  sort_order: number
  type: QuotationItemType
  item_id: string
  item_snapshot: Record<string, unknown>[]
  description: string
  quantity: number
  uom: UnitOfMeasure | null
  unit_price: number
  discount_percent: number
  discount_amount: number
  net_value: number
  vat_code_id: string
  vat_code_snapshot: Record<string, unknown>[]
  tax_amount: number
  requested_delivery_date: string
  delivery_date: string
  rejection_reason: string
  rejected_at: string
  rejected_by: string
  ordered_quantity?: number
  conversion_status?: ConversionStatus
  version: number
}

/**
 * One VAT-rate bucket of a document's tax breakdown ("riepilogo IVA").
 * Backend-computed, read-only. Shared by quotations, sales orders and invoices.
 */
export type VatSummaryEntry = {
  /** VAT code (e.g. "IVA22-VB"). */
  code: string
  /** Human-readable VAT code description. */
  description: string
  /** VAT rate as a percentage (e.g. 22 for 22%). */
  rate: number
  /** Taxable amount (net) for this bucket. */
  net: number
  /** Tax amount for this bucket. */
  tax: number
}

/**
 * Quotation from Moddo API GET /api/legal-entities/{legalEntity}/quotations
 */
export type Quotation = {
  id: string
  document_number: string
  revision_number: number
  parent_id: string
  document_date: string
  sales_transaction_type: SalesTransactionType
  customer_id: string
  customer_snapshot: Record<string, unknown>[]
  ship_to_address_id: string
  ship_to_snapshot: Record<string, unknown>[]
  contact_person_id: string
  contact_person_snapshot: Record<string, unknown>[]
  legal_entity_snapshot: Record<string, unknown>[]
  currency: Currency
  valid_from: string
  valid_to: string
  /** Read-only snapshot of the payment composition (prefill source for the editor). */
  payment_composition_snapshot: Record<string, unknown>[]
  /** Backend-computed `(type|payment_term_id)` signature; recomputed FE-side for import compatibility. */
  composition_signature: string
  incoterm: Incoterm
  incoterm_location: string
  sales_rep_id: string
  state: QuotationStatus
  tags: QuotationTag[]
  expired_at: string
  sent_at: string
  net_value: number
  gross_value: number
  notes_internal: string
  notes_external: string
  conversion_status?: ConversionStatus
  version: number
  created_by: string
  items?: QuotationItem[]
  vat_summary?: VatSummaryEntry[]
  available_transitions?: string[]
}

// ============================================================================
// Sales Orders API Types
// ============================================================================

export type SalesOrderTag = 'sent' | 'payment_pending' | 'requires_direct_invoicing'

export type SalesOrderStatus = 'open' | 'approved' | 'rejected'

export type SalesOrderFulfillmentStatus = 'none' | 'in_progress' | 'picked' | 'partially_shipped' | 'fully_shipped'

export type SalesOrderItemType = 'item' | 'descriptive'

export type SalesOrderItem = {
  id: string
  quotation_item_id: string
  sort_order: number
  type: SalesOrderItemType
  item_id: string
  item_snapshot: Record<string, unknown>[]
  description: string
  quantity: number
  uom: UnitOfMeasure | null
  unit_price: number
  discount_percent: number
  discount_amount: number
  net_value: number
  vat_code_id: string
  vat_code_snapshot: Record<string, unknown>[]
  tax_amount: number
  requested_delivery_date: string
  confirmed_delivery_date: string
  is_editable: boolean
  version: number
}

export type SalesOrder = {
  id: string
  document_number: string
  document_date: string
  sales_transaction_type: SalesTransactionType
  customer_id: string
  customer_snapshot: Record<string, unknown>[]
  ship_to_address_id: string
  ship_to_snapshot: Record<string, unknown>[]
  contact_person_id: string
  contact_person_snapshot: Record<string, unknown>[]
  legal_entity_snapshot: Record<string, unknown>[]
  legal_entity_bank_id: string
  legal_entity_bank_snapshot: Record<string, unknown>[]
  currency: Currency
  /** Read-only snapshot of the payment composition (prefill source for the editor). */
  payment_composition_snapshot: Record<string, unknown>[]
  /** Backend-computed `(type|payment_term_id)` signature; recomputed FE-side for import compatibility. */
  composition_signature: string
  incoterm: Incoterm
  incoterm_location: string
  customer_purchase_order: string
  customer_purchase_order_date: string
  sales_rep_id: string
  state: SalesOrderStatus
  tags: SalesOrderTag[]
  fulfillment_status: SalesOrderFulfillmentStatus | null
  confirmation_date: string
  sent_at: string
  requested_delivery_date: string
  net_value: number
  gross_value: number
  notes_internal: string
  notes_external: string
  custom_fields?: Record<string, unknown>
  version: number
  created_by: string
  items?: SalesOrderItem[]
  vat_summary?: VatSummaryEntry[]
  available_transitions?: string[]
}

// ============================================================================
// Warehouse Orders API Types
// ============================================================================

export type WarehouseOrderTag = 'transport_document_generated'

export type WarehouseOrderState = 'open' | 'handed_over'

export type WarehouseOrderPickingStatus = 'not_started' | 'partial' | 'full'

export type ShippingMethod = 'courier' | 'own_vehicle' | 'customer_pickup'

export type WarehouseOrderItem = {
  id: string
  sales_order_item_id: string
  sort_order: number
  item_id: string
  item_snapshot: Record<string, unknown>[]
  description: string
  quantity_requested: number
  quantity_picked: number
  uom: UnitOfMeasure
  version: number
}

export type WarehouseOrder = {
  id: string
  document_number: string
  document_date: string
  sales_transaction_type: SalesTransactionType
  incoterm: Incoterm
  incoterm_location: string
  customer_id: string
  customer_snapshot: Record<string, unknown>[]
  ship_to_address_id: string
  ship_to_snapshot: Record<string, unknown>[]
  warehouse_id: string
  /** Full warehouse record (eager-loaded by the backend when warehouse_id is set) */
  warehouse?: LegalEntityWarehouse
  planned_ship_date: string
  carrier_id: string
  /** Full carrier (Supplier) record (eager-loaded by the backend when carrier_id is set) */
  carrier?: Supplier
  shipping_method: ShippingMethod | null
  notes_internal: string
  state: WarehouseOrderState
  tags: WarehouseOrderTag[]
  picking_status: WarehouseOrderPickingStatus | null
  handed_over_at: string
  version: number
  created_by: string
  items?: WarehouseOrderItem[]
  available_transitions?: string[]
  is_archivable?: boolean
}

// ============================================================================
// Transport Documents API Types
// ============================================================================

export type TransportDocumentState = 'open' | 'carried'

export type TransportDocumentType =
  | 'sale'
  | 'export'
  | 'intra_eu'
  | 'consignment_stock'
  | 'consignment_return'
  | 'subcontracting'
  | 'return'
  | 'customer_return'
  | 'gift'
  | 'transfer'
  | 'repair'
  | 'sampling'

export type TransportMethod = 'sender' | 'recipient' | 'carrier'

export type TransportDocumentInvoicingStatus = 'none' | 'partial' | 'full'

export type TransportDocumentItemStatus = 'active' | 'cancelled'

export type TransportDocumentItem = {
  id: string
  warehouse_order_item_id: string
  sales_order_item_id: string
  sort_order: number
  item_id: string
  item_snapshot: Record<string, unknown>[]
  description: string
  quantity: number
  uom: UnitOfMeasure
  weight_gross: number
  weight_net: number
  unit_price: number
  net_value: number
  vat_code_id: string
  vat_code_snapshot: Record<string, unknown>[]
  status: TransportDocumentItemStatus
  version: number
}

export type TransportDocument = {
  id: string
  document_number: string
  document_date: string
  sales_transaction_type: SalesTransactionType
  /** Derived server-side from sales_transaction_type */
  transport_document_type: TransportDocumentType
  incoterm: Incoterm
  incoterm_location: string
  customer_id: string
  customer_snapshot: Record<string, unknown>[]
  ship_to_address_id: string
  ship_to_snapshot: Record<string, unknown>[]
  warehouse_id: string
  /** Full warehouse record (eager-loaded by the backend when warehouse_id is set) */
  warehouse?: LegalEntityWarehouse
  carrier_id: string
  /** Full carrier (Supplier) record (eager-loaded by the backend when carrier_id is set) */
  carrier?: Supplier
  transport_reason: string
  transport_method: TransportMethod | null
  shipping_date: string
  shipping_time: string
  packages_count: number
  gross_weight: number
  net_weight: number
  volume: number
  appearance: string
  notes_external: string
  notes_internal: string
  return_deadline: string
  state: TransportDocumentState
  carried_at: string
  invoicing_status: TransportDocumentInvoicingStatus | null
  version: number
  created_by: string
  items?: TransportDocumentItem[]
  available_transitions?: string[]
  is_archivable?: boolean
}

// ============================================================================
// Invoiceable Documents API Types
// ============================================================================

export type InvoiceableDocumentType =
  | 'order_acconto'
  | 'order_sal'
  | 'order_saldo_from_transport'
  | 'order_saldo_direct'

export type InvoiceableDocumentSourceType = 'sales_order' | 'transport_document'

/**
 * A document that can be invoiced, returned by
 * GET /api/legal-entities/{legalEntity}/invoiceable-documents
 */
export type InvoiceableDocument = {
  type: InvoiceableDocumentType
  priority: number
  source: {
    type: InvoiceableDocumentSourceType
    id: string
    document_number: string
    document_date: string
  }
  customer_id: string
  customer_snapshot: Record<string, unknown>[]
  sales_transaction_type: SalesTransactionType
  transport_reason: string
  currency: Currency
  reference_date: string
  invoiceable_lines_count: number
  amount: {
    net: number
    tax: number
    total: number
  }
  fulfillment_status: SalesOrderFulfillmentStatus | null
  invoicing_status: TransportDocumentInvoicingStatus | null
  /** Type of the composition slice this row represents (one invoiceable row per unpaid slice). */
  slice_type: PaymentSliceType | null
  /** Position of the composition slice this row represents — passed to the prefill as `slice_position`. */
  slice_position: number
}

// ============================================================================
// Invoices API Types
// ============================================================================

/** FatturaPA TipoDocumento codes accepted by POST /invoices */
export type InvoiceDocumentType = 'TD01' | 'TD02' | 'TD04' | 'TD05' | 'TD24' | 'TD25'

/** Acube/SDI-driven lifecycle. `draft` is the entry state for any new invoice. */
export type InvoiceState = 'draft' | 'sent' | 'delivered' | 'accepted' | 'rejected' | 'archived' | 'error'

export type InvoiceItemType = 'item' | 'descriptive' | 'charge'

/** Transitions accepted by POST /invoices/{id}/transition */
export type InvoiceTransition = 'submit' | 'resubmit' | 'archive'

/**
 * FatturaPA ModalitaPagamento codes — stable enum defined by SDI.
 * See `paymentMethodLabels` in `enum-labels.ts` for the human-readable mapping.
 */
export type PaymentMethod =
  | 'MP01'
  | 'MP02'
  | 'MP03'
  | 'MP04'
  | 'MP05'
  | 'MP06'
  | 'MP07'
  | 'MP08'
  | 'MP09'
  | 'MP10'
  | 'MP11'
  | 'MP12'
  | 'MP13'
  | 'MP14'
  | 'MP15'
  | 'MP16'
  | 'MP17'
  | 'MP18'
  | 'MP19'
  | 'MP20'
  | 'MP21'
  | 'MP22'
  | 'MP23'

/**
 * Single due-date row attached to an invoice. The backend recomputes these from
 * the invoice's payment term on save, so the FE renders them as read-only info.
 */
export type InvoiceDueDate = {
  id: string
  position: number
  due_date: string
  amount: string | number
  payment_method: PaymentMethod
  invoice_id: string
  /** Enriched fields present on the cross-invoice `GET /invoice-due-dates` list view (omitted on the invoice's own `due_dates`). */
  document_number?: string
  document_date?: string
  document_type?: InvoiceDocumentType
  state?: InvoiceState
  customer_name?: string
}

/**
 * Reduced due-date shape carried by the prefill response — no `id` /
 * `invoice_id` since the invoice has not been saved yet.
 */
export type InvoicePrefillDueDate = {
  position: number
  due_date: string
  amount: number
  payment_method: PaymentMethod
}

export type InvoiceItem = {
  id: string
  position: number
  type: InvoiceItemType
  item_id: string
  item_snapshot: Record<string, unknown>[]
  description: string
  quantity: number
  unit_of_measure: UnitOfMeasure
  unit_price: number
  discount_percentage: number
  net_value: number
  vat_code_id: string
  vat_code_snapshot: Record<string, unknown>[]
  tax_amount: number
  sales_order_item_id: string
  transport_document_item_id: string
}

/**
 * Invoice from Moddo API POST /api/legal-entities/{legalEntity}/invoices.
 * Created in `draft` state; lifecycle progresses server-side via Acube/SDI.
 * `document_number` is auto-generated (`FT-YYYY-NNNNN`); totals are computed
 * server-side from item-level `net_value` / `tax_amount`.
 */
export type Invoice = {
  id: string
  document_number: string
  document_date: string
  document_type: InvoiceDocumentType
  customer_id: string
  customer_snapshot: Record<string, unknown>[]
  sales_order_id: string
  legal_entity_snapshot: Record<string, unknown>[]
  /** Read-only snapshot of the payment composition (the single slice this invoice bills). */
  payment_composition_snapshot: Record<string, unknown>[]
  legal_entity_bank_id: string
  legal_entity_bank_snapshot: Record<string, unknown>[]
  currency: Currency
  total_net: number
  total_tax: number
  total_amount: number
  state: InvoiceState
  acube_invoice_uuid: string
  notes_external: string
  notes_internal: string
  pdf_path: string
  version: number
  created_by: string
  created_at: string
  updated_at: string
  items?: InvoiceItem[]
  vat_summary?: VatSummaryEntry[]
  due_dates?: InvoiceDueDate[]
  available_transitions?: InvoiceTransition[]
}

/**
 * Input shape for an invoice line item — matches the body accepted by
 * `POST /invoices` and the items array returned by `GET /invoices/prefill`.
 * Distinct from `InvoiceItem` (the saved-row representation) because prefill
 * lines have no `id`, `position`, snapshots or computed totals yet.
 */
export type InvoiceItemInput = {
  type: 'item' | 'charge' | 'descriptive'
  item_id?: string
  description: string
  quantity?: number
  unit_of_measure?: UnitOfMeasure
  unit_price?: number
  discount_percentage?: number
  vat_code_id?: string
  sales_order_item_id?: string
  transport_document_item_id?: string
}

/**
 * Pre-filled invoice draft returned by
 * `GET /invoices/prefill?source_type=<InvoiceableDocumentType>&source_id=<uuid>`.
 *
 * The backend hydrates header fields, lines and totals from the source document
 * (order advance / transport document / direct order) so the FE can pre-populate
 * an invoice create form with one round-trip.
 */
export type InvoicePrefill = {
  document_date: string
  document_type: InvoiceDocumentType
  customer_id: string
  /** Full customer record — `null` when the customer cannot be resolved. */
  customer: Customer | null
  sales_order_id: string
  /** Full payment composition resolved from the source document (each slice with its `payment_term`). */
  payment_composition: PaymentComposition[]
  /** Type of the composition slice this invoice bills. `null` for a standalone/manual prefill. */
  slice_type: PaymentSliceType | null
  /** Position of the composition slice this invoice bills within the source composition. */
  slice_position: number
  legal_entity_bank_id: string
  /** Full legal-entity bank — `null` when unset on the source. */
  legal_entity_bank: LegalEntityBank | null
  currency: Currency
  notes_external: string
  notes_internal: string
  items: InvoiceItemInput[]
  /**
   * Source documents the prefilled lines were composed from, with the human-readable
   * `number`/`date` used to render the per-group reference descriptive header. Each
   * `line_positions` entry is a 1-based index into `items` (position 1 = first item).
   */
  source_references?: {
    orders: { sales_order_id: string; number: string; date: string; line_positions: number[] }[]
    transport_documents: {
      transport_document_id: string
      number: string
      date: string
      line_positions: number[]
    }[]
  }
  totals: {
    net: number
    tax: number
    total: number
  }
  due_dates: InvoicePrefillDueDate[]
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
