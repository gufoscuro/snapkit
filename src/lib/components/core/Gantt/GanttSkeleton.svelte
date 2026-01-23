<!--
  @component GanttSkeleton
  @description Loading skeleton for the GanttChart component
  @keywords skeleton, loading, gantt, placeholder
  @uses Skeleton
-->
<script lang="ts">
  import { Skeleton } from '$components/ui/skeleton'

  type GanttSkeletonProps = {
    /** Width of the sidebar in pixels */
    sidebarWidth?: number
    /** Width of each time unit in pixels */
    unitWidth?: number
    /** Number of time units to show */
    unitsToShow?: number
    /** Number of sidebar columns */
    columns?: number
    /** Number of skeleton rows to display */
    rows?: number
    /** Additional CSS classes */
    class?: string
  }

  let {
    sidebarWidth = 200,
    unitWidth = 80,
    unitsToShow = 14,
    columns = 1,
    rows = 5,
    class: className
  }: GanttSkeletonProps = $props()

  let timelineWidth = $derived(unitWidth * unitsToShow)
</script>

<div class="flex flex-col h-full border rounded-lg overflow-hidden bg-background {className ?? ''}">
  <!-- Header skeleton -->
  <div class="flex items-center justify-between p-4 border-b bg-muted/30">
    <div class="flex items-center gap-2">
      <Skeleton class="h-8 w-8" />
      <Skeleton class="h-8 w-20" />
      <Skeleton class="h-8 w-8" />
    </div>
    <Skeleton class="h-5 w-48" />
    <Skeleton class="h-5 w-32" />
  </div>

  <!-- Content skeleton -->
  <div class="flex-1 overflow-hidden">
    <div class="min-w-max">
      <!-- Timeline header skeleton -->
      <div class="flex border-b bg-muted/20">
        <div class="shrink-0 flex border-r" style="width: {sidebarWidth}px">
          {#each Array(columns) as _, i (i)}
            <div class="p-3" style="width: {sidebarWidth / columns}px">
              <Skeleton class="h-4 w-20" />
            </div>
          {/each}
        </div>
        <div class="flex">
          {#each Array(unitsToShow) as _, i (i)}
            <div
              class="text-center py-2 border-r"
              style="width: {unitWidth}px"
            >
              <Skeleton class="h-3 w-8 mx-auto mb-1" />
              <Skeleton class="h-3 w-12 mx-auto" />
            </div>
          {/each}
        </div>
      </div>

      <!-- Rows skeleton -->
      {#each Array(rows) as _, rowIndex (rowIndex)}
        <div class="flex border-b">
          <div class="shrink-0 flex border-r p-3" style="width: {sidebarWidth}px">
            <div class="space-y-1">
              <Skeleton class="h-4 w-32" />
              <Skeleton class="h-3 w-24" />
            </div>
          </div>
          <div
            class="relative h-16"
            style="width: {timelineWidth}px"
          >
            <!-- Random positioned bar skeleton -->
            <Skeleton
              class="absolute top-3 h-10 rounded-md"
              style="left: {(rowIndex * 2 + 1) * unitWidth}px; width: {(3 + rowIndex % 3) * unitWidth - 8}px"
            />
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
