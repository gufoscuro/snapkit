<script lang="ts">
  import SnippetResolver from '$components/runtime/SnippetResolver.svelte'
  import { Button } from '$components/ui/button'
  import { IconCodeDots } from '@tabler/icons-svelte'
  import { fly } from 'svelte/transition'

  import type { PageProps } from './$types'

  let { data }: PageProps = $props()
  let { pageDetails, tenantInterfaceDetails } = $derived(data)
  let debug: boolean = $state(false)
</script>

{#if pageDetails}
  <SnippetResolver snippet={pageDetails.config.layout} props={{ pageDetails, tenantInterfaceDetails }} />
{/if}

<div class="fixed right-4 bottom-4">
  <Button size="icon" variant={debug ? 'default' : 'secondary'} class="relative z-10" onclick={() => (debug = !debug)}>
    <IconCodeDots />
  </Button>

  {#if debug}
    <div class="absolute right-2 bottom-2 rounded-lg bg-muted/90 p-4" transition:fly={{ y: 10, x: 10, duration: 200 }}>
      <h1>{pageDetails.config.title}</h1>
      <h2>Tenant vanity: {data.tenantVanity}</h2>

      {#if Object.keys(pageDetails.params).length > 0}
        <div>
          <h2>Route Parameters:</h2>
          <pre>{JSON.stringify(pageDetails.params, null, 2)}</pre>
        </div>
      {/if}

      <h2>Page Config:</h2>
      <pre>{JSON.stringify(pageDetails.config, null, 2)}</pre>
    </div>
  {/if}
</div>
