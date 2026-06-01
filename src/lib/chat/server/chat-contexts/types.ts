export type ChatContextVars = Record<string, unknown>

export interface ChatContextDefinition {
  id: string
  template: string
  expectedVars: readonly string[]
}
