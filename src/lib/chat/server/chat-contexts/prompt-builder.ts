import { getContext } from './registry'
import type { ChatContextVars } from './types'

export class UnknownChatContextError extends Error {
  constructor(public readonly id: string) {
    super(`Unknown chat context id "${id}"`)
    this.name = 'UnknownChatContextError'
  }
}

export function buildSystemPrompt(id: string, vars: ChatContextVars): string {
  const definition = getContext(id)
  if (!definition) throw new UnknownChatContextError(id)

  let output = definition.template

  for (const key of definition.expectedVars) {
    const raw = vars[key]
    const value = typeof raw === 'string' ? raw.trim() : ''
    const placeholder = `{{${key.toUpperCase()}}}`
    output = output.replaceAll(placeholder, value.length > 0 ? value : '(empty)')
  }

  return output
}
