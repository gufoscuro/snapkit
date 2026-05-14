<script lang="ts">
  import * as Command from '$lib/components/ui/command'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import * as m from '$lib/paraglide/messages'
  import { cn } from '$lib/utils'
  import type { CustomerFilterConfig, FilterOption } from '$lib/utils/filters'
  import Check from '@lucide/svelte/icons/check'
  import CircleIcon from '@lucide/svelte/icons/circle'
  import IconX from '@tabler/icons-svelte/icons/x'

  interface Props {
    entry: CustomerFilterConfig
    value: string | undefined
    onchange: (value: string | undefined) => void
    standalone?: boolean
  }

  const { entry, value, onchange, standalone = false }: Props = $props()

  let searchValue = $state('')
  let options = $state<FilterOption[]>([])
  let loading = $state(true)
  let debounceTimeout: ReturnType<typeof setTimeout> | undefined
  let requestSeq = 0

  async function fetchOptions(search: string) {
    const seq = ++requestSeq
    loading = true
    try {
      const result = await entry.fetchFunction(search)
      if (seq === requestSeq) options = result
    } finally {
      if (seq === requestSeq) loading = false
    }
  }

  $effect(() => {
    const term = searchValue
    if (debounceTimeout) clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(() => fetchOptions(term), 250)
    return () => {
      if (debounceTimeout) clearTimeout(debounceTimeout)
    }
  })

  function select(optValue: string) {
    onchange(optValue === value ? undefined : optValue)
  }
</script>

{#snippet items()}
  <Command.Root shouldFilter={false} class="border-none">
    <Command.Input autofocus placeholder={m.filters_search()} bind:value={searchValue} class="h-8 text-xs" />
    <Command.List>
      <Command.Group>
        <Command.Item disabled={!value} class="text-xs" onSelect={() => onchange(undefined)}>
          <IconX class="mr-2 size-3.5 shrink-0" />
          {m.filters_remove()}
        </Command.Item>
      </Command.Group>
      <Command.Separator />

      {#if loading}
        <Command.Loading>{m.common_loading()}</Command.Loading>
      {:else if options.length === 0}
        <Command.Empty class="py-2 text-center text-xs">{m.common_no_results()}</Command.Empty>
      {:else}
        <Command.Group class="overflow-y-auto">
          {#each options as opt (opt.value)}
            <Command.Item class="text-xs" onSelect={() => select(opt.value)}>
              <Check class={cn('mr-2 size-3.5 shrink-0', value !== opt.value && 'text-transparent')} />
              {opt.label}
            </Command.Item>
          {/each}
        </Command.Group>
      {/if}
    </Command.List>
  </Command.Root>
{/snippet}

{#if standalone}
  {@render items()}
{:else}
  <DropdownMenu.Sub>
    <DropdownMenu.SubTrigger class="justify-between text-xs">
      <div>{entry.label}</div>
      {#if value}
        <CircleIcon class="size-2 fill-current" />
      {/if}
    </DropdownMenu.SubTrigger>
    <DropdownMenu.SubContent align="start" alignOffset={-37} class="p-0">
      {@render items()}
    </DropdownMenu.SubContent>
  </DropdownMenu.Sub>
{/if}
