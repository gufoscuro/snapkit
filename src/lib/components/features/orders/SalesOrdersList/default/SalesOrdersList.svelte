<!--
  @component SalesOrdersList
  @description Displays a filterable list of all sales orders with inline priority editing.
  Shows order code, customer, shipping date, priority (editable via badge selector), and status.
  Supports filtering by sales channel with infinite scroll pagination.
  @keywords orders, sales, list, table, filter, channel, priority, inline-edit, infinite-scroll
  @uses Table, Badge, Empty, Skeleton, Select, DropdownMenu
  @api GET /order (sales-api) -> orderSummary[]
  @api GET /sales-channel (sales-api) -> salesChannelSummary[]
  @api POST /order/{orderId}/_update-priority (sales-api)
-->

<script lang="ts" module>
  /**
   * Order summary type from sales-api GET /order endpoint
   */
  export type OrderSummary = {
    id?: string
    internal_id?: string
    external_id?: string
    customer_attr?: {
      address?: string
      country?: string
      id?: string
      name: string
      vat: string
    }
    sales_channel_attr?: {
      extra_id?: string
      id: string
      name: string
    }
    status: 'draft' | 'accepted' | 'sent'
    shipped?: 'completed' | 'not shipped' | 'partial'
    time?: string
    expected_shipping_time: string
    total_vat_incl: number
    default_currency?: string
    priority?: number
  }

  /**
   * Sales channel summary type from sales-api GET /sales-channel endpoint
   */
  export type SalesChannelSummary = {
    id?: string
    name: string
    status: 'active' | 'inactive'
    type: 'b2b' | 'e-commerce'
  }

  /**
   * Priority levels with labels and styling
   */
  export const PRIORITY_OPTIONS = [
    { value: 0, label: 'Nessuna', class: 'bg-stone-200/50 text-stone-700 border-stone-700/20' },
    { value: 1, label: 'Bassa', class: 'bg-blue-500/20 text-blue-700 border-blue-700/20' },
    { value: 2, label: 'Media', class: 'bg-yellow-500/20 text-yellow-700 border-yellow-700/20' },
    { value: 3, label: 'Alta', class: 'bg-orange-500/20 text-orange-700 border-orange-700/20' },
    { value: 4, label: 'Urgente', class: 'bg-red-500/20 text-red-700 border-red-700/20' }
  ] as const
</script>

