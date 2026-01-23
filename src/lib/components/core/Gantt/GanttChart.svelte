<!--
  @component GanttChart
  @description Generic Gantt chart component supporting multiple view modes,
  custom renderers via snippets, drag support, and flexible data sources.
  @keywords gantt, chart, timeline, schedule, planning, calendar
  @uses ScrollArea, Button, dayjs
-->
<script lang="ts" generics="T extends GanttItem">
  import { ScrollArea, ScrollAreaScrollbar } from '$components/ui/scroll-area'
  import { Button } from '$components/ui/button'
  import * as m from '$lib/paraglide/messages.js'
  import dayjs, { type Dayjs } from 'dayjs'
  import duration from 'dayjs/plugin/duration'
  import isBetween from 'dayjs/plugin/isBetween'
  import weekOfYear from 'dayjs/plugin/weekOfYear'
  import ChevronLeft from 'lucide-svelte/icons/chevron-left'
  import ChevronRight from 'lucide-svelte/icons/chevron-right'
  import Calendar from 'lucide-svelte/icons/calendar'
  import GanttSkeleton from './GanttSkeleton.svelte'
  import type {
    GanttItem,
    ViewMode,
    SidebarColumn,
    GanttChartProps
  } from './types'

  // Initialize dayjs plugins
  dayjs.extend(duration)
  dayjs.extend(isBetween)
  dayjs.extend(weekOfYear)

  let {
    items,
    sidebarColumns,
    colorConfig,
    viewMode = 'day',
    unitsToShow = 14,
    unitWidth = 80,
    showTodayMarker = true,
    highlightWeekends = true,
    loading = false,
    todayLabel,
    emptyMessage,
    onDateRangeChange,
    onItemClick,
    onItemDrag,
    tooltip,
    barContent,
    sidebarCell,
    headerActions,
    class: className
  }: GanttChartProps<T> = $props()

  // Internal state
  let viewStart = $state(dayjs().startOf('day'))
  let isDragging = $state(false)
  let dragItem = $state<T | null>(null)
  let dragStartX = $state(0)
  let dragOriginalStart = $state<Dayjs | null>(null)

  // Computed values
  let viewEnd = $derived(getViewEnd(viewStart, viewMode, unitsToShow))
  let timeUnits = $derived(generateTimeUnits(viewStart, viewMode, unitsToShow))
  let sidebarWidth = $derived(
    sidebarColumns.reduce((sum, col) => sum + (col.width ?? 150), 0)
  )

  // Process items with dayjs
  let processedItems = $derived(
    items.map(item => ({
      ...item,
      _startDay: dayjs(item.startDate),
      _endDay: dayjs(item.endDate)
    })).filter(item =>
      item._startDay.isBefore(viewEnd) && item._endDay.isAfter(viewStart)
    ).sort((a, b) => a._startDay.unix() - b._startDay.unix())
  )

  // Helper functions
  function getViewEnd(start: Dayjs, mode: ViewMode, units: number): Dayjs {
    switch (mode) {
      case 'day':
        return start.add(units, 'day')
      case 'week':
        return start.add(units, 'week')
      case 'month':
        return start.add(units, 'month')
    }
  }

  function generateTimeUnits(start: Dayjs, mode: ViewMode, units: number) {
    return Array.from({ length: units }, (_, i) => {
      switch (mode) {
        case 'day':
          return start.add(i, 'day')
        case 'week':
          return start.add(i, 'week').startOf('week')
        case 'month':
          return start.add(i, 'month').startOf('month')
      }
    })
  }

  function formatTimeUnit(date: Dayjs, mode: ViewMode): { primary: string; secondary: string } {
    switch (mode) {
      case 'day':
        return {
          primary: date.format('ddd'),
          secondary: date.format('D MMM')
        }
      case 'week':
        return {
          primary: `W${date.week()}`,
          secondary: date.format('D MMM')
        }
      case 'month':
        return {
          primary: date.format('MMM'),
          secondary: date.format('YYYY')
        }
    }
  }

  function isWeekend(date: Dayjs): boolean {
    return date.day() === 0 || date.day() === 6
  }

  function isToday(date: Dayjs, mode: ViewMode): boolean {
    const today = dayjs()
    switch (mode) {
      case 'day':
        return date.isSame(today, 'day')
      case 'week':
        return today.isBetween(date, date.add(1, 'week'), 'day', '[)')
      case 'month':
        return date.isSame(today, 'month')
    }
  }

  function getBarStyle(item: { _startDay: Dayjs; _endDay: Dayjs }) {
    const clampedStart = item._startDay.isBefore(viewStart) ? viewStart : item._startDay
    const clampedEnd = item._endDay.isAfter(viewEnd) ? viewEnd : item._endDay

    let startOffset: number
    let durationUnits: number

    if (viewMode === 'week') {
      startOffset = clampedStart.diff(viewStart, 'week', true)
      durationUnits = Math.max(0.5, clampedEnd.diff(clampedStart, 'week', true) + 1)
    } else if (viewMode === 'month') {
      startOffset = clampedStart.diff(viewStart, 'month', true)
      durationUnits = Math.max(0.5, clampedEnd.diff(clampedStart, 'month', true) + 1)
    } else {
      // day (default)
      startOffset = clampedStart.diff(viewStart, 'day')
      durationUnits = Math.max(1, clampedEnd.diff(clampedStart, 'day') + 1)
    }

    const left = startOffset * unitWidth
    const width = durationUnits * unitWidth - 8

    return `left: ${left}px; width: ${Math.max(width, 20)}px;`
  }

  function getItemColor(item: T): string {
    return colorConfig?.getColor(item) ?? 'bg-primary'
  }

  function getItemTextColor(item: T): string {
    return colorConfig?.getTextColor?.(item) ?? 'text-primary-foreground'
  }

  // Navigation functions
  function navigatePrev() {
    switch (viewMode) {
      case 'day':
        viewStart = viewStart.subtract(7, 'day')
        break
      case 'week':
        viewStart = viewStart.subtract(4, 'week')
        break
      case 'month':
        viewStart = viewStart.subtract(3, 'month')
        break
    }
  }

  function navigateNext() {
    switch (viewMode) {
      case 'day':
        viewStart = viewStart.add(7, 'day')
        break
      case 'week':
        viewStart = viewStart.add(4, 'week')
        break
      case 'month':
        viewStart = viewStart.add(3, 'month')
        break
    }
  }

  function navigateToday() {
    viewStart = dayjs().startOf('day')
  }

  // Event handlers
  function handleItemClick(item: T) {
    if (!isDragging) {
      onItemClick?.(item)
    }
  }

  function handleDragStart(e: MouseEvent, item: T & { _startDay: Dayjs }) {
    if (!onItemDrag) return
    isDragging = true
    dragItem = item
    dragStartX = e.clientX
    dragOriginalStart = item._startDay
  }

  function handleDragMove(e: MouseEvent) {
    if (!isDragging || !dragItem || !dragOriginalStart || !onItemDrag) return

    const deltaX = e.clientX - dragStartX
    const deltaUnits = Math.round(deltaX / unitWidth)

    if (deltaUnits !== 0) {
      const typedItem = dragItem as T & { _startDay: Dayjs; _endDay: Dayjs }
      const originalDuration = typedItem._endDay.diff(typedItem._startDay, 'day')

      let newStart: Dayjs
      if (viewMode === 'week') {
        newStart = dragOriginalStart.add(deltaUnits, 'week')
      } else if (viewMode === 'month') {
        newStart = dragOriginalStart.add(deltaUnits, 'month')
      } else {
        newStart = dragOriginalStart.add(deltaUnits, 'day')
      }

      const newEnd = newStart.add(originalDuration, 'day')
      onItemDrag(dragItem, newStart.toDate(), newEnd.toDate())
    }
  }

  function handleDragEnd() {
    isDragging = false
    dragItem = null
    dragOriginalStart = null
  }

  // Effect to notify date range changes
  $effect(() => {
    const start = viewStart.toDate()
    const end = viewEnd.toDate()
    onDateRangeChange?.(start, end)
  })

  // Format date range for header
  function formatDateRange(): string {
    if (viewMode === 'week') {
      return `${viewStart.format('D MMM YYYY')} - ${viewEnd.subtract(1, 'week').format('D MMM YYYY')}`
    } else if (viewMode === 'month') {
      return `${viewStart.format('MMM YYYY')} - ${viewEnd.subtract(1, 'month').format('MMM YYYY')}`
    }
    return `${viewStart.format('D MMM YYYY')} - ${viewEnd.subtract(1, 'day').format('D MMM YYYY')}`
  }
