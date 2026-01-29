<!--
  @component ProductionGantt
  @description Gantt chart view of production items showing planned, in-progress, and completed production tasks.
  @keywords gantt, production, timeline, schedule, planning, manufacturing
  @uses GanttChart, Badge
-->
<script lang="ts">
  import { GanttChart, type SidebarColumn, type ColorConfig, type ViewMode } from '$components/core/Gantt'
  import Badge from '$components/ui/badge/badge.svelte'
  import { apiRequest } from '$lib/utils/request'

  type ProductionStatus = 'planned' | 'in_progress' | 'completed'

  type ProductionItem = {
    id: string
    starts_at: string
    ends_at: string
    product_name: string
    product_internal_id: string
    status: ProductionStatus
  }

  type GanttProductionItem = {
    id: string
    startDate: string
    endDate: string
    productName: string
    productInternalId: string
    status: ProductionStatus
  }

  type Props = {
    /** Initial view mode for the Gantt chart */
    viewMode?: ViewMode
    /** Number of time units to show */
    unitsToShow?: number
    /** Width of each time unit in pixels */
    unitWidth?: number
    /** Callback when a production item is clicked */
    onItemClick?: (item: GanttProductionItem) => void
    /** Additional CSS classes */
    class?: string
  }

  let {
    viewMode = 'day',
    unitsToShow = 14,
    unitWidth = 80,
    onItemClick,
    class: className
  }: Props = $props()

  let items = $state<GanttProductionItem[]>([])
  let loading = $state(true)

  const sidebarColumns: SidebarColumn<GanttProductionItem>[] = [
    {
      key: 'productName',
      header: 'Product',
      width: 200,
      render: (item) => item.productName
    },
    {
      key: 'productInternalId',
      header: 'ID',
      width: 100,
      render: (item) => item.productInternalId
    }
  ]

  const colorConfig: ColorConfig<GanttProductionItem> = {
    getColor: (item) => {
      switch (item.status) {
        case 'planned':
          return 'bg-blue-500'
        case 'in_progress':
          return 'bg-amber-500'
        case 'completed':
          return 'bg-green-500'
        default:
          return 'bg-primary'
      }
    },
    getTextColor: () => 'text-white'
  }

  async function fetchProductionItems(from: Date, to: Date) {
    loading = true
    try {
      const response = await apiRequest<ProductionItem[]>({
        url: 'product/production/_search',
        method: 'POST',
        data: {
          statuses: [
            {
              status: 'planned',
              from: from.toISOString(),
              to: to.toISOString()
            },
            {
              status: 'in_progress'
            },
            {
              status: 'completed',
              from: from.toISOString(),
              to: to.toISOString()
            }
          ]
        }
      })

      items = response.map((item) => ({
        id: item.id,
        startDate: item.starts_at,
        endDate: item.ends_at,
        productName: item.product_name,
        productInternalId: item.product_internal_id,
        status: item.status
      }))
    } finally {
      loading = false
    }
  }

  function handleItemClick(item: GanttProductionItem) {
    onItemClick?.(item)
  }

  function getStatusVariant(status: ProductionStatus): 'default' | 'secondary' | 'outline' {
    switch (status) {
      case 'planned':
        return 'secondary'
      case 'in_progress':
        return 'default'
      case 'completed':
        return 'outline'
    }
  }

  function formatStatus(status: ProductionStatus): string {
    switch (status) {
      case 'planned':
        return 'Planned'
      case 'in_progress':
        return 'In Progress'
      case 'completed':
        return 'Completed'
    }
  }
</script>

{#snippet barContent(item: GanttProductionItem)}
  <span class="truncate">{item.productName}</span>
{/snippet}

{#snippet tooltip(item: GanttProductionItem)}
  <div class="space-y-2">
    <div class="font-semibold">{item.productName}</div>
    <div class="text-muted-foreground">ID: {item.productInternalId}</div>
    <div class="flex items-center gap-2">
      <span class="text-muted-foreground">Status:</span>
      <Badge variant={getStatusVariant(item.status)}>{formatStatus(item.status)}</Badge>
    </div>
  </div>
{/snippet}

<GanttChart
  {items}
  {sidebarColumns}
  {colorConfig}
  {viewMode}
  {unitsToShow}
  {unitWidth}
  {loading}
  onDateRangeChange={fetchProductionItems}
  onItemClick={handleItemClick}
  {barContent}
  {tooltip}
  class={className}
/>
