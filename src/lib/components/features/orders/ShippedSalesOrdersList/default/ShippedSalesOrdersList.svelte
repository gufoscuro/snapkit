<!--
  @component ShippedSalesOrdersList
  @description Displays a list of sales orders that have been fully shipped (shipped status = "completed").
  Fetches data from GET /order endpoint and filters for shipped orders.
  Shows order details including order code, customer, dates, total amount, and shipping status.
  @keywords orders, shipped, sales, list, table, completed, delivery
  @uses Table, Badge, Empty, Skeleton
  @api GET /order (sales-api) -> orderSummary[]
-->

<script lang="ts">
  import { onMount } from 'svelte'
  import * as Table from '$lib/components/ui/table'
  import * as Empty from '$lib/components/ui/empty'
  import { Badge } from '$lib/components/ui/badge'
  import { Skeleton } from '$lib/components/ui/skeleton'
  import { apiRequest } from '$lib/utils/request'

  /**
   * Order summary type from sales-api GET /order endpoint
   */
  type OrderSummary = {
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

  let orders = $state<OrderSummary[]>([])
  let loading = $state(true)
  let error = $state<string | null>(null)

  const shippedOrders = $derived(
    orders.filter((order) => order.shipped === 'completed')
  )

  onMount(async () => {
    try {
      orders = await apiRequest<OrderSummary[]>({ url: 'sales/order' })
    } catch (e) {
      error = e instanceof Error ? e.message : 'An error occurred while fetching orders'
    } finally {
      loading = false
    }
  })

  function formatDate(dateString?: string): string {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  function formatCurrency(amount: number, currency = 'EUR'): string {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency
    }).format(amount)
  }
</script>

{#if loading}
  <div class="space-y-3">
    <Skeleton class="h-10 w-full" />
    <Skeleton class="h-16 w-full" />
    <Skeleton class="h-16 w-full" />
    <Skeleton class="h-16 w-full" />
  </div>
{:else if error}
  <Empty.Root class="min-h-[400px]">
    <Empty.Header>
      <Empty.Title>Errore nel caricamento</Empty.Title>
      <Empty.Description>
        {error}
      </Empty.Description>
    </Empty.Header>
  </Empty.Root>
{:else if shippedOrders.length === 0}
  <Empty.Root class="min-h-[400px]">
    <Empty.Header>
      <Empty.Title>Nessun ordine spedito</Empty.Title>
      <Empty.Description>
        Non ci sono ordini con spedizione completata al momento.
      </Empty.Description>
    </Empty.Header>
  </Empty.Root>
{:else}
  <Table.Root>
    <Table.Header>
      <Table.Row>
        <Table.Head>Codice ordine</Table.Head>
        <Table.Head>Cliente</Table.Head>
        <Table.Head class="hidden md:table-cell">Data ordine</Table.Head>
        <Table.Head class="hidden md:table-cell">Data spedizione prevista</Table.Head>
        <Table.Head class="hidden md:table-cell text-right">Totale</Table.Head>
        <Table.Head>Stato</Table.Head>
        <Table.Head>Spedizione</Table.Head>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {#each shippedOrders as order (order.id)}
        <Table.Row>
          <Table.Cell class="font-medium">
            {order.internal_id ?? order.external_id ?? '-'}
          </Table.Cell>
          <Table.Cell>
            {order.customer_attr?.name ?? '-'}
          </Table.Cell>
          <Table.Cell class="hidden md:table-cell">
            {formatDate(order.time)}
          </Table.Cell>
          <Table.Cell class="hidden md:table-cell">
            {formatDate(order.expected_shipping_time)}
          </Table.Cell>
          <Table.Cell class="hidden md:table-cell text-right">
            {formatCurrency(order.total_vat_incl, order.default_currency)}
          </Table.Cell>
          <Table.Cell>
            <Badge
              variant="secondary"
              class={order.status === 'sent'
                ? 'bg-success/20 text-success border-success/30'
                : order.status === 'accepted'
                  ? 'bg-blue-500/20 text-blue-700 border-blue-700/20'
                  : 'bg-stone-200/50 text-stone-700 border-stone-700/20'}
            >
              {#if order.status === 'draft'}
                Bozza
              {:else if order.status === 'accepted'}
                Accettato
              {:else if order.status === 'sent'}
                Inviato
              {/if}
            </Badge>
          </Table.Cell>
          <Table.Cell>
            <Badge class="bg-success/20 text-success border-success/30">
              Completata
            </Badge>
          </Table.Cell>
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
{/if}
