<script lang="ts">
  import SnippetResolver from '$components/runtime/SnippetResolver.svelte'
  import { Button } from '$components/ui/button'
  import { initPageState } from '$lib/contexts/page-state'
  import { getI18nLabel } from '$utils/i18n'
  import { SNIPPET_PROPS_CONTEXT_KEY, type SnippetPropsGetter } from '$utils/runtime'
  import { IconCodeDots } from '@tabler/icons-svelte'
  import { setContext } from 'svelte'
  import { fly } from 'svelte/transition'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()
  let { pageDetails, routeDetails, tenantInterfaceDetails } = $derived(data)
  let debug: boolean = $state(false)

  initPageState()

  setContext<SnippetPropsGetter>(SNIPPET_PROPS_CONTEXT_KEY, () => ({
    pageDetails,
    routeDetails,
    tenantInterfaceDetails,
  }))
</script>

{#if pageDetails}
  <SnippetResolver snippet={pageDetails.config.layout} />
{/if}

<div class="fixed right-4 bottom-4">
  <Button size="icon" variant={debug ? 'default' : 'secondary'} class="relative z-10" onclick={() => (debug = !debug)}>
    <IconCodeDots />
  </Button>

  {#if debug}
    <div
      class="absolute right-2 bottom-2 flex max-h-[60vh] flex-col gap-2 overflow-y-auto rounded-lg bg-muted p-4"
      transition:fly={{ y: 10, x: 10, duration: 200 }}>
      <h1>{getI18nLabel(pageDetails.config.title)}</h1>
      <h2>Tenant:</h2>

      {#if tenantInterfaceDetails}
        <pre class="text-sm">{JSON.stringify(tenantInterfaceDetails, null, 2)}</pre>
      {:else}
        <div>No tenant interface details available.</div>
      {/if}

      {#if Object.keys(pageDetails.params).length > 0}
        <div>
          <h2>Route Parameters:</h2>
          <pre class="text-sm">{JSON.stringify(pageDetails.params, null, 2)}</pre>
        </div>
      {/if}

      <h2>Page Config:</h2>
      <pre class="text-sm">{JSON.stringify(pageDetails.config, null, 2)}</pre>
    </div>
  {/if}
</div>
