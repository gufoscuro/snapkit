<!--
  @component ItemPriceHistory
  @description Price history for a single item: at what price it was actually
  sold, to whom, and when. Summary tiles over the whole filtered set, plus the
  underlying document lines. (A price-over-time scatter exists in
  PriceHistoryChart but is currently not mounted — see that component's header.)

  Sales orders and invoices stay separate datasets behind a source switch rather
  than merging into one list: an order line and the invoice line billing it are
  the same commercial decision, so a merged set double-counts it — and a user
  holding only one of the two permissions would see a partial history that looks
  complete. The switch also makes the missing half visible instead of silent.

  Also provides item data to page state so ItemSidebar is populated.
  @keywords item, price, history, listino, sales, invoices, table, chart
  @uses ResourceTable, PriceHistorySummary, PriceCell
  @api GET /api/legal-entities/{legalEntity}/items/{item} (Moddo API) -> Item
  @api GET /api/legal-entities/{legalEntity}/items/{item}/sales-order-lines (Moddo API) -> ItemSalesOrderLine[]
  @api GET /api/legal-entities/{legalEntity}/items/{item}/invoice-lines (Moddo API) -> ItemInvoiceLine[]
  @route sales-order-details, invoice-details
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { ItemPriceHistoryContract as contract } from './ItemPriceHistory.contract.js'
</script>

<script lang="ts">
  import { ResourceTable } from '$lib/components/core/ResourceTable'
  import type { ColumnConfig } from '$lib/components/core/ResourceTable/types'
  import * as Alert from '$lib/components/ui/alert'
  import { Badge } from '$lib/components/ui/badge'
  import { useProvides } from '$lib/contexts/page-state'
  import { useConsumes } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages'
  import type {
    Item,
    ItemDocumentLine,
    ItemInvoiceLine,
    ItemPriceHistoryAggregates,
    ItemSalesOrderLine,
  } from '$lib/types/api-types'
  import {
    getInvoiceDocumentTypeLabel,
    getInvoicePaymentStatusLabel,
    getInvoicePaymentStatusVariant,
    getInvoiceStateLabel,
    getInvoiceStateVariant,
    getSalesOrderStatusLabel,
  } from '$lib/utils/enum-labels'
  import type { FilterQuery, PaginatedResponse } from '$lib/utils/filters'
  import { apiRequest } from '$lib/utils/request'
  import { useBreadcrumbTitle } from '$utils/breadcrumb-title.js'
  import { createRoute } from '$utils/route-builder.js'
  import type { SnippetProps } from '$utils/runtime'
  import LockIcon from '@lucide/svelte/icons/lock'
  import XIcon from '@lucide/svelte/icons/x'
  import { onDestroy, onMount } from 'svelte'
  import { formatCalendarDay } from './format.js'
  import { ItemPriceHistoryContract } from './ItemPriceHistory.contract.js'
  import PriceCell from './PriceCell.svelte'
  import PriceHistorySummary from './PriceHistorySummary.svelte'
  import type { PriceHistorySource } from './source.js'

  let { pageDetails, legalEntity, user }: SnippetProps = $props()

  const itemId = $derived(pageDetails.params.uuid)
  const legalEntityId = $derived(legalEntity?.id)

  const itemHandle = useProvides(ItemPriceHistoryContract, 'item')
  const filtersHandle = useConsumes(ItemPriceHistoryContract, 'filters')
  const breadcrumbTitle = useBreadcrumbTitle()

  onMount(async () => {
    if (legalEntityId && itemId) {
      const item = await apiRequest<Item>({ url: `/legal-entities/${legalEntityId}/items/${itemId}` })
      itemHandle.set(item)
      breadcrumbTitle.setLabel('item-details', item.name || item.code)
    }
  })

  onDestroy(() => {
    itemHandle.unset()
  })

  // ── Local scoping ────────────────────────────────────────────────────────
  // Set only from the mixed-UoM banner, to make the suppressed summary
  // computable again. Every other filter — customer included — lives in the
  // filter bar.
  let uomFilter = $state<string | null>(null)

  // ── Source ───────────────────────────────────────────────────────────────
  // The source arrives through the filter bar like any other filter — it *is*
  // one: it re-scopes the summary exactly as customer or date range do. It just
  // happens to pick the endpoint rather than a query param, so it's stripped
  // before the request goes out.
  const consumedFilters = $derived(filtersHandle.get() as FilterQuery | undefined)

  const canViewSalesOrders = $derived(
    (user?.is_superadmin ?? false) || (user?.all_permissions?.includes('view-sales-orders') ?? false),
  )
  const canViewInvoices = $derived(
    (user?.is_superadmin ?? false) || (user?.all_permissions?.includes('view-invoices') ?? false),
  )

  // Sales orders first: it matches "Venduto" on the dashboard and it's the most
  // recent commercial agreement, which is what you want when re-quoting. A user
  // holding only one of the two permissions gets that one, with no switch shown.
  const defaultSource = $derived<PriceHistorySource | undefined>(
    canViewSalesOrders ? 'sales-order-lines' : canViewInvoices ? 'invoice-lines' : undefined,
  )

  const source = $derived.by<PriceHistorySource | undefined>(() => {
    const requested = consumedFilters?.query?.source
    if (requested === 'sales-order-lines' && canViewSalesOrders) return requested
    if (requested === 'invoice-lines' && canViewInvoices) return requested
    return defaultSource
  })

  // ── Fetching ─────────────────────────────────────────────────────────────
  const filters = $derived.by<FilterQuery>(() => {
    // `source` selects the endpoint; forwarding it would send the backend a
    // param it never declared.
    const query = { ...(consumedFilters?.query ?? {}) }
    delete query.source

    return {
      search: consumedFilters?.search,
      query: {
        ...query,
        ...(uomFilter ? { uom: uomFilter } : {}),
      },
    }
  })

  let aggregates = $state<ItemPriceHistoryAggregates | null>(null)
  // Only the first row is read (for currency/UoM), but the accumulation is what
  // PriceHistoryChart consumes when it's re-enabled — cheap to keep, annoying
  // to reconstruct.
  let rows = $state<ItemDocumentLine[]>([])
  let loadingSummary = $state(true)

  const endpoint = $derived(
    legalEntityId && itemId && source ? `/legal-entities/${legalEntityId}/items/${itemId}/${source}` : null,
  )

  // ResourceTable owns the request but discards everything outside `data` —
  // and `summary` / `mixed_*` ride along in the same payload. Wrapping the
  // fetcher captures them (and accumulates the rows the chart draws) without
  // a second round-trip or a change to ResourceTable.
  const fetchLines = $derived.by(() => {
    const url = endpoint
    if (!url) return null

    return async (page: number, query?: FilterQuery): Promise<PaginatedResponse<ItemDocumentLine>> => {
      if (page === 1) loadingSummary = true

      const response = await apiRequest<PaginatedResponse<ItemDocumentLine> & ItemPriceHistoryAggregates>({
        url,
        queryParams: {
          page,
          ...(query?.search ? { search: query.search } : {}),
          ...(query?.query ?? {}),
        },
      })

      aggregates = {
        summary: response.summary ?? null,
        mixed_uom: response.mixed_uom ?? false,
        mixed_currency: response.mixed_currency ?? false,
      }
      rows = page === 1 ? response.data : [...rows, ...response.data]
      loadingSummary = false

      return response
    }
  })

  // The set is single-currency and single-UoM unless the BE says otherwise, so
  // the first row is representative in every case where these are used.
  const currency = $derived(rows[0]?.currency)
  const uom = $derived(rows[0]?.uom)

  // ── Columns ──────────────────────────────────────────────────────────────
  const isInvoices = $derived(source === 'invoice-lines')

  const columns = $derived.by<ColumnConfig<ItemDocumentLine>[]>(() => [
    {
      accessorKey: 'document_date',
      header: m.document_date(),
      renderer: 'custom',
      rendererConfig: {
        // The built-in `date` renderer parses with `new Date()`, which shifts a
        // plain YYYY-MM-DD across the day boundary. See format.ts.
        cellRenderer: (row: ItemDocumentLine) => formatCalendarDay(row.document_date) ?? '-',
      },
    },
    {
      accessorKey: 'document_number',
      header: m.document_number(),
      renderer: 'link',
      rendererConfig: {
        urlBuilder: (row: ItemDocumentLine) =>
          createRoute({
            $id: isInvoices ? 'invoice-details' : 'sales-order-details',
            params: { uuid: row.document_id },
          }),
      },
    },
    {
      accessorKey: 'customer_name',
      header: m.customer(),
      renderer: 'text',
    },
    {
      accessorKey: 'description',
      header: m.description(),
      renderer: 'long-text',
      rendererConfig: { lines: 2 },
      // The line description can be edited away from the article name, so it's
      // worth having — but it's the same text on most rows, hence opt-in.
      defaultVisible: false,
    },
    {
      accessorKey: 'quantity',
      header: m.quantity(),
      renderer: 'custom',
      rendererConfig: {
        cellRenderer: (row: ItemDocumentLine) => `${row.quantity.toLocaleString()} ${row.uom}`,
      },
    },
    {
      accessorKey: 'effective_unit_price',
      header: m.price(),
      renderer: 'component',
      rendererConfig: {
        component: PriceCell,
        propsMapper: (row: ItemDocumentLine) => ({ row }),
      },
    },
    {
      accessorKey: 'net_value',
      header: m.net_value(),
      renderer: 'currency',
      rendererConfig: { currencyAccessor: (row: ItemDocumentLine) => row.currency },
    },
    ...(isInvoices
      ? ([
          {
            // TD04/TD05 are stored with positive amounts, so an unbadged credit
            // note reads as a sale. Badging is what keeps the list honest.
            accessorKey: 'document_type',
            header: m.document_type(),
            renderer: 'badge',
            rendererConfig: {
              variantMapper: () => 'outline',
              labelMapper: (type: ItemInvoiceLine['document_type']) => getInvoiceDocumentTypeLabel(type),
            },
          },
          {
            accessorKey: 'state',
            header: m.status(),
            renderer: 'status',
            rendererConfig: {
              variantMapper: (state: ItemInvoiceLine['state']) => getInvoiceStateVariant(state),
              labelMapper: (state: ItemInvoiceLine['state']) => getInvoiceStateLabel(state),
            },
          },
          {
            accessorKey: 'payment_status',
            header: m.payment_status(),
            renderer: 'status',
            rendererConfig: {
              variantMapper: (status: ItemInvoiceLine['payment_status']) =>
                status ? getInvoicePaymentStatusVariant(status) : 'neutral',
              labelMapper: (status: ItemInvoiceLine['payment_status']) =>
                status ? getInvoicePaymentStatusLabel(status) : '-',
            },
            defaultVisible: false,
          },
        ] satisfies ColumnConfig<ItemDocumentLine>[])
      : ([
          {
            accessorKey: 'sales_transaction_type',
            header: m.sales_transaction_type(),
            renderer: 'badge',
            rendererConfig: {
              variantMapper: () => 'outline',
              labelMapper: (type: ItemSalesOrderLine['sales_transaction_type']) => type,
            },
            defaultVisible: false,
          },
          {
            // Sales-order lines default to approved only, but the filter can
            // widen that — and "at what price did we sell this" reads very
            // differently on an open order than on an approved one. Same
            // renderer as the invoice state column, so switching source doesn't
            // change how the status reads.
            accessorKey: 'state',
            header: m.status(),
            renderer: 'status',
            rendererConfig: {
              variantMapper: (state: ItemSalesOrderLine['state']) =>
                state === 'approved' ? 'active' : state === 'rejected' ? 'blocked' : 'in-progress',
              labelMapper: (state: ItemSalesOrderLine['state']) => getSalesOrderStatusLabel(state),
            },
          },
        ] satisfies ColumnConfig<ItemDocumentLine>[])),
  ])
</script>

<div class="flex flex-col gap-6 pb-breadcrumbs">
  {#if !source}
    <!--
      Reachable only if the page is left in the menu for a role holding neither
      document permission. Say so, rather than spin on a summary that will never
      arrive.
    -->
    <Alert.Root>
      <LockIcon class="size-4" />
      <Alert.Title>{m.price_history_no_permission()}</Alert.Title>
      <Alert.Description>{m.price_history_no_permission_description()}</Alert.Description>
    </Alert.Root>
  {:else}
    {#if uomFilter}
      <!--
        The UoM narrowing has no widget in the filter bar — it only ever comes
        from the mixed-UoM banner — so it needs its own way out.
      -->
      <div class="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" class="gap-1 py-1 pr-1 pl-2">
          {m.uom()}: {uomFilter}
          <button
            type="button"
            class="rounded-full p-0.5 hover:bg-background/60"
            aria-label={m.filters_remove()}
            onclick={() => (uomFilter = null)}>
            <XIcon class="size-3" />
          </button>
        </Badge>
      </div>
    {/if}

    <PriceHistorySummary
      {aggregates}
      {currency}
      {uom}
      loading={loadingSummary}
      onFilterByUom={value => (uomFilter = value)} />

    <!--
      The price-over-time scatter (PriceHistoryChart) is parked, not deleted —
      see its own header comment. Re-enable by importing it and rendering it
      here with `rows`, `currency` and a `total` taken from `response.meta.total`
      in the fetcher above.
    -->

    {#if fetchLines}
      <!--
        Remount on source change: ResourceTable only reloads when `filters`
        changes identity, so swapping the fetch function alone would leave the
        previous dataset (and its columns) on screen.
      -->
      {#key source}
        <ResourceTable
          {columns}
          fetchFunction={fetchLines}
          {filters}
          columnsStorageId={`item-price-history-${source}`} />
      {/key}
    {/if}
  {/if}
</div>
