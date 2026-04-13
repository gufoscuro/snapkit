<script lang="ts" generics="T">
  import Spinner from '$components/ui/spinner/spinner.svelte'
  import { Button } from '$lib/components/ui/button'
  import * as Command from '$lib/components/ui/command'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import * as HoverCard from '$lib/components/ui/hover-card'
  import * as m from '$lib/paraglide/messages'
  import { cn } from '$lib/utils'
  import type { BasicOption } from '$lib/utils/generics'
  import Check from '@lucide/svelte/icons/check'
  import { IconDatabaseImport } from '@tabler/icons-svelte'
  import type { Snippet } from 'svelte'
  import { SvelteSet } from 'svelte/reactivity'

  interface Props {
    /** Async function to fetch the items to import. Receives optional search query. */
    fetchFunction: (search?: string) => Promise<T[]>
    /** Maps a raw item T to a display option { label, value } */
    optionMappingFunction: (item: T) => BasicOption
    /** Called with the selected raw items when the user clicks Import */
    onimport: (items: T[]) => void
    /** Optional snippet to render a hover preview for each item */
    previewSnippet?: Snippet<[T]>
    /** Optional label for the trigger button */
    label?: string
    /** Whether the component renders as a sub-menu inside another dropdown */
    submenu?: boolean
    /** Disable the trigger button */
    disabled?: boolean
  }

  const {
    fetchFunction,
    optionMappingFunction,
    onimport,
    previewSnippet,
    label = m.common_import(),
    submenu = false,
    disabled = false,
  }: Props = $props()

  function getItemByValue(value: string): T | undefined {
    return items.find(item => optionMappingFunction(item).value === value)
  }

  let items = $state<T[]>([])
  let loading = $state(true)
  let searchValue = $state('')
  let selectedValues = new SvelteSet<string>()
  let open = $state(false)
  let debounceTimeout: ReturnType<typeof setTimeout> | undefined

  const options = $derived(items.map(optionMappingFunction))

  async function load(search?: string) {
    loading = true
    try {
      items = await fetchFunction(search || undefined)
    } finally {
      loading = false
    }
  }

  function onSearchChange(value: string) {
    searchValue = value
    if (debounceTimeout) clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(() => load(value || undefined), 300)
  }

  function handleOpenChange(isOpen: boolean) {
    open = isOpen
    if (isOpen) {
      selectedValues.clear()
      searchValue = ''
      load()
    } else {
      if (debounceTimeout) clearTimeout(debounceTimeout)
    }
  }

  function toggle(value: string) {
    if (selectedValues.has(value)) {
      selectedValues.delete(value)
    } else {
      selectedValues.add(value)
    }
  }

  function closeMenu() {
    // The shadcn-svelte DropdownMenu wrapper doesn't forward `open` to bits-ui,
    // so programmatic `open = false` has no effect. Dispatch Escape to close natively.
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    open = false
  }

  function handleImport() {
    const selected = items.filter(item => {
      const opt = optionMappingFunction(item)
      return selectedValues.has(opt.value)
    })
    onimport(selected)
    closeMenu()
  }
</script>

{#snippet content()}
  <Command.Root shouldFilter={false} class="border-none">
    <Command.Input
      autofocus
      placeholder={m.filters_search()}
      value={searchValue}
      oninput={e => onSearchChange(e.currentTarget.value)}
      class="h-8 text-xs" />
    <Command.List>
      {#if loading}
        <Command.Loading class="flex items-center gap-1 px-3 py-2 text-xs text-muted-foreground">
          <Spinner />
          {m.common_loading()}
        </Command.Loading>
      {:else if options.length === 0}
        <Command.Empty class="py-2 text-center text-xs">{m.common_no_results()}</Command.Empty>
      {:else}
        <Command.Group class="max-h-48 overflow-y-auto">
          {#each options as opt (opt.value)}
            {@const item = getItemByValue(opt.value)}
            {#if previewSnippet && item}
              <HoverCard.Root openDelay={400} closeDelay={0}>
                <HoverCard.Trigger class="w-full">
                  <Command.Item class="text-xs" onSelect={() => toggle(opt.value)}>
                    <div class="mr-2 size-3.5 shrink-0 rounded border hover:border-foreground/60">
                      <Check class={cn('size-3', !selectedValues.has(opt.value) && 'text-transparent')} />
                    </div>
                    {opt.label}
                  </Command.Item>
                </HoverCard.Trigger>
                <HoverCard.Content side="left" align="start" class="w-72">
                  {@render previewSnippet(item)}
                </HoverCard.Content>
              </HoverCard.Root>
            {:else}
              <Command.Item class="text-xs" onSelect={() => toggle(opt.value)}>
                <div class="mr-2 size-3.5 shrink-0 rounded border hover:border-foreground/60">
                  <Check class={cn('size-3', !selectedValues.has(opt.value) && 'text-transparent')} />
                </div>
                {opt.label}
              </Command.Item>
            {/if}
          {/each}
        </Command.Group>
      {/if}
    </Command.List>
  </Command.Root>
  <div class="border-t p-1">
    <Button
      variant="default"
      size="sm"
      class="w-full text-xs"
      disabled={selectedValues.size === 0}
      onclick={handleImport}>
      {m.common_import()} ({selectedValues.size})
    </Button>
  </div>
{/snippet}

{#if submenu}
  <DropdownMenu.Sub {open} onOpenChange={handleOpenChange}>
    <DropdownMenu.SubTrigger class="text-xs" {disabled}>
      <IconDatabaseImport class="mr-2 size-4" />
      {label}
    </DropdownMenu.SubTrigger>
    <DropdownMenu.SubContent class="p-0">
      {@render content()}
    </DropdownMenu.SubContent>
  </DropdownMenu.Sub>
{:else}
  <DropdownMenu.Root bind:open onOpenChange={handleOpenChange}>
    <DropdownMenu.Trigger {disabled}>
      {#snippet child({ props })}
        <Button {...props} variant="outline" class="gap-2" {disabled}>
          <IconDatabaseImport class="size-4" />
          {label}
        </Button>
      {/snippet}
    </DropdownMenu.Trigger>
    <DropdownMenu.Content align="end" class="p-0">
      {@render content()}
    </DropdownMenu.Content>
  </DropdownMenu.Root>
{/if}
