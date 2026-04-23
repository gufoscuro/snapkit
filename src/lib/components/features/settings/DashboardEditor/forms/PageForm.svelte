<script lang="ts">
  import TextField from '$components/core/form/TextField.svelte'
  import { Button } from '$components/ui/button'
  import type { PageConfig } from '$lib/utils/page-registry'

  type Props = {
    page: PageConfig
    onChange: (newValue: PageConfig) => void
  }

  let { page, onChange }: Props = $props()

  let local = $state<PageConfig>($state.snapshot(page) as PageConfig)

  const isDirty = $derived(JSON.stringify(local) !== JSON.stringify(page))

  function save() {
    onChange(local)
  }

  function reset() {
    local = $state.snapshot(page) as PageConfig
  }
</script>

<div class="flex h-full flex-col gap-4">
  <div class="shrink-0">
    <div class="text-xs uppercase text-muted-foreground">Page</div>
    <h3 class="text-lg font-semibold">{page.title || page.$id}</h3>
  </div>

  <div class="flex-1 space-y-4 overflow-auto">
    <div class="space-y-3">
      <TextField name="$id" label="ID" bind:value={local.$id} />
      <TextField name="title" label="Title" bind:value={local.title} />
      <TextField name="route" label="Route" bind:value={local.route} />
    </div>

    <details class="rounded border">
      <summary class="cursor-pointer px-3 py-2 text-sm font-medium">Layout</summary>
      <pre class="overflow-auto rounded bg-muted p-2 text-xs">{JSON.stringify(local.layout, null, 2)}</pre>
    </details>

    <details class="rounded border">
      <summary class="cursor-pointer px-3 py-2 text-sm font-medium">
        Snippets ({Object.keys(local.snippets ?? {}).length})
      </summary>
      <pre class="overflow-auto rounded bg-muted p-2 text-xs">{JSON.stringify(local.snippets, null, 2)}</pre>
    </details>

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
