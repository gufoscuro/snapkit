<!--
  @component CustomerIntentDeclarationUsages
  @description Read-only ledger of an intent declaration's plafond movements (append-only usages).
  Shows the consumption bar in the header and each movement (date, reason, amount, source document).
  Provides the declaration to page state so IntentDeclarationSidebar is populated on this subpage.
  @keywords customer, intent declaration, dichiarazione intento, usages, movements, plafond, ledger
  @api GET /api/legal-entities/{legalEntity}/customers/{customer}/intent-declarations/{intentDeclaration} (Moddo API)
  @api GET /api/legal-entities/{legalEntity}/customers/{customer}/intent-declarations/{intentDeclaration}/usages (Moddo API) -> IntentDeclarationUsage[]
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { CustomerIntentDeclarationUsagesContract as contract } from './CustomerIntentDeclarationUsages.contract.js'
</script>

<script lang="ts">
  import RequestPlaceholder from '$components/core/common/RequestPlaceholder.svelte'
  import { Badge } from '$lib/components/ui/badge'
  import * as Table from '$lib/components/ui/table'
  import { useProvides } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages'
  import type { Customer, IntentDeclaration, IntentDeclarationUsage } from '$lib/types/api-types'
  import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
  import { calendarDayParts } from '$lib/utils/date'
  import { getIntentDeclarationUsageReasonLabel, getIntentDeclarationUsageReasonVariant } from '$lib/utils/enum-labels'
  import { renderPrice } from '$lib/utils/prices'
  import { api } from '$utils/request.js'
  import type { SnippetProps } from '$utils/runtime'
  import { onDestroy, onMount } from 'svelte'
  import { CustomerIntentDeclarationUsagesContract } from './CustomerIntentDeclarationUsages.contract.js'

  let { pageDetails, legalEntity }: SnippetProps = $props()

  const did = $derived(pageDetails.params.did)
  const customerId = $derived(pageDetails.params.uuid)
  const legalEntityId = $derived(legalEntity?.id)

  const declarationHandle = useProvides(CustomerIntentDeclarationUsagesContract, 'intentDeclaration')
  const breadcrumbTitle = useBreadcrumbTitle()

  let usages = $state<IntentDeclarationUsage[]>([])
  let currency = $state<string>('EUR')
  let loadPromise = $state<ReturnType<typeof load> | null>(null)

  function formatDay(value?: string | null): string {
    const parts = calendarDayParts(value ?? undefined)
    if (!parts) return '–'
    return new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).toLocaleDateString()
  }

  function usageSource(usage: IntentDeclarationUsage): string {
    return usage.transport_document?.document_number ?? usage.invoice?.document_number ?? '–'
  }

  async function load() {
    const base = `/legal-entities/${legalEntityId}/customers/${customerId}/intent-declarations/${did}`
    const declRes = await api.safe.get<IntentDeclaration>(base)
    if (declRes.error || !declRes.data) return declRes

    const decl = declRes.data
    const [customer, rows] = await Promise.all([
      api.get<Customer>(`/legal-entities/${legalEntityId}/customers/${customerId}`),
      api.get<IntentDeclarationUsage[]>(`${base}/usages`),
    ])
    usages = rows
    currency = customer.default_currency ?? 'EUR'
    declarationHandle.set(decl)
    breadcrumbTitle.setLabel('customer-details', customer.name)
    breadcrumbTitle.setLabel('customer-intent-declaration-details', decl.protocol)
    return declRes
  }

  onMount(() => {
    loadPromise = load()
  })

  onDestroy(() => {
    declarationHandle.unset()
    breadcrumbTitle.clearLabel('customer-details')
    breadcrumbTitle.clearLabel('customer-intent-declaration-details')
  })
</script>

<RequestPlaceholder promise={loadPromise}>
  {#snippet content()}
    <div class="flex flex-col gap-6 p-4">
      <!-- Movements ledger -->
      {#if usages.length === 0}
        <p class="py-8 text-center text-sm text-muted-foreground">{m.intent_declaration_no_usages()}</p>
      {:else}
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head>{m.intent_declaration_usage_date()}</Table.Head>
              <Table.Head>{m.intent_declaration_usage_reason()}</Table.Head>
              <Table.Head class="text-right">{m.intent_declaration_usage_amount()}</Table.Head>
              <Table.Head>{m.intent_declaration_usage_source()}</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {#each usages as usage (usage.id)}
              <Table.Row>
                <Table.Cell>{formatDay(usage.occurred_on)}</Table.Cell>
                <Table.Cell>
                  <Badge variant={getIntentDeclarationUsageReasonVariant(usage.reason)}>
                    {getIntentDeclarationUsageReasonLabel(usage.reason)}
                  </Badge>
                </Table.Cell>
                <Table.Cell class="text-right tabular-nums">{renderPrice(Number(usage.amount), currency)}</Table.Cell>
                <Table.Cell>{usageSource(usage)}</Table.Cell>
              </Table.Row>
            {/each}
          </Table.Body>
        </Table.Root>
      {/if}
    </div>
  {/snippet}
</RequestPlaceholder>
