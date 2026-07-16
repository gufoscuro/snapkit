<script lang="ts">
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import { Input } from '$lib/components/ui/input'
  import * as m from '$lib/paraglide/messages'
  import { cn } from '$lib/utils'
  import type { AmountFilterConfig, AmountFilterValue } from '$lib/utils/filters'
  import Check from '@lucide/svelte/icons/check'
  import CircleIcon from '@lucide/svelte/icons/circle'
  import IconX from '@tabler/icons-svelte/icons/x'

  interface Props {
    entry: AmountFilterConfig
    value: AmountFilterValue | undefined
    onchange: (value: AmountFilterValue | undefined) => void
    standalone?: boolean
  }

  const { entry, value, onchange, standalone = false }: Props = $props()

  let fromActive = $state(false)
  let toActive = $state(false)
  // `bind:value` on `<input type="number">` coerces to `number | null`, so the
  // state isn't always a string even though we seed it with one.
  let fromInput = $state<string | number | null>('')
  let toInput = $state<string | number | null>('')

  // Track last committed bounds to detect *external* value changes
  // (parent clearAll, URL deserialization) without overwriting the user's
  // in-progress input (e.g. "1." would otherwise get reformatted to "1").
  // Plain let — not reactive — so $effect doesn't depend on them.
  let lastFrom: number | undefined = undefined
  let lastTo: number | undefined = undefined

  let debounceTimeout: ReturnType<typeof setTimeout> | undefined

  function parseInput(raw: string | number | null | undefined): number | undefined {
    if (raw === null || raw === undefined) return undefined
    if (typeof raw === 'number') return Number.isNaN(raw) ? undefined : raw
    const trimmed = raw.trim()
    if (trimmed === '') return undefined
    const n = Number(trimmed)
    return Number.isNaN(n) ? undefined : n
  }

  function commit() {
    const from = fromActive ? parseInput(fromInput) : undefined
    const to = toActive ? parseInput(toInput) : undefined
    lastFrom = from
    lastTo = to
    const next: AmountFilterValue = {}
    if (from !== undefined) next.from = from
    if (to !== undefined) next.to = to
    onchange(next.from === undefined && next.to === undefined ? undefined : next)
  }

  function commitDebounced() {
    if (debounceTimeout) clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(commit, 600)
  }

  function toggleFrom() {
    fromActive = !fromActive
    commit()
  }

  function toggleTo() {
    toActive = !toActive
    commit()
  }

  function clear() {
    fromActive = false
    toActive = false
    fromInput = ''
    toInput = ''
    lastFrom = undefined
    lastTo = undefined
    onchange(undefined)
  }

  $effect(() => {
    const incomingFrom = value?.from
    if (incomingFrom !== lastFrom) {
      lastFrom = incomingFrom
      fromActive = incomingFrom !== undefined
      fromInput = incomingFrom !== undefined ? String(incomingFrom) : ''
    }
    const incomingTo = value?.to
    if (incomingTo !== lastTo) {
      lastTo = incomingTo
      toActive = incomingTo !== undefined
      toInput = incomingTo !== undefined ? String(incomingTo) : ''
    }
  })

  const fromNumber = $derived(fromActive ? parseInput(fromInput) : undefined)
  const toNumber = $derived(toActive ? parseInput(toInput) : undefined)
  const rangeInvalid = $derived(fromNumber !== undefined && toNumber !== undefined && fromNumber > toNumber)
  const hasValue = $derived(fromNumber !== undefined || toNumber !== undefined)
</script>

{#snippet checkboxRow(label: string, active: boolean, toggle: () => void)}
  <button
    type="button"
    class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-accent"
    onclick={toggle}>
    <div class="size-3.5 shrink-0 rounded border hover:border-foreground/60">
      <Check class={cn('size-3', !active && 'text-transparent')} />
    </div>
    <span>{label}</span>
  </button>
{/snippet}

{#snippet rangeBody()}
  <div class="flex min-w-52 flex-col p-1 text-xs">
    {@render checkboxRow(m.filters_amount_gte(), fromActive, toggleFrom)}
    {#if fromActive}
      <div class="flex items-center gap-1.5 pt-0.5 pr-2 pb-1 pl-6">
        <Input
          type="number"
          step="any"
          inputmode="decimal"
          class="h-7 text-xs"
          bind:value={fromInput}
          oninput={commitDebounced} />
        {#if entry.unit}
          <span class="text-xs text-muted-foreground">{entry.unit}</span>
        {/if}
      </div>
    {/if}

    {@render checkboxRow(m.filters_amount_lte(), toActive, toggleTo)}
    {#if toActive}
      <div class="flex items-center gap-1.5 pt-0.5 pr-2 pb-1 pl-6">
        <Input
          type="number"
          step="any"
          inputmode="decimal"
          class="h-7 text-xs"
          bind:value={toInput}
          oninput={commitDebounced} />
        {#if entry.unit}
          <span class="text-xs text-muted-foreground">{entry.unit}</span>
        {/if}
      </div>
    {/if}

    {#if rangeInvalid}
      <div class="px-2 pt-1 text-xs text-destructive">{m.filters_amount_invalid_range()}</div>
    {/if}

    {#if hasValue}
      <DropdownMenu.Separator />
      <button
        type="button"
        class="flex items-center gap-2 rounded px-2 py-1.5 text-left text-xs hover:bg-accent"
        onclick={clear}>
        <IconX class="size-3.5 shrink-0" />
        <span>{m.filters_remove()}</span>
      </button>
    {/if}
  </div>
{/snippet}

{#if standalone}
  {@render rangeBody()}
{:else}
  <DropdownMenu.Sub>
    <DropdownMenu.SubTrigger class="justify-between text-xs">
      <div>{entry.label}</div>
      {#if hasValue}
        <CircleIcon class="size-2 fill-current" />
      {/if}
    </DropdownMenu.SubTrigger>
    <DropdownMenu.SubContent align="start" class="p-0">
      {@render rangeBody()}
    </DropdownMenu.SubContent>
  </DropdownMenu.Sub>
{/if}
