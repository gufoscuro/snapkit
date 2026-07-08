import { toShipWidgetConfig } from '../../_shared/example-configs'
import type { WidgetConfig } from '../../_shared/widget-contracts'

/**
 * Mock props for KpiWidget preview in the admin panel. Uses the to-ship example
 * config (headline count + a clickable "overdue" secondary metric), which the
 * generic fetcher renders from `KPI_MOCKS['to-ship']`.
 */
export const mockKpiWidgetConfig: WidgetConfig = toShipWidgetConfig
