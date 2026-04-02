/* eslint-disable @typescript-eslint/no-unused-vars */
import * as m from '$lib/paraglide/messages.js'
import type {
  AbcClass,
  AnnualRevenueRange,
  AtecoCode,
  BinLocationType,
  CompanySize,
  Currency,
  Customer,
  CustomerAddress,
  CustomerContact,
  DimensionUnit,
  EmployeeCountRange,
  Incoterm,
  Item,
  ItemCategory,
  ItemStatus,
  LegalEntityWarehouse,
  Quotation,
  QuotationStatus,
  QuotationTag,
  SalesOrderSummary,
  SalesTransactionType,
  Supplier,
  SupplierAddress,
  SupplierContact,
  SupplyOrderSummary,
  UnitOfMeasure,
  ValuationMethod,
  WarehouseBin,
  WarehouseType,
  WarehouseZone,
  WeightUnit,
  ZoneType,
} from '$lib/types/api-types'

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

interface EnumDisplayConfig {
  label: () => string
  variant: BadgeVariant
}

// Supply Order Status
export const supplyOrderStatusConfig: Record<SupplyOrderSummary['status'], EnumDisplayConfig> = {
  draft: { label: m.enum_supply_status_draft, variant: 'secondary' },
  sent: { label: m.enum_supply_status_sent, variant: 'outline' },
  accepted: { label: m.enum_supply_status_accepted, variant: 'default' },
  shipped: { label: m.enum_supply_status_shipped, variant: 'default' },
  rejected: { label: m.enum_supply_status_rejected, variant: 'destructive' },
}

export function getSupplyStatusLabel(status: SupplyOrderSummary['status']): string {
  return supplyOrderStatusConfig[status]?.label() ?? status
}

export function getSupplyStatusVariant(status: SupplyOrderSummary['status']): BadgeVariant {
  return supplyOrderStatusConfig[status]?.variant ?? 'default'
}

// Sales Order Status
export const salesOrderStatusConfig: Record<SalesOrderSummary['status'], EnumDisplayConfig> = {
  draft: { label: m.enum_sales_status_draft, variant: 'secondary' },
  sent: { label: m.enum_sales_status_sent, variant: 'outline' },
  accepted: { label: m.enum_sales_status_accepted, variant: 'default' },
}

export function getSalesStatusLabel(status: SalesOrderSummary['status']): string {
  return salesOrderStatusConfig[status]?.label() ?? status
}

export function getSalesStatusVariant(status: SalesOrderSummary['status']): BadgeVariant {
  return salesOrderStatusConfig[status]?.variant ?? 'default'
}

// Sales Order Shipped Status
export const salesShippedStatusConfig: Record<NonNullable<SalesOrderSummary['shipped']>, EnumDisplayConfig> = {
  completed: { label: m.enum_sales_shipped_completed, variant: 'default' },
  'not shipped': { label: m.enum_sales_shipped_not_shipped, variant: 'secondary' },
  partial: { label: m.enum_sales_shipped_partial, variant: 'outline' },
}

export function getSalesShippedLabel(shipped: NonNullable<SalesOrderSummary['shipped']>): string {
  return salesShippedStatusConfig[shipped]?.label() ?? shipped
}

export function getSalesShippedVariant(shipped: NonNullable<SalesOrderSummary['shipped']>): BadgeVariant {
  return salesShippedStatusConfig[shipped]?.variant ?? 'default'
}

// Customer Type
export const customerTypeConfig: Record<Customer['type'], EnumDisplayConfig> = {
  company: { label: m.enum_customer_type_company, variant: 'default' },
  individual: { label: m.enum_customer_type_individual, variant: 'secondary' },
  public_entity: { label: m.enum_customer_type_public_entity, variant: 'outline' },
  consortium: { label: m.enum_customer_type_consortium, variant: 'secondary' },
  association: { label: m.enum_customer_type_association, variant: 'secondary' },
}

export function getCustomerTypeLabel(type: Customer['type']): string {
  return customerTypeConfig[type]?.label() ?? type
}

export function getCustomerTypeVariant(type: Customer['type']): BadgeVariant {
  return customerTypeConfig[type]?.variant ?? 'default'
}

// Customer Status
export const customerCommercialStatusConfig: Record<Customer['commercial_status'], EnumDisplayConfig> = {
  active: { label: m.enum_customer_status_active, variant: 'default' },
  prospect: { label: m.enum_customer_status_prospect, variant: 'secondary' },
}

export function getCustomerCommercialStatusLabel(status: Customer['commercial_status']): string {
  return customerCommercialStatusConfig[status]?.label() ?? status
}

