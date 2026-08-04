<script lang="ts">
  import SettingsHeader from '$components/features/globals/SettingsHeader.svelte'
  import BanksFilters from '$lib/components/features/common/Filters/BanksFilters.svelte'
  import { BanksTable } from '$lib/components/features/banks/BanksTable'
  import { setSnippetBindings } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages'
  import { SNIPPET_PROPS_CONTEXT_KEY, type SnippetPropsGetter } from '$utils/runtime'
  import { getContext } from 'svelte'
  import type { PageProps } from './$types'

  const { data }: PageProps = $props()
  const getSnippetProps = getContext<SnippetPropsGetter>(SNIPPET_PROPS_CONTEXT_KEY)
  const snippetProps = $derived(getSnippetProps())

  // Default bindings: GenericFilters provides 'filters' and consumes the CSV
  // export handler BanksTable publishes.
  setSnippetBindings({
    provides: { filters: 'filters', exportHandler: 'exportHandler' },
    consumes: { filters: 'filters', exportHandler: 'exportHandler' },
  })
</script>

<SettingsHeader legalEntityName={data.legalEntity?.name} breadcrumbs={[{ label: m.bank() }]} />

<div class="flex flex-1 flex-col gap-4 p-4">
  <BanksFilters {...snippetProps} />
  <BanksTable {...snippetProps} />
</div>
