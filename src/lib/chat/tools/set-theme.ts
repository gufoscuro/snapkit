import { makeThemeTool } from '@diaphora/chat'
import { resetMode, setMode } from 'mode-watcher'

// Host wiring for the package's set_theme capability via mode-watcher.
export const { tool: setThemeTool, handler: setThemeHandler } = makeThemeTool({
  setMode,
  resetMode,
})
