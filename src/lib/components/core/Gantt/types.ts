import type { Snippet } from 'svelte'

/** Base interface that all Gantt items must implement */
export type GanttItem = {
  id: string
  startDate: string | Date
  endDate: string | Date
}

/** View mode for the Gantt chart */
export type ViewMode = 'day' | 'week' | 'month'

/** Sidebar column definition */
export type SidebarColumn<T> = {
  key: string
  header: string
  width?: number
  render?: (item: T) => string
}

/** Color configuration for items */
export type ColorConfig<T> = {
  getColor: (item: T) => string
  getTextColor?: (item: T) => string
}

/** Props for the GanttChart component */
export type GanttChartProps<T extends GanttItem> = {
  /** Array of items to display */
  items: T[]
  /** Sidebar columns configuration */
  sidebarColumns: SidebarColumn<T>[]
  /** Color configuration for bars */
  colorConfig?: ColorConfig<T>
  /** Current view mode */
  viewMode?: ViewMode
  /** Number of units to show based on view mode */
  unitsToShow?: number
  /** Width of each time unit in pixels */
  unitWidth?: number
  /** Whether to show today marker */
  showTodayMarker?: boolean
  /** Whether to highlight weekends */
  highlightWeekends?: boolean
  /** Whether initial data is loading */
  loading?: boolean
  /** Custom today button label */
  todayLabel?: string
  /** Custom empty state message */
  emptyMessage?: string
  /** Callback when date range changes (for data fetching) */
  onDateRangeChange?: (start: Date, end: Date) => void | Promise<void>
  /** Callback when an item is clicked */
  onItemClick?: (item: T) => void
  /** Callback when an item is dragged (if drag enabled) */
  onItemDrag?: (item: T, newStart: Date, newEnd: Date) => void | Promise<void>
  /** Custom snippet for rendering the tooltip */
  tooltip?: Snippet<[T]>
  /** Custom snippet for rendering bar content */
  barContent?: Snippet<[T]>
  /** Custom snippet for rendering sidebar cell */
  sidebarCell?: Snippet<[T, SidebarColumn<T>]>
  /** Custom snippet for header actions (right side) */
  headerActions?: Snippet
  /** Additional CSS classes */
  class?: string
}
