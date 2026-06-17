// App-wide chat orchestrator. Composes the conversation state with the
// page-tools registry, breadcrumb trace and context composer into a single
// surface an app-wide assistant can drive across routes.
//
// This is the *mechanism*, eager and pure: it builds everything on call and
// has no notion of singletons, feature gates, browser-vs-server, or which
// concrete tools/transport to use. The host owns all of that — it decides
// WHEN to instantiate (lazy/gated) and supplies the config below. Keeping the
// gate out here is what lets a consumer tree-shake the whole assistant out of
// a production build by simply never calling this factory.
//
// Deps: package types + sibling orchestration primitives — no host imports.

import { createChatState, type ChatState } from '../chat-state.svelte'
import { createBreadcrumbStore } from './breadcrumbs.svelte'
import { createPageToolsRegistry, type PageContextRegistration } from './page-tools-registry.svelte'
import { buildChatContext, type PageSummary } from './context-composer'
import type { ToolDefinition, ToolHandler, Transport } from '../types'

export type ChatOrchestratorConfig = {
  /** Registry id of the server-side prompt template (e.g. 'global-assistant'). */
  serverContextId: string
  /** Tools always available regardless of current page. */
  globalTools: ToolDefinition[]
  /** Handlers matching globalTools. */
  globalHandlers: Record<string, ToolHandler>
  /** Transport used to send payloads (e.g. httpTransport to the host's endpoint). */
  transport?: Transport
  /** Lazy getter for pages the assistant can navigate to. Evaluated on every send. */
  availablePages?: () => PageSummary[]
  /** Lazy getter for the current date line injected as ambient context. Evaluated on every send. */
  currentDate?: () => string
  model?: string
  maxToolRounds?: number
  /** Cap on archived breadcrumbs (FIFO when exceeded). Forwarded to the breadcrumb store. */
  breadcrumbMaxEntries?: number
}

/**
 * Build a chat orchestrator from host-supplied config.
 *
 * Returns the live {@link ChatState} plus the conversation-management surface
 * (send/reset, page-context register/unregister, navigation trace). The
 * underlying `breadcrumbs` and `pageRegistry` are exposed for advanced host
 * use (e.g. recording a tool action into the trace).
 *
 * @example
 * const orch = createChatOrchestrator({
 *   serverContextId: 'global-assistant',
 *   globalTools, globalHandlers,
 *   transport: httpTransport({ url: '/api/chat/gemini' }),
 *   availablePages: () => collectPages(),
 *   currentDate: () => todayLine(),
 * })
 * // host keeps `orch` in a gated singleton; <ChatBox chatState={orch.chat} />
 */
export function createChatOrchestrator(config: ChatOrchestratorConfig) {
  const breadcrumbs = createBreadcrumbStore({ maxEntries: config.breadcrumbMaxEntries })
  const pageRegistry = createPageToolsRegistry()

  const context = buildChatContext({
    serverContextId: config.serverContextId,
    globalTools: config.globalTools,
    globalHandlers: config.globalHandlers,
    pageRegistry,
    breadcrumbs,
    availablePages: config.availablePages,
    currentDate: config.currentDate,
    sessionGoal: () => breadcrumbs.goal,
    transport: config.transport,
    model: config.model,
    maxToolRounds: config.maxToolRounds,
  })

  const chat = createChatState(() => context)

  return {
    /** The underlying conversation state. Pass to `<ChatBox chatState={...} />`. */
    get chat(): ChatState {
      return chat
    },
    /** Ambient navigation/action trace. Exposed for host-side `recordAction`. */
    breadcrumbs,
    /** Page-scoped tool registry. */
    pageRegistry,
    /** Send a user message programmatically. */
    send(text: string): Promise<void> {
      return chat.send(text)
    },
    /** Hard reset: clear conversation history AND the breadcrumb trace + goal.
     * Use on user/session change. */
    reset() {
      chat.reset()
      breadcrumbs.reset()
    },
    /** Soft reset: clear only the message history, preserving the breadcrumb
     * trace and session goal. Use on a scope change (entering an authoring
     * surface, switching entity) so the reskinned assistant starts a clean
     * thread but keeps its ambient memory. */
    softReset() {
      chat.reset()
    },
    /** Set the user's overarching cross-page goal (survives soft resets). */
    setGoal(goal: string) {
      breadcrumbs.setGoal(goal)
    },
    /** Clear the session goal (e.g. once the assistant marks it complete). */
    clearGoal() {
      breadcrumbs.clearGoal()
    },
    /** Register page-scoped tools, handlers, and a state snapshot getter. */
    pushPageContext(registration: PageContextRegistration) {
      pageRegistry.register(registration)
    },
    /** Unregister a previously pushed page context by its id. */
    clearPageContext(id: string) {
      pageRegistry.unregister(id)
    },
    /** Record a route change in the breadcrumb trace (e.g. from `afterNavigate`). */
    pushNavigation(pageId: string) {
      breadcrumbs.pushPage(pageId)
    },
  }
}

export type ChatOrchestrator = ReturnType<typeof createChatOrchestrator>
