<!--
  @component CustomerIntentDeclarationsTable
  @description Displays a paginated table of a customer's intent declarations (dichiarazioni d'intento).
  Shows protocol, reference year, amount type, declared/residual plafond, customs flag and lifecycle status.
  Provides the parent customer to page state so CustomerSidebar is populated. Consumes filter state.
  @keywords customers, intent declarations, dichiarazione intento, table, list, pagination, plafond
  @uses ResourceTable
  @api GET /api/legal-entities/{legalEntity}/customers/{customer}/intent-declarations (Moddo API) -> IntentDeclaration[]
  @api DELETE /api/legal-entities/{legalEntity}/customers/{customer}/intent-declarations/{intentDeclaration} (Moddo API)
-->
<script lang="ts" module>
  // eslint-disable-next-line no-import-assign
  export { CustomerIntentDeclarationsTableContract as contract } from './CustomerIntentDeclarationsTable.contract.js'
</script>

<script lang="ts">
  import { ResourceTable } from '$lib/components/core/ResourceTable'
  import type { ColumnConfig } from '$lib/components/core/ResourceTable/types'
  import { useConsumes, useProvides } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages.js'
  import type { Customer, IntentDeclaration } from '$lib/types/api-types'
  import {
    getIntentDeclarationAmountTypeLabel,
    getIntentDeclarationAmountTypeVariant,
    getIntentDeclarationStatusLabel,
    getIntentDeclarationStatusVariant,
  } from '$lib/utils/enum-labels'
  import type { FilterQuery } from '$lib/utils/filters'
  import { createArchiveAction } from '$lib/utils/table-actions'
  import { createApiFetcher } from '$lib/utils/table-fetchers'
  import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
  import { apiRequest } from '$utils/request.js'
  import { createRoute } from '$utils/route-builder.js'
  import type { SnippetProps } from '$utils/runtime'
  import { onDestroy, onMount } from 'svelte'
  import { CustomerIntentDeclarationsTableContract } from './CustomerIntentDeclarationsTable.contract.js'

  let { legalEntity, pageDetails }: SnippetProps = $props()

  const legalEntityId = $derived(legalEntity?.id)
  const customerId = $derived(pageDetails.params.uuid)

  const filtersHandle = useConsumes(CustomerIntentDeclarationsTableContract, 'filters')
  const filters = $derived(filtersHandle.get() as FilterQuery | undefined)

  const customerHandle = useProvides(CustomerIntentDeclarationsTableContract, 'customer')
  const breadcrumbTitle = useBreadcrumbTitle()

  // Plafond amounts are shown in the customer's currency.
  let currency = $state<string>('EUR')

  onMount(async () => {
    if (legalEntityId && customerId) {
      const customer = await apiRequest<Customer>({
        url: `/legal-entities/${legalEntityId}/customers/${customerId}`,
      })
      customerHandle.set(customer)
      currency = customer.default_currency ?? 'EUR'
      breadcrumbTitle.setLabel('customer-details', customer.name)
    }
  })

  onDestroy(() => {
    customerHandle.unset()
    breadcrumbTitle.clearLabel('customer-details')
  })

  const columns: ColumnConfig<IntentDeclaration>[] = [
    {
      accessorKey: 'protocol',
      header: m.intent_declaration_protocol(),
      renderer: 'link',
      rendererConfig: {
        urlBuilder: row =>
          createRoute({ $id: 'customer-intent-declaration-details', params: { uuid: customerId, did: row.id } }),
      },
    },
    {
      accessorKey: 'reference_year',
      header: m.intent_declaration_reference_year(),
      renderer: 'text',
    },
    {
      accessorKey: 'amount_type',
      header: m.intent_declaration_amount_type(),
      renderer: 'badge',
      rendererConfig: {
        variantMapper: (type: IntentDeclaration['amount_type']) => getIntentDeclarationAmountTypeVariant(type),
        labelMapper: (type: IntentDeclaration['amount_type']) => getIntentDeclarationAmountTypeLabel(type),
      },
    },
    {
      accessorKey: 'declared_amount',
      header: m.intent_declaration_declared_amount(),
      renderer: 'currency',
      rendererConfig: { currencyAccessor: () => currency },
    },
    {
      accessorKey: 'residual_amount',
      header: m.intent_declaration_residual_amount(),
      renderer: 'currency',
      rendererConfig: { currencyAccessor: () => currency },
    },
    {
      accessorKey: 'status',
      header: m.status(),
      renderer: 'status',
      rendererConfig: {
        variantMapper: (status: IntentDeclaration['status']) => getIntentDeclarationStatusVariant(status),
        labelMapper: (status: IntentDeclaration['status']) => getIntentDeclarationStatusLabel(status),
      },
    },
    {
      accessorKey: 'is_customs',
      header: m.intent_declaration_customs(),
      renderer: 'status',
      rendererConfig: {
        variantMapper: (isCustoms: IntentDeclaration['is_customs']) => (isCustoms ? 'active' : 'neutral'),
        labelMapper: (isCustoms: IntentDeclaration['is_customs']) => (isCustoms ? m.intent_declaration_customs_yes() : '–'),
      },
    },
    {
      header: '',
      renderer: 'actions',
      rendererConfig: {
        actions: [
          createArchiveAction({
            apiUrl: declaration =>
              `/legal-entities/${legalEntity?.id}/customers/${customerId}/intent-declarations/${declaration.id}`,
            confirmMessage: () => m.archive_intent_declaration_confirmation(),
            successMessage: () => m.intent_declaration_archived_success(),
            errorMessage: m.intent_declaration_archive_error(),
          }),
        ],
      },
      meta: { cellClassName: 'p-0 h-10 w-12' },
    },
  ]

  const declarationsApiUrl = $derived(
    legalEntity?.id && customerId
      ? `/legal-entities/${legalEntity.id}/customers/${customerId}/intent-declarations`
      : null,
  )
  const fetchDeclarations = $derived(
    declarationsApiUrl ? createApiFetcher<IntentDeclaration>(declarationsApiUrl) : null,
  )
</script>

{#if legalEntity && customerId && fetchDeclarations}
  <ResourceTable
    {columns}
    fetchFunction={fetchDeclarations}
    {filters}
    columnsStorageId="customer-intent-declarations-table" />
{/if}