export function getCustomerCommercialStatusVariant(status: Customer['commercial_status']): BadgeVariant {
  return customerCommercialStatusConfig[status]?.variant ?? 'default'
}

export const customerTagConfig: Record<Customer['tags'][number], EnumDisplayConfig> = {
  suspended: { label: m.enum_customer_status_suspended, variant: 'outline' },
  ceased: { label: m.enum_customer_status_ceased, variant: 'secondary' },
}

export function getCustomerTagLabel(tag: Customer['tags'][number]): string {
  return customerTagConfig[tag]?.label() ?? tag
}

export function getCustomerTagVariant(tag: Customer['tags'][number]): BadgeVariant {
  return customerTagConfig[tag]?.variant ?? 'default'
}

// Address Type
export const addressTypeConfig: Record<CustomerAddress['type'], EnumDisplayConfig> = {
  billing: { label: m.enum_address_type_billing, variant: 'default' },
  shipping: { label: m.enum_address_type_shipping, variant: 'secondary' },
  legal: { label: m.enum_address_type_legal, variant: 'outline' },
}

export function getAddressTypeLabel(type: CustomerAddress['type']): string {
  return addressTypeConfig[type]?.label() ?? type
}

export function getAddressTypeVariant(_type: CustomerAddress['type']): BadgeVariant {
  return 'outline'
}

// Contact Type
export const contactTypeConfig: Record<CustomerContact['type'], EnumDisplayConfig> = {
  primary: { label: m.enum_contact_type_primary, variant: 'default' },
  technical_support: { label: m.enum_contact_type_technical_support, variant: 'secondary' },
  administrative: { label: m.enum_contact_type_administrative, variant: 'outline' },
  logistics: { label: m.enum_contact_type_logistics, variant: 'secondary' },
  quality: { label: m.enum_contact_type_quality, variant: 'outline' },
  purchasing: { label: m.enum_contact_type_purchasing, variant: 'secondary' },
  sales: { label: m.enum_contact_type_sales, variant: 'secondary' },
}

export function getContactTypeLabel(type: CustomerContact['type']): string {
  return contactTypeConfig[type]?.label() ?? type
}

export function getContactTypeVariant(type: CustomerContact['type']): BadgeVariant {
  return 'outline'
}

// --- Select item mappings ---

type EnumLabelMap<T extends string> = Record<T, () => string>

/** Converts an enum label map to an array of `{ value, label }` items for use in SelectField. */
export function toSelectItems<T extends string>(map: EnumLabelMap<T>): { value: T; label: string }[] {
  return Object.entries<() => string>(map).map(([value, labelFn]) => ({
    value: value as T,
    label: labelFn(),
  }))
}

// Currency
export const currencyLabels: EnumLabelMap<Currency> = {
  EUR: () => `EUR – ${m.enum_currency_EUR()}`,
  USD: () => `USD – ${m.enum_currency_USD()}`,
  GBP: () => `GBP – ${m.enum_currency_GBP()}`,
  CHF: () => `CHF – ${m.enum_currency_CHF()}`,
  JPY: () => `JPY – ${m.enum_currency_JPY()}`,
  CNY: () => `CNY – ${m.enum_currency_CNY()}`,
  CAD: () => `CAD – ${m.enum_currency_CAD()}`,
  AUD: () => `AUD – ${m.enum_currency_AUD()}`,
  SEK: () => `SEK – ${m.enum_currency_SEK()}`,
  NOK: () => `NOK – ${m.enum_currency_NOK()}`,
  DKK: () => `DKK – ${m.enum_currency_DKK()}`,
  PLN: () => `PLN – ${m.enum_currency_PLN()}`,
  CZK: () => `CZK – ${m.enum_currency_CZK()}`,
  HUF: () => `HUF – ${m.enum_currency_HUF()}`,
  RON: () => `RON – ${m.enum_currency_RON()}`,
  BGN: () => `BGN – ${m.enum_currency_BGN()}`,
  TRY: () => `TRY – ${m.enum_currency_TRY()}`,
  BRL: () => `BRL – ${m.enum_currency_BRL()}`,
  INR: () => `INR – ${m.enum_currency_INR()}`,
  AED: () => `AED – ${m.enum_currency_AED()}`,
  SAR: () => `SAR – ${m.enum_currency_SAR()}`,
}

