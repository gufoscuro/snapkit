<script lang="ts">
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import * as m from '$lib/paraglide/messages'
  import type { EnumFilterConfig, FilterOption } from '$lib/utils/filters'
  import CircleIcon from '@lucide/svelte/icons/circle'

  interface Props {
    entry: EnumFilterConfig
    value: string | undefined
    onchange: (value: string | undefined) => void
    standalone?: boolean
  }

  const { entry, value, onchange, standalone = false }: Props = $props()

  let fetchedOptions = $state<FilterOption[] | null>(null)
  const options = $derived(entry.options ?? fetchedOptions ?? [])
  const loading = $derived(!entry.options && !!entry.fetchFunction && fetchedOptions === null)

  $effect(() => {
    if (entry.fetchFunction && !entry.options) {
      entry.fetchFunction().then(result => {
        fetchedOptions = result
      })
    }
  })

  function handleSelect(newValue: string | undefined) {
    onchange(newValue === value ? undefined : newValue)
  }
</script>

{#if standalone}
  <DropdownMenu.RadioGroup value={value ?? ''} onValueChange={handleSelect}>
    {#if loading}
      <DropdownMenu.Item disabled class="text-xs">{m.common_loading()}</DropdownMenu.Item>
    {:else}
      {#each options as opt (opt.value)}
        <DropdownMenu.RadioItem class="text-xs" value={opt.value}>{opt.label}</DropdownMenu.RadioItem>
      {/each}
    {/if}
  </DropdownMenu.RadioGroup>
  {#if value}
    <DropdownMenu.Separator />
    <DropdownMenu.Item onclick={() => onchange(undefined)}>{m.filters_remove()}</DropdownMenu.Item>
  {/if}
{:else}
  <DropdownMenu.Sub>
    <DropdownMenu.SubTrigger class="justify-between text-xs">
      <div>{entry.label}</div>
      {#if value}
        <CircleIcon class="size-2 fill-current" />
      {/if}
    </DropdownMenu.SubTrigger>
    <DropdownMenu.SubContent>
      {#if value}
        <DropdownMenu.Item class="text-xs" onclick={() => onchange(undefined)}>{m.filters_remove()}</DropdownMenu.Item>
        <DropdownMenu.Separator />
      {/if}
      <DropdownMenu.RadioGroup value={value ?? ''} onValueChange={handleSelect}>
        {#if loading}
          <DropdownMenu.Item class="text-xs" disabled>{m.common_loading()}</DropdownMenu.Item>
        {:else}
          {#each options as opt (opt.value)}
            <DropdownMenu.RadioItem class="text-xs" value={opt.value}>{opt.label}</DropdownMenu.RadioItem>
          {/each}
        {/if}
      </DropdownMenu.RadioGroup>
    </DropdownMenu.SubContent>
  </DropdownMenu.Sub>
{/if}
