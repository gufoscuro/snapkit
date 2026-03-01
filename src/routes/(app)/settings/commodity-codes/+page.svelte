<script lang="ts">
  import SettingsHeader from '$components/features/globals/SettingsHeader.svelte'
  import CommodityCodesFilters from '$lib/components/features/common/Filters/CommodityCodesFilters.svelte'
  import { CommodityCodesTable } from '$lib/components/features/commodity-codes/CommodityCodesTable'
  import { setSnippetBindings } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages'
  import { SNIPPET_PROPS_CONTEXT_KEY, type SnippetPropsGetter } from '$utils/runtime'
  import { getContext } from 'svelte'
  import type { PageProps } from './$types'

  const { data }: PageProps = $props()
  const getSnippetProps = getContext<SnippetPropsGetter>(SNIPPET_PROPS_CONTEXT_KEY)
  const snippetProps = $derived(getSnippetProps())

  // Set up default bindings: GenericFilters provides 'filters', CommodityCodesTable consumes 'filters'
  setSnippetBindings({
    provides: { filters: 'filters' },
    consumes: { filters: 'filters' },
  })
</script>

<SettingsHeader legalEntityName={data.legalEntity?.name} breadcrumbs={[{ label: m.commodity_code() }]} />

<div class="flex flex-1 flex-col gap-4 p-4">
  <CommodityCodesFilters {...snippetProps} />
  <CommodityCodesTable {...snippetProps} />
</div>
