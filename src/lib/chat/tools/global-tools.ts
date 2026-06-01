import { builtinHandlers, builtinTools, type ToolDefinition, type ToolHandler } from '@diaphora/chat'
import { navigateToPageHandler, navigateToPageTool } from './navigate-to-page'
import { searchCustomersHandler, searchCustomersTool } from './search-customers'
import { setThemeHandler, setThemeTool } from './set-theme'
import { showToastHandler, showToastTool } from './show-toast'

// Builtins from @diaphora/chat: show_structured_data, show_action_links,
// request_user_input, request_user_choice, request_user_multichoice. The
// interactive ones are rendered as in-chat forms/choice cards by ChatBox.
export const globalTools: ToolDefinition[] = [
  ...builtinTools,
  navigateToPageTool,
  searchCustomersTool,
  setThemeTool,
  showToastTool,
]

export const globalHandlers: Record<string, ToolHandler> = {
  ...builtinHandlers,
  navigate_to_page: navigateToPageHandler,
  search_customers: searchCustomersHandler,
  set_theme: setThemeHandler,
  show_toast: showToastHandler,
}
