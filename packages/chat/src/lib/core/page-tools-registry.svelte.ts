// Page-scoped tool registry. Part of the @diaphora/chat orchestration layer.
// Deps: Svelte runes + package types only — no host imports.

import { SvelteMap } from 'svelte/reactivity'
import type { ToolDefinition, ToolHandler } from '../types'

export type PageContextRegistration = {
  /** Stable id for register/unregister. Usually the page route or a feature key. */
  id: string
  tools?: ToolDefinition[]
  toolHandlers?: Record<string, ToolHandler>
  /** Lazy snapshot of the page state injected as ambient context into the system prompt.
   * Re-evaluated on every send (don't memoize stale data inside). */
  state?: () => string
}

export function createPageToolsRegistry() {
  const registrations = new SvelteMap<string, PageContextRegistration>()

  function register(reg: PageContextRegistration) {
    registrations.set(reg.id, reg)
  }

  function unregister(id: string) {
    registrations.delete(id)
  }

  return {
    register,
    unregister,
    get tools(): ToolDefinition[] {
      const out: ToolDefinition[] = []
      for (const reg of registrations.values()) {
        if (reg.tools) out.push(...reg.tools)
      }
      return out
    },
    get handlers(): Record<string, ToolHandler> {
      const out: Record<string, ToolHandler> = {}
      for (const reg of registrations.values()) {
        if (reg.toolHandlers) Object.assign(out, reg.toolHandlers)
      }
      return out
    },
    get currentPageState(): string {
      const parts: string[] = []
      for (const reg of registrations.values()) {
        const snapshot = reg.state?.()
        if (typeof snapshot === 'string' && snapshot.length > 0) parts.push(snapshot)
      }
      return parts.join('\n')
    },
  }
}

export type PageToolsRegistry = ReturnType<typeof createPageToolsRegistry>
