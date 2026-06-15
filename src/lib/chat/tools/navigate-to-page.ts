import { goto } from '$app/navigation'
import { makeNavigateTool, type NavigateResolution } from '@diaphora/chat'
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
  goto,
})
