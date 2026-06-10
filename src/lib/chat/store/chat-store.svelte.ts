import { browser } from '$app/environment'
import { createChatState, httpTransport, type ChatState } from '@diaphora/chat'
import { createBreadcrumbStore, type BreadcrumbStore } from '$lib/chat/core/breadcrumbs.svelte'
import {
  createPageToolsRegistry,
  type PageContextRegistration,
  type PageToolsRegistry,
} from '$lib/chat/core/page-tools-registry.svelte'
import { buildChatContext, type PageSummary } from '$lib/chat/core/context-composer'
import { chatEnabled } from '$lib/chat/enabled'
import { globalHandlers, globalTools } from '$lib/chat/tools/global-tools'
import { tenantConfigStore } from '$lib/stores/tenant-config'
import type { PageConfig } from '$lib/utils/page-registry'
import { chatUi } from './chat-ui.svelte'

type Internals = {
  chat: ChatState
  breadcrumbs: BreadcrumbStore
  pageRegistry: PageToolsRegistry
}

let _state: Internals | null = null

function ensure(): Internals | null {
  if (_state) return _state
  // `chatEnabled` is a compile-time constant in production builds (`false`
  // outside dev), so the rest of this function is unreachable and Vite drops
  // the entire chat infrastructure from the prod bundle.
  if (!browser || !chatEnabled) return null

  const breadcrumbs = createBreadcrumbStore()
  const pageRegistry = createPageToolsRegistry()

  const context = buildChatContext({
    serverContextId: 'global-assistant',
    globalTools,
    globalHandlers,
    pageRegistry,
    breadcrumbs,
    availablePages: collectAvailablePages,
    currentDate: currentDateLine,
    transport: httpTransport({ url: '/api/chat/gemini' }),
  })

  const chat = createChatState(() => context)

  _state = { chat, breadcrumbs, pageRegistry }
  return _state
}

/**
 * Lazy getter for pages the assistant can navigate to.
 * Reads live from tenantConfigStore and includes ALL pages (root + nested).
 * Detail pages whose route requires URL parameters surface their `params` so
 * the model knows to pass them to navigate_to_page (e.g. uuid from a prior
 * search_customers).
 */
function collectAvailablePages(): PageSummary[] {
  const tenant = tenantConfigStore.currentTenant
  if (!tenant) return []
  const out: PageSummary[] = []
  walkPages(tenant.pages, out)
  return out
}

function walkPages(pages: PageConfig[], out: PageSummary[]) {
  for (const page of pages) {
    const summary: PageSummary = { id: page.$id, title: page.title }
    if (page.description) summary.description = page.description
    const params = extractRouteParams(page.route)
    if (params.length > 0) summary.params = params
    out.push(summary)
    if (page.subpages?.length) walkPages(page.subpages, out)
  }
}

/** Pull `:name` placeholders from a path-to-regexp route pattern. */
function extractRouteParams(route: string): string[] {
  const matches = route.matchAll(/:([a-zA-Z_][a-zA-Z0-9_]*)/g)
  return Array.from(matches, m => m[1])
}

/**
 * Current local date in a model-friendly format. Re-evaluated on every send so
 * a long-lived session correctly sees day changes.
 *
 * Format: `YYYY-MM-DD (DayName, MonthName YYYY)` — gives the model both an
 * exact ISO date for filter use and human context for resolving "this month",
 * "aprile", etc.
 */
function currentDateLine(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const monthName = now.toLocaleDateString('en-US', { month: 'long' })
  const weekday = now.toLocaleDateString('en-US', { weekday: 'long' })
  return `${year}-${month}-${day} (${weekday}, ${monthName} ${year})`
}

/**
 * Public, mount-once chat orchestrator. Singleton so the conversation
 * survives route changes within `(app)`. Lazy-init on first browser call.
 *
 * The store coordinates three concerns: the `@diaphora/chat` conversation
 * state, the page-tools registry, and the breadcrumb trace. The drawer's
 * open/close lives in {@link chatUi}.
 */
export const chatStore = {
  /** The underlying `ChatState` instance, lazily created on first access in the browser. */
  get chat(): ChatState | null {
    return ensure()?.chat ?? null
  },

  /** Open the chat drawer. */
  open() {
    chatUi.open()
  },

  /** Close the chat drawer. */
  close() {
    chatUi.close()
  },

  /** Toggle the chat drawer open/closed. */
  toggle() {
    chatUi.toggle()
  },

  /** Send a user message programmatically (e.g. from an "Ask the assistant" button). */
  send(text: string): Promise<void> {
    return ensure()?.chat.send(text) ?? Promise.resolve()
  },

  /** Clear conversation history AND breadcrumbs. Called on user/session change. */
  reset() {
    if (!_state) return
    _state.chat.reset()
    _state.breadcrumbs.reset()
  },

  /** Register page-scoped tools, handlers, and a state snapshot getter. */
  pushPageContext(registration: PageContextRegistration) {
    ensure()?.pageRegistry.register(registration)
  },

  /** Unregister a previously pushed page context by its id. */
  clearPageContext(id: string) {
    _state?.pageRegistry.unregister(id)
  },

  /** Record a route change in the breadcrumb trace (typically called from `afterNavigate`). */
  pushNavigation(pageId: string) {
    ensure()?.breadcrumbs.pushPage(pageId)
  },
}
