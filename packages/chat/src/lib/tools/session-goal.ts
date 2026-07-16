// Capability tool factory: record/clear the user's overarching, multi-step
// objective ("session goal"). The package owns the tool shapes + handler logic;
// the host (or the orchestrator, which owns the goal store) injects the
// setGoal/clearGoal mutators. The goal is injected into the prompt as
// SESSION_GOAL by the context composer.
// Deps: package types only — no host imports.

import type { ToolDefinition, ToolHandler } from '../types'

export type SessionGoalAdapter = {
  setGoal: (goal: string) => void
  clearGoal: () => void
}

const setSessionGoalTool: ToolDefinition = {
  name: 'set_session_goal',
  description:
    "Record the user's overarching, multi-step objective so it persists as you guide them across pages (it survives navigation and is shown back to you as the active goal). Call this when a request needs more than one step — e.g. \"show invoices for Acme\" (navigate to the invoices list, then filter by that customer). Keep it to one concise sentence. Overwrites any previous goal.",
  input_schema: {
    type: 'object',
    properties: {
      goal: { type: 'string', description: "One-line summary of the user's overarching objective." },
    },
    required: ['goal'],
  },
}

const clearSessionGoalTool: ToolDefinition = {
  name: 'clear_session_goal',
  description: 'Clear the recorded session goal once it has been accomplished or abandoned.',
  input_schema: { type: 'object', properties: {} },
}

/**
 * Build the `set_session_goal` / `clear_session_goal` tools wired to the given
 * goal mutators. Hosts can wire these manually, but `createChatOrchestrator`
 * will inject them automatically (bound to its own breadcrumb goal store) when
 * `sessionGoalTools: true` — that's the preferred path, since it avoids a
 * late-binding dance between the early-built tool list and the orchestrator.
 */
export function makeSessionGoalTools(adapter: SessionGoalAdapter): {
  tools: ToolDefinition[]
  handlers: Record<string, ToolHandler>
} {
  return {
    tools: [setSessionGoalTool, clearSessionGoalTool],
    handlers: {
      set_session_goal: {
        type: 'sync',
        execute(input) {
          const goal = typeof input.goal === 'string' ? input.goal.trim() : ''
          if (!goal) return JSON.stringify({ error: 'goal is required' })
          adapter.setGoal(goal)
          return JSON.stringify({ ok: true, goal })
        },
      },
      clear_session_goal: {
        type: 'sync',
        execute() {
          adapter.clearGoal()
          return JSON.stringify({ ok: true })
        },
      },
    },
  }
}