// ATECO Code
export const atecoCodeLabels: EnumLabelMap<AtecoCode> = {
  A: () => `A – ${m.enum_ateco_A()}`,
  B: () => `B – ${m.enum_ateco_B()}`,
  C: () => `C – ${m.enum_ateco_C()}`,
  D: () => `D – ${m.enum_ateco_D()}`,
  E: () => `E – ${m.enum_ateco_E()}`,
  F: () => `F – ${m.enum_ateco_F()}`,
  G: () => `G – ${m.enum_ateco_G()}`,
  H: () => `H – ${m.enum_ateco_H()}`,
  I: () => `I – ${m.enum_ateco_I()}`,
  J: () => `J – ${m.enum_ateco_J()}`,
  K: () => `K – ${m.enum_ateco_K()}`,
  L: () => `L – ${m.enum_ateco_L()}`,
  M: () => `M – ${m.enum_ateco_M()}`,
  N: () => `N – ${m.enum_ateco_N()}`,
  O: () => `O – ${m.enum_ateco_O()}`,
  P: () => `P – ${m.enum_ateco_P()}`,
  Q: () => `Q – ${m.enum_ateco_Q()}`,
  R: () => `R – ${m.enum_ateco_R()}`,
  S: () => `S – ${m.enum_ateco_S()}`,
  T: () => `T – ${m.enum_ateco_T()}`,
  U: () => `U – ${m.enum_ateco_U()}`,
  V: () => `V – ${m.enum_ateco_V()}`,
}

// Company Size
export const companySizeLabels: EnumLabelMap<CompanySize> = {
  micro: m.enum_company_size_micro,
  small: m.enum_company_size_small,
  medium: m.enum_company_size_medium,
  large: m.enum_company_size_large,
  enterprise: m.enum_company_size_enterprise,
}

// Employee Count Range
export const employeeCountRangeLabels: EnumLabelMap<EmployeeCountRange> = {
  '1_9': m.enum_employee_count_1_9,
  '10_49': m.enum_employee_count_10_49,
  '50_249': m.enum_employee_count_50_249,
  '250_999': m.enum_employee_count_250_999,
  '1000_plus': m.enum_employee_count_1000_plus,
}

// Annual Revenue Range
export const annualRevenueRangeLabels: EnumLabelMap<AnnualRevenueRange> = {
  under_2m: m.enum_annual_revenue_under_2m,
  '2m_10m': m.enum_annual_revenue_2m_10m,
  '10m_50m': m.enum_annual_revenue_10m_50m,
  '50m_250m': m.enum_annual_revenue_50m_250m,
  over_250m: m.enum_annual_revenue_over_250m,
}

// Warehouse Type
export const warehouseTypeLabels: EnumLabelMap<WarehouseType> = {
  main: m.enum_warehouse_type_main,
  consignment: m.enum_warehouse_type_consignment,
  subcontracting: m.enum_warehouse_type_subcontracting,
  returns: m.enum_warehouse_type_returns,
  defective: m.enum_warehouse_type_defective,
  spare_parts: m.enum_warehouse_type_spare_parts,
  transit: m.enum_warehouse_type_transit,
  quarantine: m.enum_warehouse_type_quarantine,
}

export function getWarehouseTypeLabel(type: LegalEntityWarehouse['warehouse_type']): string {
  return warehouseTypeLabels[type]?.() ?? type
}

// Valuation Method
export const valuationMethodLabels: EnumLabelMap<ValuationMethod> = {
  weighted_average: m.enum_valuation_method_weighted_average,
  fifo: m.enum_valuation_method_fifo,
  standard: m.enum_valuation_method_standard,
  last_cost: m.enum_valuation_method_last_cost,
}

export function getValuationMethodLabel(method: LegalEntityWarehouse['valuation_method']): string {
  return valuationMethodLabels[method]?.() ?? method
}

// Zone Type
export const zoneTypeLabels: EnumLabelMap<ZoneType> = {
  receiving: m.enum_zone_type_receiving,
  storage: m.enum_zone_type_storage,
  shipping: m.enum_zone_type_shipping,
  quarantine: m.enum_zone_type_quarantine,
  production: m.enum_zone_type_production,
}

export function getZoneTypeLabel(type: WarehouseZone['zone_type']): string {
  return zoneTypeLabels[type]?.() ?? type
}

// Bin Location Type
export const binLocationTypeLabels: EnumLabelMap<BinLocationType> = {
  shelf: m.enum_bin_location_type_shelf,
  floor: m.enum_bin_location_type_floor,
  cell: m.enum_bin_location_type_cell,
  picking: m.enum_bin_location_type_picking,
  bulk: m.enum_bin_location_type_bulk,
}

export function getBinLocationTypeLabel(type: WarehouseBin['location_type']): string {
  return binLocationTypeLabels[type]?.() ?? type
}

