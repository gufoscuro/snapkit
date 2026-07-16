import { monthlyRevenueWidgetConfig } from '../../_shared/example-configs'
import type { WidgetConfig } from '../../_shared/widget-contracts'

/**
 * Mock props for ChartWidget preview in the admin panel. Uses the monthly-revenue
 * example config (a 12-month bar chart), rendered from `CHART_MOCKS['monthly-revenue']`.
 */
export const mockChartWidgetConfig: WidgetConfig = monthlyRevenueWidgetConfig
