<script lang="ts">
  import { Button } from '$components/ui/button'
  import * as Command from '$components/ui/command'
  import * as DropdownMenu from '$components/ui/dropdown-menu'
  import * as HoverCard from '$components/ui/hover-card'
  import { Switch } from '$components/ui/switch'
  import { COMPONENT_REGISTRY, type ComponentKey } from '$generated/components-registry'
  import { COMPONENT_METADATA } from '$generated/components-metadata'
  import type { SnippetDefinition } from '$lib/utils/page-registry'
  import { cn } from '$lib/utils'
  import Check from '@lucide/svelte/icons/check'
  import ChevronDown from '@lucide/svelte/icons/chevron-down'
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw'

  type Props = {
    label: string
    value: SnippetDefinition
    scaffoldDefaultKey?: ComponentKey | null
    onChange: (newValue: SnippetDefinition) => void
  }

  let { label, value, scaffoldDefaultKey = null, onChange }: Props = $props()

  const allKeys = Object.keys(COMPONENT_REGISTRY) as ComponentKey[]

  const alternatives = $derived.by(() => {
    const current = value.componentKey
    if (current.startsWith('layouts.')) {
      return allKeys.filter(k => k.startsWith('layouts.') && k !== current)
    }
    const parts = current.split('.')
    if (parts.length < 3) return []
    const baseNamespace = `${parts[0]}.${parts[1]}.`
    return allKeys.filter(k => {
      if (!k.startsWith(baseNamespace)) return false
      if (k === current) return false
      const altParts = k.split('.')
      return altParts[2] !== 'default'
    })
  })

  let search = $state('')
  let open = $state(false)
  // Mutex for hover preview: only one card can be open at a time.
  // Without this, bits-ui opens the next preview before the previous one finishes
  // its exit animation, causing them to overlap in the portal with unpredictable
  // z-index ordering (the older card can stay on top and block the new one).
  let hoverOpenValue = $state<string | null>(null)

  const filteredAlternatives = $derived.by(() => {
    if (!search) return alternatives
    const q = search.toLowerCase()
    return alternatives.filter(k => k.toLowerCase().includes(q))
  })

  const isDefault = $derived(scaffoldDefaultKey !== null && scaffoldDefaultKey === value.componentKey)
  const canReset = $derived(scaffoldDefaultKey !== null && !isDefault)

  function selectKey(key: ComponentKey) {
    onChange({ ...value, componentKey: key })
    open = false
  }

  function selectDefault() {
    if (scaffoldDefaultKey) selectKey(scaffoldDefaultKey)
  }

  function toggleEnabled(checked: boolean) {
    onChange({ ...value, enabled: checked })
  }

  function variantLabel(key: string): string {
    const parts = key.split('.')
    if (parts[0] === 'layouts') return parts[parts.length - 1]
    if (parts.length >= 4) return `${parts[2]} — ${parts[parts.length - 1]}`
    return key
  }
</script>