// Supplier Type
export const supplierTypeConfig: Record<Supplier['type'], EnumDisplayConfig> = {
  courier: { label: m.enum_supplier_type_courier, variant: 'default' },
}

export function getSupplierTypeLabel(type: Supplier['type']): string {
  return supplierTypeConfig[type]?.label() ?? type
}

export function getSupplierTypeVariant(type: Supplier['type']): BadgeVariant {
  return supplierTypeConfig[type]?.variant ?? 'default'
}

// Supplier Status
export const supplierTagConfig: Record<Supplier['tags'][number], EnumDisplayConfig> = {
  suspended: { label: m.enum_supplier_status_suspended, variant: 'outline' },
  ceased: { label: m.enum_supplier_status_ceased, variant: 'secondary' },
}

export function getSupplierTagLabel(tag: Supplier['tags'][number]): string {
  return supplierTagConfig[tag]?.label() ?? tag
}

export function getSupplierTagVariant(tag: Supplier['tags'][number]): BadgeVariant {
  return supplierTagConfig[tag]?.variant ?? 'default'
}

// Supplier Address Type (reuses same address types as customer)
export const supplierAddressTypeConfig: Record<SupplierAddress['type'], EnumDisplayConfig> = {
  billing: { label: m.enum_address_type_billing, variant: 'default' },
  shipping: { label: m.enum_address_type_shipping, variant: 'secondary' },
  legal: { label: m.enum_address_type_legal, variant: 'outline' },
}

export function getSupplierAddressTypeLabel(type: SupplierAddress['type']): string {
  return supplierAddressTypeConfig[type]?.label() ?? type
}

export function getSupplierAddressTypeVariant(_type: SupplierAddress['type']): BadgeVariant {
  return 'outline'
}

// Supplier Contact Type (reuses same contact types as customer)
export const supplierContactTypeConfig: Record<SupplierContact['type'], EnumDisplayConfig> = {
  primary: { label: m.enum_contact_type_primary, variant: 'default' },
  technical_support: { label: m.enum_contact_type_technical_support, variant: 'secondary' },
  administrative: { label: m.enum_contact_type_administrative, variant: 'outline' },
  logistics: { label: m.enum_contact_type_logistics, variant: 'secondary' },
  quality: { label: m.enum_contact_type_quality, variant: 'outline' },
  purchasing: { label: m.enum_contact_type_purchasing, variant: 'secondary' },
  sales: { label: m.enum_contact_type_sales, variant: 'secondary' },
}

export function getSupplierContactTypeLabel(type: SupplierContact['type']): string {
  return supplierContactTypeConfig[type]?.label() ?? type
}

export function getSupplierContactTypeVariant(_type: SupplierContact['type']): BadgeVariant {
  return 'outline'
}

// Item Category
export const itemCategoryConfig: Record<ItemCategory, EnumDisplayConfig> = {
  finished_good: { label: m.enum_item_category_finished_good, variant: 'default' },
  raw_material: { label: m.enum_item_category_raw_material, variant: 'secondary' },
  semi_finished: { label: m.enum_item_category_semi_finished, variant: 'outline' },
  component: { label: m.enum_item_category_component, variant: 'secondary' },
  phantom: { label: m.enum_item_category_phantom, variant: 'outline' },
  packaging: { label: m.enum_item_category_packaging, variant: 'secondary' },
  subcontract: { label: m.enum_item_category_subcontract, variant: 'outline' },
  service_expense: { label: m.enum_item_category_service_expense, variant: 'secondary' },
  kit: { label: m.enum_item_category_kit, variant: 'outline' },
}

export function getItemCategoryLabel(category: ItemCategory): string {
  return itemCategoryConfig[category]?.label() ?? category
}

export function getItemCategoryVariant(category: ItemCategory): BadgeVariant {
  return itemCategoryConfig[category]?.variant ?? 'default'
}

// Item Status
export const itemStatusConfig: Record<ItemStatus, EnumDisplayConfig> = {
  active: { label: m.enum_item_status_active, variant: 'default' },
  inactive: { label: m.enum_item_status_inactive, variant: 'secondary' },
  obsolete: { label: m.enum_item_status_obsolete, variant: 'destructive' },
}

export function getItemStatusLabel(status: ItemStatus): string {
  return itemStatusConfig[status]?.label() ?? status
}

export function getItemStatusVariant(status: ItemStatus): BadgeVariant {
  return itemStatusConfig[status]?.variant ?? 'default'
}

// ABC Class
export const abcClassLabels: EnumLabelMap<AbcClass> = {
  A: m.enum_abc_class_A,
  B: m.enum_abc_class_B,
  C: m.enum_abc_class_C,
  D: m.enum_abc_class_D,
}