</script>

<svelte:window
  onmousemove={handleDragMove}
  onmouseup={handleDragEnd}
/>

{#if loading}
  <GanttSkeleton
    {sidebarWidth}
    {unitWidth}
    {unitsToShow}
    columns={sidebarColumns.length}
    class={className}
  />
{:else}
  <div
    class="gantt-container flex flex-col h-full border rounded-lg overflow-hidden bg-background {className ?? ''}"
    role="grid"
    aria-label="Gantt Chart"
  >
    <!-- Header with navigation -->
    <div class="flex items-center justify-between p-4 border-b bg-muted/30">
      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" onclick={navigatePrev} aria-label="Previous period">
          <ChevronLeft class="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onclick={navigateToday}>
          <Calendar class="h-4 w-4 mr-2" />
          {todayLabel ?? m.gantt_today()}
        </Button>
        <Button variant="outline" size="sm" onclick={navigateNext} aria-label="Next period">
          <ChevronRight class="h-4 w-4" />
        </Button>
      </div>
      <div class="text-sm font-medium">
        {formatDateRange()}
      </div>
      {#if headerActions}
        <div class="flex items-center gap-2">
          {@render headerActions()}
        </div>
      {:else}
        <div></div>
      {/if}
    </div>

    <!-- Gantt content -->
    <ScrollArea class="flex-1">
      <div class="min-w-max">
        <!-- Timeline header -->
        <div class="flex border-b bg-muted/20 sticky top-0 z-10">
          <!-- Sidebar header -->
          <div class="shrink-0 flex border-r" style="width: {sidebarWidth}px">
            {#each sidebarColumns as column (column.key)}
              <div
                class="p-3 font-medium text-sm border-r last:border-r-0"
                style="width: {column.width ?? 150}px"
              >
                {column.header}
              </div>
            {/each}
          </div>
          <!-- Time units header -->
          <div class="flex">
            {#each timeUnits as unit (unit.format('YYYY-MM-DD'))}
              {@const weekend = viewMode === 'day' && highlightWeekends && isWeekend(unit)}
              {@const today = showTodayMarker && isToday(unit, viewMode)}
              {@const formatted = formatTimeUnit(unit, viewMode)}
              <div
                class="text-center text-xs py-2 border-r {weekend ? 'bg-muted/50 text-muted-foreground' : ''} {today ? 'bg-primary/10' : ''}"
                style="width: {unitWidth}px"
              >
                <div class="font-medium">{formatted.primary}</div>
                <div>{formatted.secondary}</div>
              </div>
            {/each}
          </div>
        </div>

        <!-- Items -->
        {#if processedItems.length === 0}
          <div class="flex items-center justify-center py-12 text-muted-foreground">
            {emptyMessage ?? m.gantt_no_items()}
          </div>
        {:else}
          {#each processedItems as item (item.id)}
            <div class="flex border-b hover:bg-muted/20 transition-colors" role="row">
              <!-- Sidebar cells -->
              <div class="shrink-0 flex border-r" style="width: {sidebarWidth}px">
                {#each sidebarColumns as column (column.key)}
                  <div
                    class="p-3 border-r last:border-r-0 overflow-hidden"
                    style="width: {column.width ?? 150}px"
                    role="gridcell"
                  >
                    {#if sidebarCell}
                      {@render sidebarCell(item, column)}
                    {:else if column.render}
                      <span class="truncate block">{column.render(item)}</span>
                    {:else}
                      <span class="truncate block">{(item as Record<string, unknown>)[column.key] ?? ''}</span>
                    {/if}
                  </div>
                {/each}
              </div>
              <!-- Timeline area -->
              <div
                class="relative flex-1 h-16"
                style="min-width: {unitWidth * unitsToShow}px"
              >
                <!-- Grid lines -->
                <div class="absolute inset-0 flex pointer-events-none">
                  {#each timeUnits as unit (unit.format('YYYY-MM-DD'))}
                    {@const weekend = viewMode === 'day' && highlightWeekends && isWeekend(unit)}
                    {@const today = showTodayMarker && isToday(unit, viewMode)}
                    <div
                      class="border-r h-full {weekend ? 'bg-muted/30' : ''} {today ? 'bg-primary/5' : ''}"
                      style="width: {unitWidth}px"
                    ></div>
                  {/each}
                </div>
                <!-- Item bar -->
                <button
                  type="button"
                  class="gantt-bar absolute top-3 h-10 rounded-md px-2 text-xs font-medium
                         flex items-center cursor-pointer hover:brightness-110 transition-all
                         shadow-sm {getItemColor(item)} {getItemTextColor(item)}
                         {onItemDrag ? 'cursor-grab active:cursor-grabbing' : ''}"
                  style={getBarStyle(item)}
                  onclick={() => handleItemClick(item)}
                  onmousedown={(e) => handleDragStart(e, item)}
                  role="gridcell"
                  aria-label="Item: {item.id}"
                >
                  {#if barContent}
                    {@render barContent(item)}
                  {:else}
                    <span class="truncate">{item.id}</span>
                  {/if}
                  {#if tooltip}
                    <div class="gantt-tooltip">
                      {@render tooltip(item)}
                    </div>
                  {/if}
                </button>
              </div>
            </div>
          {/each}
        {/if}
      </div>
      <ScrollAreaScrollbar orientation="horizontal" />
    </ScrollArea>
  </div>
{/if}

<style>
  .gantt-bar {
    position: relative;
  }

  .gantt-tooltip {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 8px;
    padding: 8px 12px;
    background: hsl(var(--popover));
    color: hsl(var(--popover-foreground));
    border: 1px solid hsl(var(--border));
    border-radius: 6px;
    font-size: 12px;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.15s, visibility 0.15s;
    z-index: 50;
    pointer-events: none;
    min-width: 200px;
    white-space: normal;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  }

  .gantt-bar:hover .gantt-tooltip,
  .gantt-bar:focus .gantt-tooltip {
    opacity: 1;
    visibility: visible;
  }

  .gantt-tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: hsl(var(--border));
  }
</style>
