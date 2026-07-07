import type { MessagesApiPayload } from '@diaphora/chat'
import { buildSystemPrompt, UnknownChatContextError } from './prompt-builder'

export type ResolveResult =
  | { ok: true; payload: MessagesApiPayload }
  | { ok: false; status: number; body: { error: string; details?: string } }

type RawServerContext = { id?: unknown; vars?: unknown }

export function extractServerContext(
  payload: MessagesApiPayload,
): { id: string; vars: Record<string, unknown> } | null {
  const raw = (payload as MessagesApiPayload & { serverContext?: unknown }).serverContext
  if (!raw || typeof raw !== 'object') return null
  const { id, vars } = raw as RawServerContext
  if (typeof id !== 'string' || id.length === 0) return null
  const parsedVars =
    vars && typeof vars === 'object' && !Array.isArray(vars) ? (vars as Record<string, unknown>) : {}
  return { id, vars: parsedVars }
}

export function resolveServerContext(payload: MessagesApiPayload): ResolveResult {
  const serverContext = extractServerContext(payload)
  if (!serverContext) {
    return {
      ok: false,
      status: 400,
      body: { error: 'serverContext.id is required' },
    }
  }

  let system: string
  try {
    system = buildSystemPrompt(serverContext.id, serverContext.vars)
  } catch (err) {
    if (err instanceof UnknownChatContextError) {
      return {
        ok: false,
        status: 400,
        body: { error: `Unknown serverContext id "${serverContext.id}"` },
      }
    }
    const message = err instanceof Error ? err.message : String(err)
    return {
      ok: false,
      status: 503,
      body: { error: 'Failed to build system prompt', details: message },
    }
  }

  const stripped: MessagesApiPayload & { serverContext?: unknown } = { ...payload, system }
  delete stripped.serverContext
  return { ok: true, payload: stripped }
}
