import { goto } from '$app/navigation'
import { makeNavigateTool, type NavigateResolution } from '@diaphora/chat'
import { waitForPageContextRegister } from '$lib/chat/page-context-signal'
import { tenantConfigStore } from '$lib/stores/tenant-config'
import { createRoute } from '$lib/utils/route-builder'

// Host wiring for the package's navigate_to_page capability: resolve a page id
// (+ params) to an href via the tenant page registry and route builder, then
// navigate with SvelteKit's goto.
export const { tool: navigateToPageTool, handler: navigateToPageHandler } = makeNavigateTool({
  resolveHref(pageId, params): NavigateResolution {
    const page = tenantConfigStore.getPageById(pageId)
    if (!page) return { ok: false, error: `unknown page_id "${pageId}"` }
    try {
      return { ok: true, href: createRoute({ $id: pageId, params }) }
    } catch (err) {
      return {
        ok: false,
        error: `failed to build route — likely missing required params for "${pageId}"`,
        details: err instanceof Error ? err.message : String(err),
      }
    }
  },
  // eslint-disable-next-line svelte/no-navigation-without-resolve -- href is a resolved dynamic string from the route builder
  goto: href => goto(href),
  // Wait for the destination page to register its scoped chat tools before the
  // chat loop builds its next round. Without it, the loop can race ahead of the
  // page's onMount registration and land on (say) the invoices list with no
  // filter_invoices tool yet — the model then "can't filter". The package arms
  // this BEFORE goto and awaits it after, so a registration during navigation
  // isn't missed; it self-times-out for pages that contribute no tools.
  awaitPageReady: waitForPageContextRegister,
})
