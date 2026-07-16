<!--
  @component IntentDeclarationSidebar
  @description Sidebar template for the intent declaration (dichiarazione d'intento) pages.
  Shows the protocol, lifecycle status, plafond consumption bar and key dates, plus the
  declaration's subpage menu (overview + movements).
  @keywords sidebar, intent declaration, dichiarazione intento, plafond
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { IntentDeclarationSidebarContract as contract } from './IntentDeclarationSidebar.contract.js'
</script>

<script lang="ts">
  import Skeleton from '$components/ui/skeleton/skeleton.svelte'
  import StatusBadge from '$lib/components/core/ResourceTable/renderers/StatusBadge.svelte'
  import { Badge } from '$lib/components/ui/badge'
  import Progress from '$lib/components/ui/progress/progress.svelte'
  import { useConsumes } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages'
  import type { MenuItem } from '$lib/stores/tenant-config/types'
  import type { Customer } from '$lib/types/api-types'
  import { calendarDayParts } from '$lib/utils/date'
  import {
    getIntentDeclarationAmountTypeLabel,
    getIntentDeclarationStatusLabel,
    getIntentDeclarationStatusVariant,
  } from '$lib/utils/enum-labels'
  import { renderPrice } from '$lib/utils/prices'
  import { api } from '$utils/request.js'
  import { createRoute } from '$utils/route-builder.js'
  import type { SnippetProps } from '$utils/runtime'
  import { IntentDeclarationSidebarContract } from './IntentDeclarationSidebar.contract.js'
  import SubpageMenuGroup from './SubpageMenuGroup.svelte'
  import SubpageSidebarBase from './SubpageSidebarBase.svelte'

  const props: SnippetProps = $props()

  const declarationHandle = useConsumes(IntentDeclarationSidebarContract, 'intentDeclaration')
  const declaration = $derived(declarationHandle.get())

  const customerId = $derived(props.pageDetails?.params?.uuid)

  // The plafond amounts are denominated in the customer's currency — resolve it
  // from the declaration's customer (the sidebar only consumes the declaration).
  let currency = $state<string>('EUR')
  $effect(() => {
    const cid = declaration?.customer_id
    const leId = props.legalEntity?.id
    if (!cid || !leId) return
    api
      .get<Customer>(`/legal-entities/${leId}/customers/${cid}`)
      .then(c => {
        currency = c.default_currency ?? 'EUR'
      })
      .catch(() => {})
  })

  // Plafond consumption (dichiarato / usato / residuo)
  const declared = $derived(Number(declaration?.declared_amount ?? 0))
  const used = $derived(Number(declaration?.used_amount ?? 0))
  const residual = $derived(Number(declaration?.residual_amount ?? declared - used))
  const usedPct = $derived(declared > 0 ? Math.min(100, Math.round((used / declared) * 100)) : 0)
  // Show a thin sliver even at 0% so the bar still reads as a progress bar (the label stays 0).
  const barValue = $derived(usedPct === 0 ? 0.5 : usedPct)

  // Format a date-only value on its literal calendar day (avoids UTC re-projection shift).
  function formatDay(value?: string | null): string | null {
    const parts = calendarDayParts(value ?? undefined)
    if (!parts) return null
    return new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).toLocaleDateString()
  }

  const receiptOn = $derived(formatDay(declaration?.receipt_date))
  const verifiedOn = $derived(formatDay(declaration?.verified_at))

  const pageMenu = $derived.by(() => {
    if (!declaration) return { name: m.intent_declaration(), items: [] }

    const params = { uuid: declaration.customer_id, did: declaration.id }
    const items: MenuItem[] = [
      { type: 'link', label: m.overview(), pageId: 'customer-intent-declaration-details', params },
      { type: 'link', label: m.intent_declaration_usages(), pageId: 'customer-intent-declaration-usages', params },
    ]

    return { name: m.intent_declaration(), items }
  })
</script>

<SubpageSidebarBase
  {...props}
  fallback={createRoute({ $id: 'customer-intent-declarations', params: { uuid: customerId } })}>
  {#if !declaration && !props.pageDetails?.params?.did}
    <div class="px-4">
      <h2 class="line-clamp-2 text-lg font-semibold">
        {m.new_intent_declaration()}
      </h2>
    </div>
  {:else if declaration}
    <div class="px-4 pt-2">
      <h2 class="line-clamp-2 text-lg font-semibold" title={declaration.protocol}>
        {declaration.protocol}
      </h2>

      <div class="mt-2 flex flex-wrap items-center gap-1">
        <StatusBadge
          variant={getIntentDeclarationStatusVariant(declaration.status)}
          label={getIntentDeclarationStatusLabel(declaration.status)} />

        <Badge variant="outline">{getIntentDeclarationAmountTypeLabel(declaration.amount_type)}</Badge>

        {#if declaration.is_customs}
          <Badge variant="secondary">{m.intent_declaration_customs()}</Badge>
        {/if}
      </div>

      <!-- Plafond consumption -->
      <div class="mt-4">
        <div class="flex items-baseline justify-between text-xs text-muted-foreground">
          <span>{m.intent_declaration_plafond()}</span>
          <span>{usedPct}%</span>
        </div>
        <Progress value={barValue} max={100} class="mt-1" />
        <div class="mt-1 flex flex-col gap-0.5 text-xs">
          <div class="flex items-baseline justify-between">
            <span class="text-muted-foreground">{m.intent_declaration_used_amount()}</span>
            <span>{renderPrice(used, currency)} / {renderPrice(declared, currency)}</span>
          </div>
          <div class="flex items-baseline justify-between">
            <span class="text-muted-foreground">{m.intent_declaration_residual_amount()}</span>
            <span class="font-semibold">{renderPrice(residual, currency)}</span>
          </div>
        </div>
      </div>

      {#if receiptOn || verifiedOn}
        <div class="mt-3 flex flex-col gap-0.5 text-xs text-muted-foreground">
          <div>{m.intent_declaration_reference_year()}: {declaration.reference_year}</div>
          {#if receiptOn}
            <div>{m.intent_declaration_receipt_date()}: {receiptOn}</div>
          {/if}
          {#if verifiedOn}
            <div>{m.intent_declaration_verified_on()}: {verifiedOn}</div>
          {/if}
        </div>
      {/if}
    </div>

    <SubpageMenuGroup name={pageMenu.name} items={pageMenu.items} />
  {:else}
    <div class="flex flex-col gap-1 px-4 pt-2">
      <Skeleton class="h-7 w-3/4" />
      <Skeleton class="h-5 w-1/4" />
      <Skeleton class="mt-2 h-2 w-full" />
      <Skeleton class="h-5 w-2/4" />
    </div>
  {/if}
</SubpageSidebarBase>
