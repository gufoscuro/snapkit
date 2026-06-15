// Capability tool factory: switch the UI color theme.
// The package owns the tool shape; the host injects how the theme is applied
// (mode-watcher, a custom theme store, etc.).
// Deps: package types only — no host imports.

import type { ToolDefinition, ToolHandler } from '../types'

export type ThemeAdapter = {
  /** Apply an explicit light or dark theme. */
  setMode: (mode: 'light' | 'dark') => void
  /** Follow the OS preference (clear the explicit override). */
  resetMode: () => void
}

const setThemeTool: ToolDefinition = {
  name: 'set_theme',
  description:
    'Switch the UI color theme. Use when the user asks for dark mode, light mode, or to follow the system preference.',
  input_schema: {
    type: 'object',
    properties: {
      mode: {
        type: 'string',
        enum: ['light', 'dark', 'system'],
        description: 'Target theme: "light", "dark", or "system" to follow the OS preference.',
      },
    },
    required: ['mode'],
  },
}

export function makeThemeTool(adapter: ThemeAdapter): {
  tool: ToolDefinition
  handler: ToolHandler
} {
  const handler: ToolHandler = {
    type: 'sync',
    execute(input) {
      const mode = input.mode
      if (mode === 'light' || mode === 'dark') {
        adapter.setMode(mode)
        return JSON.stringify({ ok: true, mode })
      }
      if (mode === 'system') {
        adapter.resetMode()
        return JSON.stringify({ ok: true, mode: 'system' })
      }
      return JSON.stringify({ error: 'mode must be one of: light, dark, system' })
    },
  }
  return { tool: setThemeTool, handler }
}