// Unit of Measure
export const unitOfMeasureLabels: EnumLabelMap<UnitOfMeasure> = {
  PZ: m.enum_uom_PZ,
  KG: m.enum_uom_KG,
  G: m.enum_uom_G,
  T: m.enum_uom_T,
  LT: m.enum_uom_LT,
  ML: m.enum_uom_ML,
  M: m.enum_uom_M,
  CM: m.enum_uom_CM,
  MM: m.enum_uom_MM,
  M2: m.enum_uom_M2,
  M3: m.enum_uom_M3,
  SET: m.enum_uom_SET,
  BOX: m.enum_uom_BOX,
  PAL: m.enum_uom_PAL,
  ROL: m.enum_uom_ROL,
  FOG: m.enum_uom_FOG,
  PR: m.enum_uom_PR,
  CF: m.enum_uom_CF,
  H: m.enum_uom_H,
  NR: m.enum_uom_NR,
}

// Weight Unit
export const weightUnitLabels: EnumLabelMap<WeightUnit> = {
  KG: m.enum_weight_unit_KG,
  G: m.enum_weight_unit_G,
  LB: m.enum_weight_unit_LB,
  OZ: m.enum_weight_unit_OZ,
  T: m.enum_weight_unit_T,
}

// Dimension Unit
export const dimensionUnitLabels: EnumLabelMap<DimensionUnit> = {
  MM: m.enum_dimension_unit_MM,
  CM: m.enum_dimension_unit_CM,
  M: m.enum_dimension_unit_M,
  IN: m.enum_dimension_unit_IN,
  FT: m.enum_dimension_unit_FT,
}

// Quotation Status
export const quotationStatusConfig: Record<QuotationStatus, EnumDisplayConfig> = {
  open: { label: m.enum_quotation_status_open, variant: 'default' },
  approved: { label: m.enum_quotation_status_approved, variant: 'success' },
  rejected: { label: m.enum_quotation_status_rejected, variant: 'destructive' },
  superseded: { label: m.enum_quotation_status_superseded, variant: 'default' },
}

export function getQuotationStatusLabel(status: Quotation['state']): string {
  return quotationStatusConfig[status]?.label() ?? status
}

export function getQuotationStatusVariant(status: Quotation['state']): BadgeVariant {
  return quotationStatusConfig[status]?.variant ?? 'default'
}

// Quotation Tags
export const quotationTagConfig: Record<QuotationTag, EnumDisplayConfig> = {
  expired: { label: m.enum_quotation_tag_expired, variant: 'destructive' },
  sent: { label: m.enum_quotation_tag_sent, variant: 'default' },
}

export function getQuotationTagLabel(tag: QuotationTag): string {
  return quotationTagConfig[tag]?.label() ?? tag
}

// Incoterm Labels
export const incotermLabels: EnumLabelMap<Incoterm> = {
  EXW: () => 'EXW - Ex Works',
  FCA: () => 'FCA - Free Carrier',
  FAS: () => 'FAS - Free Alongside Ship',
  FOB: () => 'FOB - Free on Board',
  CFR: () => 'CFR - Cost and Freight',
  CIF: () => 'CIF - Cost, Insurance and Freight',
  CPT: () => 'CPT - Carriage Paid To',
  CIP: () => 'CIP - Carriage and Insurance Paid To',
  DAP: () => 'DAP - Delivered at Place',
  DPU: () => 'DPU - Delivered at Place Unloaded',
  DDP: () => 'DDP - Delivered Duty Paid',
}

// Sales Transaction Type Labels
export const salesTransactionTypeLabels: EnumLabelMap<SalesTransactionType> = {
  'VEN': () => 'VEN - Vendita',
  'VEN-EXP': () => 'VEN-EXP - Vendita Export',
  'VEN-UE': () => 'VEN-UE - Vendita UE',
  'VEN-TRI': () => 'VEN-TRI - Vendita Triangolazione',
  'C/VIS': () => 'C/VIS - Conto Visione',
  'C/VIS-RES': () => 'C/VIS-RES - Reso Conto Visione',
  'C/LAV': () => 'C/LAV - Conto Lavoro',
  'C/LAV-RES': () => 'C/LAV-RES - Reso Conto Lavoro',
  'RES': () => 'RES - Reso',
  'OMG': () => 'OMG - Omaggio',
  'TRASF': () => 'TRASF - Trasferimento',
  'RIP': () => 'RIP - Riparazione',
  'RIP-RES': () => 'RIP-RES - Reso Riparazione',
  'CAMP': () => 'CAMP - Campionatura',
}
