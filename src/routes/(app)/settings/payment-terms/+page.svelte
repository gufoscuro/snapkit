<script lang="ts">
  import SettingsHeader from '$components/features/globals/SettingsHeader.svelte'
  import PaymentTermsFilters from '$lib/components/features/common/Filters/PaymentTermsFilters.svelte'
  import { PaymentTermsTable } from '$lib/components/features/payment-terms/PaymentTermsTable'
  import { setSnippetBindings } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages'
  import { SNIPPET_PROPS_CONTEXT_KEY, type SnippetPropsGetter } from '$utils/runtime'
  import { getContext } from 'svelte'
  import type { PageProps } from './$types'

  const { data }: PageProps = $props()
  const getSnippetProps = getContext<SnippetPropsGetter>(SNIPPET_PROPS_CONTEXT_KEY)
  const snippetProps = $derived(getSnippetProps())

  // Set up default bindings: GenericFilters provides 'filters', PaymentTermsTable consumes 'filters'
  setSnippetBindings({
    provides: { filters: 'filters' },
    consumes: { filters: 'filters' },
  })
</script>

<SettingsHeader legalEntityName={data.legalEntity?.name} breadcrumbs={[{ label: m.payment_terms() }]} />

<div class="flex flex-1 flex-col gap-4 p-4">
  <PaymentTermsFilters {...snippetProps} />
  <PaymentTermsTable {...snippetProps} />
</div>