<script lang="ts">
  import { onMount } from 'svelte'
  import * as Table from '$lib/components/ui/table'
  import * as Empty from '$lib/components/ui/empty'
  import * as Select from '$lib/components/ui/select'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import { Badge } from '$lib/components/ui/badge'
  import { Skeleton } from '$lib/components/ui/skeleton'
  import { Button } from '$lib/components/ui/button'
  import { apiRequest } from '$lib/utils/request'
  import { cn } from '$lib/utils'
  import { createQueryRequestObject, DEFAULT_ITEMS_LIMIT } from '$lib/utils/filters'

  const PAGE_SIZE = DEFAULT_ITEMS_LIMIT

  let orders = $state<OrderSummary[]>([])
  let channels = $state<SalesChannelSummary[]>([])
  let loading = $state(true)
  let loadingMore = $state(false)
  let error = $state<string | null>(null)
  let selectedChannelId = $state<string>('')
  let updatingPriority = $state<Record<string, boolean>>({})
  let hasMore = $state(true)
  let offset = $state(0)
  let sentinelEl = $state<HTMLDivElement | null>(null)

  const filteredOrders = $derived(
    selectedChannelId
      ? orders.filter((order) => order.sales_channel_attr?.id === selectedChannelId)
      : orders
  )

  const selectedChannelLabel = $derived(
    selectedChannelId
      ? channels.find((c) => c.id === selectedChannelId)?.name ?? 'Select channel'
      : 'All channels'
  )

  async function fetchOrders(reset = false) {
    if (reset) {
      offset = 0
      orders = []
      hasMore = true
    }

    if (!hasMore && !reset) return

    const isInitialLoad = orders.length === 0
    if (isInitialLoad) {
      loading = true
    } else {
      loadingMore = true
    }

    try {
      const queryParams = createQueryRequestObject({
        limit: PAGE_SIZE,
        offset: reset ? 0 : offset
      })

      const newOrders = await apiRequest<OrderSummary[]>({
        url: 'sales/order',
        queryParams
      })

      if (newOrders.length < PAGE_SIZE) {
        hasMore = false
      }

      if (reset) {
        orders = newOrders
      } else {
        orders = [...orders, ...newOrders]
      }

      offset = orders.length
    } catch (e) {
      error = e instanceof Error ? e.message : 'An error occurred while fetching orders'
    } finally {
      loading = false
      loadingMore = false
    }
  }

  async function fetchChannels() {
    try {
      const channelsData = await apiRequest<SalesChannelSummary[]>({ url: 'sales/sales-channel' })
      channels = channelsData.filter((c) => c.status === 'active')
    } catch (e) {
      console.error('Failed to fetch channels:', e)
    }
  }

  onMount(() => {
    fetchOrders()
    fetchChannels()
  })

  // Setup IntersectionObserver for infinite scroll
  $effect(() => {
    if (!sentinelEl) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && hasMore && !loadingMore && !loading) {
          fetchOrders()
        }
      },
      { rootMargin: '100px' }
    )

    observer.observe(sentinelEl)

    return () => observer.disconnect()
  })

  function formatDate(dateString?: string): string {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  function getStatusBadgeClass(status: OrderSummary['status']): string {
    switch (status) {
      case 'sent':
        return 'bg-success/20 text-success border-success/30'
      case 'accepted':
        return 'bg-blue-500/20 text-blue-700 border-blue-700/20'
      case 'draft':
      default:
        return 'bg-stone-200/50 text-stone-700 border-stone-700/20'
    }
  }

  function getStatusLabel(status: OrderSummary['status']): string {
    switch (status) {
      case 'sent':
        return 'Inviato'
      case 'accepted':
        return 'Accettato'
      case 'draft':
      default:
        return 'Bozza'
    }
  }

  function getPriorityOption(priority?: number) {
    return PRIORITY_OPTIONS.find((p) => p.value === (priority ?? 0)) ?? PRIORITY_OPTIONS[0]
  }

  async function updatePriority(orderId: string, newPriority: number) {
    if (!orderId) return

    const originalPriority = orders.find((o) => o.id === orderId)?.priority ?? 0
    if (newPriority === originalPriority) return

    updatingPriority[orderId] = true

    // Optimistically update local state
    orders = orders.map((order) =>
      order.id === orderId ? { ...order, priority: newPriority } : order
    )

    try {
      await apiRequest({
        url: `sales/order/${orderId}/_update-priority`,
        method: 'POST',
        data: { priority: newPriority }
      })
    } catch (e) {
      console.error('Failed to update priority:', e)
      // Revert on error
      orders = orders.map((order) =>
        order.id === orderId ? { ...order, priority: originalPriority } : order
      )
    } finally {
      updatingPriority[orderId] = false
    }
  }
</script>

<div class="space-y-4">
  <!-- Channel Filter -->
  <div class="flex items-center gap-2">
    <span class="text-sm text-muted-foreground">Filter by channel:</span>
    <Select.Root type="single" bind:value={selectedChannelId}>
      <Select.Trigger class="w-50">
        {selectedChannelLabel}
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="">All channels</Select.Item>
        {#each channels as channel (channel.id)}
          <Select.Item value={channel.id ?? ''}>{channel.name}</Select.Item>
        {/each}
      </Select.Content>
    </Select.Root>
    {#if selectedChannelId}
      <Button variant="ghost" size="sm" onclick={() => (selectedChannelId = '')}>
        Clear filter
      </Button>
    {/if}
  </div>

  <!-- Orders Table -->
  {#if loading}
    <div class="space-y-3">
      <Skeleton class="h-10 w-full" />
      <Skeleton class="h-16 w-full" />
      <Skeleton class="h-16 w-full" />
      <Skeleton class="h-16 w-full" />
    </div>
  {:else if error}
    <Empty.Root class="min-h-100">
      <Empty.Header>
        <Empty.Title>Errore nel caricamento</Empty.Title>
        <Empty.Description>
          {error}
        </Empty.Description>
      </Empty.Header>
    </Empty.Root>
  {:else if filteredOrders.length === 0}
    <Empty.Root class="min-h-100">
      <Empty.Header>
        <Empty.Title>Nessun ordine trovato</Empty.Title>
        <Empty.Description>
          {#if selectedChannelId}
            Non ci sono ordini per il canale selezionato.
          {:else}
            Non ci sono ordini al momento.
          {/if}
        </Empty.Description>
      </Empty.Header>
    </Empty.Root>
  {:else}
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head>Codice</Table.Head>
          <Table.Head>Cliente</Table.Head>
          <Table.Head class="hidden md:table-cell">Spedizione prevista</Table.Head>
          <Table.Head class="w-35">Priorità</Table.Head>
          <Table.Head>Stato</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each filteredOrders as order (order.id)}
          <Table.Row>
            <Table.Cell class="font-medium">
              {order.internal_id ?? order.external_id ?? '-'}
            </Table.Cell>
            <Table.Cell>
              {order.customer_attr?.name ?? '-'}
            </Table.Cell>
            <Table.Cell class="hidden md:table-cell">
              {formatDate(order.expected_shipping_time)}
            </Table.Cell>
            <Table.Cell>
              {#if order.id}
                {@const priorityOption = getPriorityOption(order.priority)}
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    <Badge
                      variant="secondary"
                      class={cn(
                        'cursor-pointer transition-opacity',
                        priorityOption.class,
                        updatingPriority[order.id] && 'opacity-50'
                      )}
                    >
                      {priorityOption.label}
                    </Badge>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content align="start">
                    {#each PRIORITY_OPTIONS as option (option.value)}
                      <DropdownMenu.Item
                        onclick={() => updatePriority(order.id!, option.value)}
                        class="flex items-center gap-2"
                      >
                        <Badge variant="secondary" class={option.class}>
                          {option.label}
                        </Badge>
                      </DropdownMenu.Item>
                    {/each}
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              {:else}
                <span class="text-muted-foreground">-</span>
              {/if}
            </Table.Cell>
            <Table.Cell>
              <Badge variant="secondary" class={getStatusBadgeClass(order.status)}>
                {getStatusLabel(order.status)}
              </Badge>
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>

    <!-- Infinite scroll sentinel -->
    <div bind:this={sentinelEl} class="h-1" aria-hidden="true"></div>

    <!-- Loading more indicator -->
    {#if loadingMore}
      <div class="flex justify-center py-4">
        <div class="flex items-center gap-2 text-sm text-muted-foreground">
          <div class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
          Caricamento...
        </div>
      </div>
    {/if}

    <!-- End of list indicator -->
    {#if !hasMore && orders.length > 0}
      <div class="py-4 text-center text-sm text-muted-foreground">
        Hai visualizzato tutti gli ordini ({orders.length})
      </div>
    {/if}
  {/if}
</div>
