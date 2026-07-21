import { builtinHandlers, builtinTools, type ToolDefinition, type ToolHandler } from '@diaphora/chat'
import { askSalesDataExpertHandler, askSalesDataExpertTool } from './ask-sales-data-expert'
import { navigateToPageHandler, navigateToPageTool } from './navigate-to-page'
import { searchCustomersHandler, searchCustomersTool } from './search-customers'
import { setThemeHandler, setThemeTool } from './set-theme'
import { showToastHandler, showToastTool } from './show-toast'

// Builtins from @diaphora/chat: show_structured_data, show_action_links,
// request_user_input, request_user_choice, request_user_multichoice. The
// interactive ones are rendered as in-chat forms/choice cards by ChatBox.
// The set_session_goal / clear_session_goal tools are NOT listed here: the
// orchestrator injects them itself (sessionGoalTools: true) wired to its own
// goal store.
export const globalTools: ToolDefinition[] = [
  ...builtinTools,
  navigateToPageTool,
  searchCustomersTool,
  setThemeTool,
  showToastTool,
  // Delegation lives in the global layer: one expert compresses an entire domain into a
  // single always-available tool, instead of 30 granular ones bloating every conversation.
  askSalesDataExpertTool,
]

export const globalHandlers: Record<string, ToolHandler> = {
  ...builtinHandlers,
  navigate_to_page: navigateToPageHandler,
  search_customers: searchCustomersHandler,
  set_theme: setThemeHandler,
  show_toast: showToastHandler,
  ask_sales_data_expert: askSalesDataExpertHandler,
}
