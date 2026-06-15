// Composes a ChatContext from global + page-scoped tools, breadcrumbs and
// ambient page/date vars. Part of the @diaphora/chat orchestration layer.
// Deps: package types + sibling orchestration primitives — no host imports.

import type { ChatContext, ToolDefinition, ToolHandler, Transport } from '../types'
import type { BreadcrumbStore } from './breadcrumbs.svelte'
import type { PageToolsRegistry } from './page-tools-registry.svelte'

/** Minimal page descriptor injected into the system prompt as ambient context. */
export type PageSummary = {
  id: string
  title: string
  description?: string
  /** Names of route parameters required to navigate (e.g. ['uuid']). When present,
   * the model is expected to pass `params: { <name>: <value> }` to navigate_to_page. */
  params?: string[]
}

export type BuildChatContextOptions = {
  /** Registry id of the server-side prompt template (e.g. 'global-assistant'). */
  serverContextId: string
  /** Tools always available regardless of current page. */
  globalTools: ToolDefinition[]
  /** Handlers matching globalTools. */
  globalHandlers: Record<string, ToolHandler>
  /** Per-page contribution; tools/handlers/state are merged in via reactive getters. */
  pageRegistry: PageToolsRegistry
  /** Ambient navigation/action trace injected into the system prompt. */
  breadcrumbs: BreadcrumbStore
  /** Lazy getter for the list of pages the user can navigate to. Evaluated on every send. */
  availablePages?: () => PageSummary[]
  /** Lazy getter for the current date/time line injected as ambient context. Evaluated on every send. */
  currentDate?: () => string
  transport?: Transport
  model?: string
  maxToolRounds?: number
}

/**
 * Produces a `ChatContext` whose `tools`, `toolHandlers`, and
 * `serverContext.vars` are evaluated lazily on every read by the chat state
 * machine, so changes to the registry/breadcrumbs/pages after construction are
 * picked up automatically without recreating the chat state.
 */
export function buildChatContext(opts: BuildChatContextOptions): ChatContext {
  const {
    serverContextId,
    globalTools,
    globalHandlers,
    pageRegistry,
    breadcrumbs,
    availablePages,
    currentDate,
    transport,
    model,
    maxToolRounds,
  } = opts

  return {
    serverContext: {
      id: serverContextId,
      vars: () => ({
        BREADCRUMBS: breadcrumbs.format(),
        CURRENT_PAGE: pageRegistry.currentPageState,
        AVAILABLE_PAGES: availablePages ? formatPages(availablePages()) : '',
        CURRENT_DATE: currentDate ? currentDate() : '',
      }),
    },
    get tools(): ToolDefinition[] {
      return [...globalTools, ...pageRegistry.tools]
    },
    get toolHandlers(): Record<string, ToolHandler> {
      return { ...globalHandlers, ...pageRegistry.handlers }
    },
    transport,
    model,
    maxToolRounds,
  }
}

function formatPages(pages: PageSummary[]): string {
  if (pages.length === 0) return ''
  return pages
    .map(p => {
      let line = `- ${p.id} — ${p.title}`
      if (p.description) line += `. ${p.description}`
      if (p.params && p.params.length > 0) line += ` (requires: ${p.params.join(', ')})`
      return line
    })
    .join('\n')
}
