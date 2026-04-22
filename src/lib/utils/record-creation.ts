import * as m from '$lib/paraglide/messages'
import { toast } from 'svelte-sonner'
import { invalidateCacheByBasePath } from './request'
import { createRoute } from './route-builder'

/**
 * Opens the create page for a record type in a new browser tab and shows a
 * toast in the originating tab so the user notices the new tab.
 *
 * Used as the default `onCreateRecord` behavior for entity selectors that
 * have a dedicated upsert page. The user creates the record in the new tab
 * and then manually returns to the originating tab to select it.
 *
 * The per-tab API cache is invalidated for `listingUrl` so that when the
 * user returns and reopens the selector, the new record is fetched from
 * the backend (the POST in the other tab invalidates cache only in that tab).
 */
export function openRecordCreation(routeId: string, successMessage: string, listingUrl?: string): void {
  const url = createRoute({ $id: routeId })
  const opened = window.open(url, '_blank')

  if (opened === null) {
    toast.error(m.popup_blocked_open_tab())
    return
  }

  if (listingUrl) {
    invalidateCacheByBasePath(listingUrl)
  }

  toast.info(successMessage, {
    action: {
      label: m.go_to_new_tab(),
      onClick: () => opened.focus(),
    },
  })
}

/**
 * Opens the edit page for an existing record in a new browser tab and shows a
 * toast in the originating tab so the user notices the new tab.
 *
 * Used as the default `onOpenRecord` behavior for entity selectors that have a
 * dedicated upsert page. The user edits the record in the new tab and then
 * manually returns to the originating tab.
 *
 * The per-tab API cache is invalidated for `listingUrl` so that when the user
 * returns and reopens the selector, the updated record is fetched from the
 * backend (the PATCH/PUT in the other tab invalidates cache only in that tab).
 */
export function openRecordEdit(
  routeId: string,
  params: Record<string, string | number>,
  successMessage: string,
  listingUrl?: string,
): void {
  const url = createRoute({ $id: routeId, params })
  const opened = window.open(url, '_blank')

  if (opened === null) {
    toast.error(m.popup_blocked_open_tab())
    return
  }

  if (listingUrl) {
    invalidateCacheByBasePath(listingUrl)
  }

  // toast.info(successMessage, {
  //   action: {
  //     label: m.go_to_new_tab(),
  //     onClick: () => opened.focus(),
  //   },
  // })
}
