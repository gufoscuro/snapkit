export { default as ChatBox } from './components/ChatBox.svelte'
export {
	default as ConfirmMcpCallDialog,
	confirmMcpCall,
	defaultConfirmMcpMessages,
	type ConfirmMcpCallOptions,
	type ConfirmMcpMessages
} from './components/ConfirmMcpCallDialog.svelte'
export { createChatState, type ChatState } from './chat-state.svelte'
export { getChatState, setChatState } from './chat-context'
export {
	createAttachmentDraftState,
	getAttachmentDraftState,
	setAttachmentDraftState,
	type AttachmentDraftState,
	type DraftAttachment
} from './attachment-draft.svelte'
export { DEFAULT_ATTACHMENT_LIMITS, formatBytes } from './internal/attachments'
export {
	builtinHandlers,
	builtinTools,
	requestUserChoiceTool,
	requestUserInputTool,
	requestUserMultichoiceTool,
	showActionLinksTool,
	showStructuredDataTool
} from './builtin-tools'
export { builtinCommands, clearCommand } from './builtin-commands'
export {
	createPageToolsRegistry,
	type PageContextRegistration,
	type PageToolsRegistry
} from './core/page-tools-registry.svelte'
export {
	createBreadcrumbStore,
	type Breadcrumb,
	type BreadcrumbAction,
	type BreadcrumbStore
} from './core/breadcrumbs.svelte'
export {
	buildChatContext,
	type BuildChatContextOptions,
	type PageSummary
} from './core/context-composer'
export {
	createChatOrchestrator,
	type ChatOrchestrator,
	type ChatOrchestratorConfig
} from './core/orchestrator.svelte'
export { makeToastTool, TOAST_VARIANTS, type ToastAdapter, type ToastVariant } from './tools/toast'
export { makeThemeTool, type ThemeAdapter } from './tools/theme'
export { makeNavigateTool, type NavigateAdapter, type NavigateResolution } from './tools/navigate'
export { makeListingTools, type ListingToolsConfig } from './tools/listing'
export { makeSessionGoalTools, type SessionGoalAdapter } from './tools/session-goal'
export * from './types'
export * from './transport'
