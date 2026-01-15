<script lang="ts">
  import { goto } from '$app/navigation'
  import Input from '$lib/components/ui/input/input.svelte'
  import type { SnippetProps } from '$utils/runtime'

  const { routeDetails }: SnippetProps = $props()

  function onSearchChange(event: Event) {
    const target = event.target as HTMLInputElement
    const searchValue = target.value

    // add the search value in the URL param called 'search'
    const url = new URL(window.location.href)
    if (searchValue) {
      url.searchParams.set('search', searchValue)
    } else {
      url.searchParams.delete('search') // remove the param if empty
    }

    goto(url.pathname + url.search, { keepFocus: true })
  }
</script>

<div class="sticky top-0 z-10 flex h-14 w-full items-center justify-between gap-4 bg-background">
  <div>Page Filters With Search Component. Search: {routeDetails.search}</div>

  <Input type="search" placeholder="Search in table..." class="max-w-xs" oninput={onSearchChange} />
</div>
