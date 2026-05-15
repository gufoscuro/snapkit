<!--
  @component GenericFilters
  @description A search filter component that provides filter state to sibling components.
  Positioned on the right side with a search input field. Persists search and structured
  filters to the URL via `replaceState` (no extra history entries, no load-function reruns),
  and seeds initial state from the URL on mount — so reloading the page or sharing the link
  restores the same view.
  Provides filter state consumable by SalesOrdersTable or SupplyOrdersTable.
  @keywords filter, search, orders, common, url-state
  @uses Input
  @provides filters
-->
<script lang="ts" module>
  export { GenericFiltersContract as contract } from './GenericFilters.contract.js'
</script>

<script lang="ts">
  import { replaceState } from '$app/navigation'
  import { page } from '$app/state'
  import { FilterDropdown } from '$components/core/common/filter-dropdown'
  import { Input } from '$lib/components/ui/input'
  import { useProvides } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages.js'
  import {
    type FilterConfig,
    getFilterUrlKeys,
    type QueryObject,
    readFiltersFromUrl,
  } from '$lib/utils/filters'
  import type { SnippetProps } from '$utils/runtime.js'
  import Search from '@lucide/svelte/icons/search'
  import { untrack, type Snippet } from 'svelte'
  import { GenericFiltersContract } from './GenericFilters.contract.js'

  const {
    children,
    hideSearch = false,
    config,
  }: SnippetProps & { children?: Snippet; hideSearch?: boolean; config?: FilterConfig } = $props()

  const filtersHandle = useProvides(GenericFiltersContract, 'filters')

  // Effective config for the URL helpers — empty when the caller hasn't passed one.
  const effectiveConfig = $derived(config ?? ({} as FilterConfig))

  // ---- Initial state from URL ----
  const initial = untrack(() => readFiltersFromUrl(page.url, effectiveConfig))
  let searchValue = $state(initial.search ?? '')
  let currentQuery = $state<QueryObject | undefined>(initial.query)

  // Last URL search-string we wrote, used to skip self-induced reactivity from
  // our own replaceState updates. External URL changes (browser back/forward,
  // programmatic navigation) won't match this and will trigger a resync.
  let lastWrittenSearchString = untrack(() => page.url.searchParams.toString())

  let stateDebounceTimeout: ReturnType<typeof setTimeout> | undefined
  let urlDebounceTimeout: ReturnType<typeof setTimeout> | undefined

  function buildParams(searchVal: string, queryVal: QueryObject | undefined): URLSearchParams {
    const params = new URLSearchParams(page.url.searchParams.toString())
    // Clear the keys we own — preserve anything else (e.g. `page` for pagination).
    params.delete('search')
    for (const key of getFilterUrlKeys(effectiveConfig)) params.delete(key)
    // Re-add active values.
    const trimmed = searchVal.trim()
    if (trimmed !== '') params.set('search', trimmed)
    if (queryVal) {
      for (const [k, v] of Object.entries(queryVal)) {
        if (v !== undefined && v !== '') params.set(k, v)
      }
    }
    return params
  }

  function writeUrl() {
    const params = buildParams(searchValue, currentQuery)
    const newSearchString = params.toString()
    if (newSearchString === lastWrittenSearchString) return
    lastWrittenSearchString = newSearchString
    const path = page.url.pathname
    replaceState(newSearchString ? `${path}?${newSearchString}` : path, page.state)
  }

  function writeUrlDebounced() {
    if (urlDebounceTimeout) clearTimeout(urlDebounceTimeout)
    urlDebounceTimeout = setTimeout(writeUrl, 400)
  }

  function commitState() {
    filtersHandle.set({
      search: searchValue || undefined,
      query: currentQuery,
    })
  }

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement
    searchValue = target.value

    if (stateDebounceTimeout) clearTimeout(stateDebounceTimeout)
    stateDebounceTimeout = setTimeout(commitState, 300)
    writeUrlDebounced()
  }

  function handleQueryChange(query: QueryObject | undefined) {
    currentQuery = query
    commitState()
    if (urlDebounceTimeout) clearTimeout(urlDebounceTimeout)
    writeUrl()
  }

  // Initial commit on mount + cleanup on unmount.
  $effect(() => {
    untrack(commitState)
    return () => {
      if (stateDebounceTimeout) clearTimeout(stateDebounceTimeout)
      if (urlDebounceTimeout) clearTimeout(urlDebounceTimeout)
    }
  })

  // React to *external* URL changes (browser back/forward, programmatic nav).
  $effect(() => {
    const currentSearchString = page.url.searchParams.toString()
    if (currentSearchString === lastWrittenSearchString) return
    if (urlDebounceTimeout) clearTimeout(urlDebounceTimeout)
    if (stateDebounceTimeout) clearTimeout(stateDebounceTimeout)
    lastWrittenSearchString = currentSearchString
    const { search, query } = readFiltersFromUrl(page.url, effectiveConfig)
    searchValue = search ?? ''
    currentQuery = query
    commitState()
  })
</script>

<div class="flex w-full items-center justify-end gap-2">
  {#if config}
    <FilterDropdown {config} query={currentQuery} onchange={handleQueryChange} />
  {/if}

  {#if !hideSearch}
    <div class="relative w-64">
      <Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input type="search" placeholder={m.common_search()} value={searchValue} oninput={handleInput} class="pl-9" />
    </div>
  {/if}

  {@render children?.()}
</div>
