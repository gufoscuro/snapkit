<script lang="ts">
  import { Badge } from '$lib/components/ui/badge'
  import * as Command from '$lib/components/ui/command'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import * as m from '$lib/paraglide/messages'
  import { cn } from '$lib/utils'
  import type { FilterOption, TagsFilterConfig } from '$lib/utils/filters'
  import IconX from '@tabler/icons-svelte/icons/x'
  import Check from '@lucide/svelte/icons/check'

  interface Props {
    entry: TagsFilterConfig
    value: string[]
    onchange: (value: string[]) => void
    standalone?: boolean
  }

  const { entry, value, onchange, standalone = false }: Props = $props()

  let fetchedOptions = $state<FilterOption[] | null>(null)
  let searchValue = $state('')

  const options = $derived(entry.options ?? fetchedOptions ?? [])
  const loading = $derived(!entry.options && !!entry.fetchFunction && fetchedOptions === null)
  const filtered = $derived(
    searchValue ? options.filter(o => o.label.toLowerCase().includes(searchValue.toLowerCase())) : options,
  )

  $effect(() => {
    if (entry.fetchFunction && !entry.options) {
      entry.fetchFunction().then(result => {
        fetchedOptions = result
      })
    }
  })

  function toggle(optValue: string) {
    if (value.includes(optValue)) {
      onchange(value.filter(v => v !== optValue))
    } else {
      onchange([...value, optValue])
    }
  }
</script>

{#snippet items()}
  <Command.Root shouldFilter={false} class="border-none">
    <Command.Input autofocus placeholder={m.filters_search()} bind:value={searchValue} class="h-8 text-xs" />
    <Command.List>
      <Command.Group>
        <Command.Item disabled={value.length === 0} class="text-xs" onSelect={() => onchange([])}>
          <div class="mr-2 size-3.5 shrink-0 rounded border hover:border-foreground/60">
            <IconX class="size-3" />
          </div>

          {m.filters_remove()}
        </Command.Item>
      </Command.Group>
      <Command.Separator />

      {#if loading}
        <Command.Loading>{m.common_loading()}</Command.Loading>
      {:else if filtered.length === 0}
        <Command.Empty class="py-2 text-center text-xs">{m.common_no_results()}</Command.Empty>
      {:else}
        <Command.Group class="overflow-y-auto">
          {#each filtered as opt (opt.value)}
            <Command.Item class="text-xs" onSelect={() => toggle(opt.value)}>
              <div class="mr-2 size-3.5 shrink-0 rounded border hover:border-foreground/60">
                <Check class={cn('size-3', !value.includes(opt.value) && 'text-transparent')} />
              </div>
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
      {#if value.length > 0}
        <Badge variant="secondary" class="text-xs">{value.length}</Badge>
      {/if}
    </DropdownMenu.SubTrigger>
    <DropdownMenu.SubContent align="start" alignOffset={-37} class="p-0">
      {@render items()}
    </DropdownMenu.SubContent>
  </DropdownMenu.Sub>
{/if}
