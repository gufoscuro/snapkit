<!--
  @component UpsertSupplyOrder
  @description Component for viewing and editing supply order details.
  Fetches order details by ID from route parameters and displays them.
  @keywords supply, order, detail, upsert, edit
  @uses apiRequest
  @api GET /order/{orderId} (supply-api) -> orderDetails
-->
<script lang="ts">
  import type { SupplyOrderDetails } from '$lib/types/api-types'
  import { apiRequest } from '$lib/utils/request'
  import type { SnippetProps } from '$utils/runtime'

  const { pageDetails, routeDetails }: SnippetProps = $props()
  const orderId = $derived(pageDetails.params.uuid as string | undefined)

  // State
  let orderDetails = $state<SupplyOrderDetails | null>(null)
  let loading = $state(true)
  let error = $state<string | null>(null)

  // Fetch order details
  async function fetchOrderDetails(id: string) {
    loading = true
    error = null
    try {
      const response = await apiRequest<SupplyOrderDetails>({
        url: `supply/order/${id}`,
      })
      orderDetails = response
    } catch (err) {
      console.error('Failed to load order details:', err)
      error = err instanceof Error ? err.message : 'Failed to load order details'
      orderDetails = null
    } finally {
      loading = false
    }
  }

  // Load order when orderId changes
  $effect(() => {
    if (orderId) {
      fetchOrderDetails(orderId)
    }
  })
</script>

<div class="container mx-auto p-6">
  <h1 class="mb-4 text-2xl font-bold">Supply Order Details</h1>

  {#if loading}
    <div class="py-8 text-center">
      <p class="text-muted-foreground">Loading order details...</p>
    </div>
  {:else if error}
    <div class="rounded-lg border border-destructive bg-destructive/10 p-4">
      <p class="font-semibold text-destructive">Error</p>
      <p class="text-sm text-destructive/90">{error}</p>
    </div>
  {:else if orderDetails}
    <div class="rounded-lg border bg-card p-4">
      <pre class="overflow-auto text-xs">{JSON.stringify(orderDetails, null, 2)}</pre>
    </div>
  {:else}
    <div class="py-8 text-center">
      <p class="text-muted-foreground">No order found</p>
    </div>
  {/if}
</div>