<div class="flex items-center gap-2">
  <DropdownMenu.Root
    bind:open
    onOpenChange={isOpen => {
      open = isOpen
      if (!isOpen) {
        search = ''
        hoverOpenValue = null
      }
    }}>
    <DropdownMenu.Trigger>
      {#snippet child({ props })}
        <Button {...props} variant="outline" size="sm" class="h-8 min-w-0 flex-1 justify-between gap-2 pr-2">
          <span class="flex min-w-0 items-baseline gap-2">
            <span class="shrink-0 text-xs font-medium text-muted-foreground">{label}</span>
            <span class="truncate font-mono text-xs" title={value.componentKey}>{value.componentKey}</span>
          </span>
          <ChevronDown class="size-3 shrink-0 opacity-50" />
        </Button>
      {/snippet}
    </DropdownMenu.Trigger>

    <DropdownMenu.Content align="start" class="w-80">
      <DropdownMenu.Label class="text-xs">Seleziona componente</DropdownMenu.Label>
      <DropdownMenu.Separator />

      <DropdownMenu.Item
        disabled={!canReset}
        onSelect={selectDefault}
        class="flex items-start gap-2 text-xs">
        <RotateCcw class="mt-0.5 size-3.5 shrink-0" />
        <div class="flex min-w-0 flex-1 flex-col">
          <span>Default {isDefault ? '(corrente)' : ''}</span>
          {#if scaffoldDefaultKey}
            <span class="truncate font-mono text-[10px] text-muted-foreground" title={scaffoldDefaultKey}>
              {scaffoldDefaultKey}
            </span>
          {:else}
            <span class="text-[10px] italic text-muted-foreground">nessun default nello scaffold</span>
          {/if}
        </div>
      </DropdownMenu.Item>

      <DropdownMenu.Sub>
        <DropdownMenu.SubTrigger class="text-xs">Alternative</DropdownMenu.SubTrigger>
        <DropdownMenu.SubContent class="p-0">
          <Command.Root shouldFilter={false} class="border-none">
            <Command.Input
              autofocus
              placeholder="Cerca…"
              value={search}
              oninput={e => (search = e.currentTarget.value)}
              class="h-8 text-xs" />
            <Command.List>
              {#if filteredAlternatives.length === 0}
                <Command.Empty class="py-2 text-center text-xs">Nessuna alternativa</Command.Empty>
              {:else}
                <Command.Group class="max-h-72 overflow-y-auto">
                  {#each filteredAlternatives as altKey (altKey)}
                    {@const isCurrent = altKey === value.componentKey}
                    {@const metadata = COMPONENT_METADATA[altKey]}
                    <HoverCard.Root
                      openDelay={400}
                      closeDelay={0}
                      open={hoverOpenValue === altKey}
                      onOpenChange={isOpen => {
                        if (isOpen) hoverOpenValue = altKey
                        else if (hoverOpenValue === altKey) hoverOpenValue = null
                      }}>
                      <HoverCard.Trigger class="block w-full">
                        <Command.Item
                          class="flex items-start gap-2 text-xs"
                          onSelect={() => selectKey(altKey)}>
                          <Check class={cn('mt-0.5 size-3.5 shrink-0', !isCurrent && 'text-transparent')} />
                          <div class="flex min-w-0 flex-1 flex-col">
                            <span class="truncate" title={altKey}>{variantLabel(altKey)}</span>
                            {#if metadata?.description}
                              <span class="block max-w-3xs whitespace-normal text-[10px] text-muted-foreground">
                                {metadata.description}
                              </span>
                            {/if}
                          </div>
                        </Command.Item>
                      </HoverCard.Trigger>
                      <HoverCard.Content side="right" align="start" class="w-96 space-y-2">
                        {#if metadata?.component}
                          <div class="text-sm font-semibold">{metadata.component}</div>
                        {/if}
                        <div class="break-all font-mono text-[10px] text-muted-foreground">{altKey}</div>
                        {#if metadata?.description}
                          <p class="text-xs leading-relaxed">{metadata.description}</p>
                        {/if}
                        {#if metadata?.keywords && metadata.keywords.length > 0}
                          <div class="flex flex-wrap gap-1">
                            {#each metadata.keywords as kw (kw)}
                              <span class="rounded bg-muted px-1.5 py-0.5 text-[10px]">{kw}</span>
                            {/each}
                          </div>
                        {/if}
                        {#if metadata?.api && metadata.api.length > 0}
                          <div class="space-y-0.5">
                            <div class="text-[10px] uppercase text-muted-foreground">API</div>
                            {#each metadata.api as endpoint (endpoint)}
                              <div class="break-all font-mono text-[10px]">{endpoint}</div>
                            {/each}
                          </div>
                        {/if}
                      </HoverCard.Content>
                    </HoverCard.Root>
                  {/each}
                </Command.Group>
              {/if}
            </Command.List>
          </Command.Root>
        </DropdownMenu.SubContent>
      </DropdownMenu.Sub>
    </DropdownMenu.Content>
  </DropdownMenu.Root>

  <Switch
    checked={value.enabled}
    onCheckedChange={toggleEnabled}
    aria-label={value.enabled ? 'Disable' : 'Enable'} />
</div>
