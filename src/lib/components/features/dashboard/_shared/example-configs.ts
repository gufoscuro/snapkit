import type { WidgetConfig } from './widget-contracts'

/**
 * Hand-authored widget configs that reproduce the original bespoke home KPIs
 * (RevenueKpi, ToShipKpi) purely as data — the "field test" for the
 * config-driven model. These currently live in code; the end state is the same
 * objects persisted in the page config's `widgets` array (DB), or emitted by
 * the chatbot. Keep them here as the canonical worked examples.
 */

export const revenueWidgetConfig: WidgetConfig = {
  id: 'revenue',
  type: 'kpi',
  title: { key: 'dashboard_revenue_title' },
  icon: 'Euro',
  source: { endpoint: 'revenue', params: { period: 'current_month' } },
  action: { pageId: 'sales-orders' },
  display: {
    subtext: { key: 'dashboard_revenue_subtext' },
    noTrendSubtext: { key: 'dashboard_revenue_this_month' },
  },
}

export const toShipWidgetConfig: WidgetConfig = {
  id: 'to-ship',
  type: 'kpi',
  title: { key: 'dashboard_to_ship_title' },
  icon: 'Truck',
  source: { endpoint: 'to-ship', params: { period: 'current_week' } },
  action: { pageId: 'to-ship' },
  display: {
    subtext: { key: 'dashboard_to_ship_subtext' },
    zeroIsPositive: true,
    zeroLabel: { key: 'dashboard_all_clear' },
    zeroSubtext: { key: 'dashboard_to_ship_zero' },
  },
  additionalKpis: [
    {
      label: { key: 'dashboard_to_ship_overdue' },
      emphasis: 'warning',
      hideWhenZero: true,
      action: { pageId: 'to-ship' },
    },
  ],
}

export const toInvoiceWidgetConfig: WidgetConfig = {
  id: 'to-invoice',
  type: 'kpi',
  title: { key: 'dashboard_to_invoice_title' },
  icon: 'FileText',
  source: { endpoint: 'to-invoice', params: { period: 'current_week' } },
  action: { pageId: 'to-invoice' },
  display: {
    subtext: { key: 'dashboard_to_invoice_subtext' },
    zeroIsPositive: true,
    zeroLabel: { key: 'dashboard_all_clear' },
    zeroSubtext: { key: 'dashboard_to_invoice_zero' },
  },
}

export const toCollectWidgetConfig: WidgetConfig = {
  id: 'to-collect',
  type: 'kpi',
  title: { key: 'dashboard_to_collect_title' },
  icon: 'Banknote',
  source: { endpoint: 'to-collect', params: { period: 'current_week' } },
  action: { pageId: 'payments' },
  display: {
    subtext: { key: 'dashboard_to_collect_subtext' },
    zeroIsPositive: true,
    zeroLabel: { key: 'dashboard_all_clear' },
    zeroSubtext: { key: 'dashboard_to_collect_zero' },
  },
}

/**
 * Payables: open supplier scadenze in EUR. The payload's `filters` (currency)
 * deep-link to "Da pagare"; the overdue figure carries its own filters.
 */
export const toPayWidgetConfig: WidgetConfig = {
  id: 'to-pay',
  type: 'kpi',
  title: { key: 'dashboard_to_pay_title' },
  icon: 'HandCoins',
  source: { endpoint: 'to-pay' },
  action: { pageId: 'to-pay' },
  display: {
    subtext: { key: 'dashboard_to_pay_subtext' },
    zeroIsPositive: true,
    zeroLabel: { key: 'dashboard_all_clear' },
    zeroSubtext: { key: 'dashboard_to_pay_zero' },
  },
  additionalKpis: [
    {
      label: { key: 'dashboard_to_pay_overdue' },
      emphasis: 'danger',
      hideWhenZero: true,
      action: { pageId: 'to-pay' },
    },
  ],
}

/** Received invoices needing attention: still to link + never opened (status=to_link,new). */
export const supplierInvoicesToHandleWidgetConfig: WidgetConfig = {
  id: 'supplier-invoices-to-handle',
  type: 'kpi',
  title: { key: 'dashboard_supplier_invoices_to_handle_title' },
  icon: 'FileInput',
  source: { endpoint: 'supplier-invoices-to-handle' },
  action: { pageId: 'supplier-invoices' },
  display: {
    subtext: { key: 'dashboard_supplier_invoices_to_handle_subtext' },
    zeroIsPositive: true,
    zeroLabel: { key: 'dashboard_all_clear' },
    zeroSubtext: { key: 'dashboard_supplier_invoices_to_handle_zero' },
  },
}

export const monthlyRevenueWidgetConfig: WidgetConfig = {
  id: 'monthly-revenue',
  type: 'chart',
  title: { key: 'dashboard_chart_title' },
  icon: 'ChartColumn',
  source: { endpoint: 'monthly-revenue', params: { months: '12' } },
  display: {
    chartType: 'bar',
    subtitle: { key: 'dashboard_chart_subtitle' },
    footnote: { key: 'dashboard_chart_partial_note' },
    series: { total: { label: { key: 'dashboard_chart_series_label' } } },
  },
}
