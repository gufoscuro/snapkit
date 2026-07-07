import { goto } from '$app/navigation'
import { page } from '$app/state'
import { makeListingTools, type PageContextRegistration } from '@diaphora/chat'

export type ListingChatOptions = {
  /**
   * Structured-filter URL keys the page owns, in addition to the universal
   * `search` key. Cleared by clear_filters. Can be passed as an array (frozen
   * at mount) or a getter (re-evaluated on every tool call — preferred when
   * the underlying filter config could change).
   */
  filterKeys?: readonly string[] | (() => readonly string[])
}

/**
 * Page-chat registration with the two tools every `GenericFilters`-based
 * listing page supports: a free-text search and a "clear everything" reset.
 * Thin host wiring over the package's `makeListingTools` — injects SvelteKit's
 * URL state and navigation (with the listing-friendly goto options).
 */
export function makeListingChatRegistration(opts: ListingChatOptions = {}): PageContextRegistration {
  return makeListingTools({
    getUrl: () => page.url,
    navigate: url => goto(url, { replaceState: true, keepFocus: true, noScroll: true }),
    filterKeys: opts.filterKeys,
  })
}
