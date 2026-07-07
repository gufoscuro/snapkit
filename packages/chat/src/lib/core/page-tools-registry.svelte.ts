// Page-scoped tool registry. Part of the @diaphora/chat orchestration layer.
// Deps: Svelte runes + package types only — no host imports.

import { SvelteMap } from 'svelte/reactivity'
import type { AttachmentMenuItem, ToolDefinition, ToolHandler } from '../types'

export type PageContextRegistration = {
  /** Stable id for register/unregister. Usually the page route or a feature key. */
  id: string
  tools?: ToolDefinition[]
  toolHandlers?: Record<string, ToolHandler>
  /** Lazy snapshot of the page state injected as ambient context into the system prompt.
   * Re-evaluated on every send (don't memoize stale data inside). */
  state?: () => string
  /** When set, this registration *claims* the conversation's server-side context
   * (skill/prompt) while active — e.g. `'plan-authoring'`. The composer resolves
   * the active claim on every send; the host's global `serverContextId` is the
   * fallback when no registration claims one. Among multiple claimants the
   * last-registered wins (see `activeServerContextId`). */
  serverContextId?: string
  /** Lazy vars for the claimed `serverContextId`'s prompt template (e.g. `{ fml }`).
   * Merged across all active registrations and over the composer's ambient vars,
   * re-evaluated on every send. */
  vars?: () => Record<string, unknown>
  /** Custom 📎 menu entries contributed while this registration is active.
   * Concatenated across registrations. */
  attachmentMenuItems?: AttachmentMenuItem[]
}

export function createPageToolsRegistry() {
  const registrations = new SvelteMap<string, PageContextRegistration>()
  // Fired synchronously after each register(). Lets a navigation wait for the
  // destination page to contribute its scoped tools before the chat loop builds
  // its next round — see waitForNextRegistration. A plain (non-reactive) Set: a
  // pub/sub bag mutated and read only imperatively, never tracked by an effect.
  // eslint-disable-next-line svelte/prefer-svelte-reactivity
  const registerListeners = new Set<() => void>()

  function register(reg: PageContextRegistration) {
    registrations.set(reg.id, reg)
    // Copy before iterating: a listener removes itself on fire.
    for (const listener of [...registerListeners]) listener()
  }

  function unregister(id: string) {
    registrations.delete(id)
  }

  return {
    register,
    unregister,
    /**
     * Resolve once the next registration lands, or after `timeoutMs` (whichever
     * comes first). The chat send loop reads `tools` fresh every round, so a
     * page-scoped tool registered mid-turn DOES surface next round — but only if
     * it registered in time. A navigation handler awaits this right after `goto`
     * so the loop doesn't race ahead of the destination page's onMount
     * registration (e.g. landing on a list with no filter tool yet). A page that
     * contributes no tools never registers, so the timeout is the expected exit.
     */
    waitForNextRegistration(timeoutMs = 1200): Promise<void> {
      return new Promise(resolve => {
        let settled = false
        const finish = () => {
          if (settled) return
          settled = true
          registerListeners.delete(onRegister)
          clearTimeout(timer)
          resolve()
        }
        // A page can contribute several registrations in one mount flush (e.g. a
        // generic filter bar plus an entity-specific one). Defer a microtask
        // after the first so siblings in the same flush also land first.
        const onRegister = () => queueMicrotask(finish)
        const timer = setTimeout(finish, timeoutMs)
        registerListeners.add(onRegister)
      })
    },
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
    /** Server context claimed by the active registrations, or null when none claims one.
     * Last-registered claimant wins (insertion order; re-registering keeps position). */
    get activeServerContextId(): string | null {
      let claim: string | null = null
      for (const reg of registrations.values()) {
        if (reg.serverContextId) claim = reg.serverContextId
      }
      return claim
    },
    /** Vars merged across all active registrations (later registrations override on key clash). */
    activeVars(): Record<string, unknown> {
      const out: Record<string, unknown> = {}
      for (const reg of registrations.values()) {
        if (reg.vars) Object.assign(out, reg.vars())
      }
      return out
    },
    get attachmentMenuItems(): AttachmentMenuItem[] {
      const out: AttachmentMenuItem[] = []
      for (const reg of registrations.values()) {
        if (reg.attachmentMenuItems) out.push(...reg.attachmentMenuItems)
      }
      return out
    },
  }
}

export type PageToolsRegistry = ReturnType<typeof createPageToolsRegistry>
