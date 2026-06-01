import { resetMode, setMode } from 'mode-watcher'
import type { ToolDefinition, ToolHandler } from '@diaphora/chat'

export const setThemeTool: ToolDefinition = {
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

export const setThemeHandler: ToolHandler = {
  type: 'sync',
  execute(input) {
    const mode = input.mode
    if (mode === 'light' || mode === 'dark') {
      setMode(mode)
      return JSON.stringify({ ok: true, mode })
    }
    if (mode === 'system') {
      resetMode()
      return JSON.stringify({ ok: true, mode: 'system' })
    }
    return JSON.stringify({ error: 'mode must be one of: light, dark, system' })
  },
}
