import { globalAssistantContext } from './global-assistant'
import type { ChatContextDefinition } from './types'

const registry = new Map<string, ChatContextDefinition>()

registry.set(globalAssistantContext.id, globalAssistantContext)

export function getContext(id: string): ChatContextDefinition | null {
  return registry.get(id) ?? null
}
