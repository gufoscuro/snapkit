<script lang="ts">
  import { dev } from '$app/environment'
  import SnippetResolver from '$components/runtime/SnippetResolver.svelte'
  import { registerPageDetails, registerPageState } from '$components/runtime/devtools'
  import { initPageState } from '$lib/contexts/page-state'
  import { getI18nLabel } from '$utils/i18n'
  import { SNIPPET_PROPS_CONTEXT_KEY, type SnippetPropsGetter } from '$utils/runtime'
  import { setContext } from 'svelte'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()
  let { pageDetails, routeDetails, tenantInterfaceDetails } = $derived(data)

  const pageState = initPageState()

  setContext<SnippetPropsGetter>(SNIPPET_PROPS_CONTEXT_KEY, () => ({
    pageDetails,
    routeDetails,
    tenantInterfaceDetails,
  }))

  // Register with devtools in development
  if (dev) {
    // Register page details
    const cleanupDetails = registerPageDetails({
      getData: () => ({
        title: getI18nLabel(pageDetails?.config.title ?? ''),
        route: pageDetails?.config.route ?? '',
        params: pageDetails?.params ?? {},
        config: pageDetails?.config ?? {},
        tenantInterfaceDetails: tenantInterfaceDetails ?? {}
      })
    })

    // Register page state
    const cleanupState = registerPageState(pageState)

    // Cleanup on unmount
    $effect(() => {
      return () => {
        cleanupDetails()
        cleanupState()
      }
    })
  }
</script>

{#if pageDetails}
  <SnippetResolver snippet={pageDetails.config.layout} />
{/if}
