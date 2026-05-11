<script lang="ts">
  import TextField from '$components/core/form/TextField.svelte'
  import { Button } from '$components/ui/button'
  import { findScaffoldPage } from '$lib/utils/admin-config'
  import type { PageConfig, SnippetDefinition } from '$lib/utils/page-registry'
  import SnippetSelector from '../pickers/SnippetSelector.svelte'

  type Props = {
    page: PageConfig
    onChange: (newValue: PageConfig) => void
  }

  let { page, onChange }: Props = $props()

  let local = $state<PageConfig>($state.snapshot(page) as PageConfig)

  const scaffoldPage = $derived(findScaffoldPage(page.$id))
  const isScaffoldPage = $derived(scaffoldPage !== null)
  const isDirty = $derived(JSON.stringify(local) !== JSON.stringify(page))

  function save() {
    onChange(local)
  }

  function reset() {
    local = $state.snapshot(page) as PageConfig
  }

  function updateLayout(v: SnippetDefinition) {
    local.layout = v
  }

  function updateSnippet(slotKey: string, v: SnippetDefinition) {
    local.snippets = { ...local.snippets, [slotKey]: v }
  }
</script>

<div class="flex h-full flex-col gap-4">
  <div class="shrink-0">
    <div class="text-xs text-muted-foreground uppercase">Page</div>
    <h3 class="text-lg font-semibold">{page.title || page.$id}</h3>
  </div>

  <div class="flex-1 space-y-6 overflow-auto">
    <div class="space-y-3">
      <TextField name="$id" label="ID" bind:value={local.$id} disabled={isScaffoldPage} />
      <TextField name="title" label="Title" bind:value={local.title} />
      <TextField name="route" label="Route" bind:value={local.route} disabled={isScaffoldPage} />
      {#if isScaffoldPage}
        <p class="text-[10px] italic text-muted-foreground">
          Queste pagine fanno parte dei moduli di default del prodotto, pertanto id e route non sono customizzabili.
        </p>
      {/if}
    </div>

    <div class="space-y-2">
      <div class="text-sm font-medium">Layout</div>
      <SnippetSelector
        label="Component"
        value={local.layout}
        scaffoldDefaultKey={scaffoldPage?.layout?.componentKey ?? null}
        onChange={updateLayout} />
      <details class="rounded border">
        <summary class="cursor-pointer px-3 py-1.5 text-xs text-muted-foreground"> Bindings / Props (JSON) </summary>
        <pre class="overflow-auto rounded bg-muted p-2 text-xs">{JSON.stringify(
            { bindings: local.layout.bindings, props: local.layout.props },
            null,
            2,
          )}</pre>
      </details>
    </div>

    <div class="space-y-2">
      <div class="text-sm font-medium">Snippets ({Object.keys(local.snippets ?? {}).length})</div>
      {#if Object.keys(local.snippets ?? {}).length === 0}
        <div class="rounded border p-3 text-xs text-muted-foreground">Nessuno snippet</div>
      {:else}
        {#each Object.entries(local.snippets ?? {}) as [slotKey, snippet] (slotKey)}
          <div class="space-y-1.5">
            <SnippetSelector
              label={slotKey}
              value={snippet}
              scaffoldDefaultKey={scaffoldPage?.snippets?.[slotKey]?.componentKey ?? null}
              onChange={v => updateSnippet(slotKey, v)} />
            <details>
              <summary class="cursor-pointer px-1 py-1 text-xs text-muted-foreground"> Bindings / Props </summary>
              <pre class="overflow-auto rounded bg-muted p-2 text-xs">{JSON.stringify(
                  { bindings: snippet.bindings, props: snippet.props },
                  null,
                  2,
                )}</pre>
            </details>
          </div>
        {/each}
      {/if}
    </div>

    {#if local.subpages && local.subpages.length > 0}
      <div class="rounded border p-3 text-xs text-muted-foreground">
        Questa pagina ha {local.subpages.length} subpages. Gestiscile dal tree.
      </div>
    {/if}
  </div>

  <div class="flex shrink-0 gap-2 border-t pt-4">
    <Button onclick={save} disabled={!isDirty}>Salva</Button>
    <Button variant="outline" onclick={reset} disabled={!isDirty}>Annulla</Button>
  </div>
</div>
