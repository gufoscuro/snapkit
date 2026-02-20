<script lang="ts">
  import SnippetResolver from '$components/runtime/SnippetResolver.svelte'
  import { initPageState } from '$lib/contexts/page-state'
  import { SNIPPET_PROPS_CONTEXT_KEY, type SnippetPropsGetter } from '$utils/runtime'
  import { setContext } from 'svelte'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()
  let { pageDetails, routeDetails, entityConfig, legalEntity, user } = $derived(data)

  initPageState()

  // Set context - the getter uses non-null assertion since it's only called when rendering SnippetResolver
  // which is guarded by the {#if pageDetails} check
  setContext<SnippetPropsGetter>(SNIPPET_PROPS_CONTEXT_KEY, () => ({
    pageDetails: pageDetails!,
    routeDetails,
    entityConfig,
    legalEntity,
    user,
  }))
</script>

{#if pageDetails}
  <SnippetResolver snippet={pageDetails.config.layout} />
{:else}
  <div class="flex h-full items-center justify-center">
    <div class="text-center">
      <h1 class="text-2xl font-bold">Welcome</h1>
      <p class="text-muted-foreground">No home page configured for this tenant.</p>
    </div>
  </div>
{/if}
