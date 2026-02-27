import * as m from '$lib/paraglide/messages.js'
import type {
  AnnualRevenueRange,
  AtecoCode,
  CompanySize,
  Currency,
  Customer,
  EmployeeCountRange,
  SalesOrderSummary,
  SupplyOrderSummary,
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
export const customerStatusConfig: Record<Customer['status'], EnumDisplayConfig> = {
  active: { label: m.enum_customer_status_active, variant: 'default' },
  suspended: { label: m.enum_customer_status_suspended, variant: 'outline' },
  blocked: { label: m.enum_customer_status_blocked, variant: 'destructive' },
  ceased: { label: m.enum_customer_status_ceased, variant: 'secondary' },
  prospect: { label: m.enum_customer_status_prospect, variant: 'secondary' },
}

export function getCustomerStatusLabel(status: Customer['status']): string {
  return customerStatusConfig[status]?.label() ?? status
}

export function getCustomerStatusVariant(status: Customer['status']): BadgeVariant {
  return customerStatusConfig[status]?.variant ?? 'default'
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
