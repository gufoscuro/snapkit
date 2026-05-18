export type TextBlock = {
	type: 'text'
	text: string
	/** Opaque transport-specific state preserved across turns. Other transports must ignore unknown keys. */
	metadata?: Record<string, unknown>
}

export type ToolUseBlock = {
	type: 'tool_use'
	id: string
	name: string
	input: Record<string, unknown>
	/** Opaque transport-specific state preserved across turns. Other transports must ignore unknown keys. */
	metadata?: Record<string, unknown>
}

export type ToolResultBlock = {
	type: 'tool_result'
	tool_use_id: string
	content: string
	is_error?: boolean
}

export type ImageBlock = {
	type: 'image'
	source: {
		type: 'base64'
		media_type: string
		data: string
	}
}

export type ContentBlock = TextBlock | ToolUseBlock | ToolResultBlock | ImageBlock

export type ApiMessage = {
	role: 'user' | 'assistant'
	content: string | ContentBlock[]
}

export type ChatMessage = {
	id: string
	timestamp: number
	role: 'user' | 'assistant'
	content: ContentBlock[]
	/** Per-message attachment metadata; only present on user messages that included
	 * file uploads. Rendered as chips/thumbnails by the bubble. The actual content
	 * (text body, image base64) is also flattened into `content` at send-time, so
	 * this field is purely a structural mirror for UI rendering. */
	attachments?: AttachmentRef[]
}

export type AttachmentRef =
	| { kind: 'text'; name: string; mimeType: string; size: number; content: string }
	| { kind: 'image'; name: string; mimeType: string; size: number; base64: string }

export type AttachmentLimits = {
	/** Maximum number of attachments per message (text + image combined). */
	maxFiles: number
	/** Maximum size in bytes for a single image attachment. */
	maxImageSize: number
	/** Maximum size in bytes for a single text attachment. */
	maxTextSize: number
}

export type ToolDefinition = {
	name: string
	description: string
	input_schema: Record<string, unknown>
}

export type ToolHandler =
	| { type: 'sync'; execute: (input: Record<string, unknown>) => string }
	| { type: 'async'; execute: (input: Record<string, unknown>) => Promise<string> }
	| { type: 'interactive' }

export type PendingInteractive = {
	toolUseId: string
	toolName: string
	input: Record<string, unknown>
	submit: (contentJson: string) => void
	cancel: () => void
}

export type StopReason = 'end_turn' | 'tool_use' | 'max_tokens' | 'stop_sequence'

export type ServerContextRef = {
	id: string
	vars?: Record<string, unknown>
}

export type MessagesApiPayload = {
	model: string
	system?: string
	messages: ApiMessage[]
	tools?: ToolDefinition[]
	max_tokens?: number
	/** Authoritative prompt reference. When present, the server backend looks up `id`
	 * in its registry, composes the system prompt from the matching template plus
	 * `vars`, and overrides any `system` field sent by the client. */
	serverContext?: ServerContextRef
}

export type MessagesApiResponse = {
	id: string
	role: 'assistant'
	content: ContentBlock[]
	stop_reason: StopReason
	model: string
	usage?: { input_tokens: number; output_tokens: number }
}

export type Transport = {
	send: (payload: MessagesApiPayload) => Promise<MessagesApiResponse>
}

export type ChatCommandApi = {
	reset: () => void
	send: (text: string) => Promise<void>
	appendAssistant: (text: string) => void
	appendUser: (text: string) => void
}

export type ChatCommand = {
	name: string
	description: string
	/** When true, picking the command from the menu autocompletes `/<name> ` into the
	 * textarea so the user can type arguments. When false (default) the command runs
	 * immediately on selection. */
	hasArgs?: boolean
	handler: (ctx: { chat: ChatCommandApi; args: string }) => void | Promise<void>
}

/**
 * A custom entry in the attachment menu (the dropdown rendered when consumers
 * register at least one item). The handler is invoked with the picked file(s)
 * and a small chat API; it owns its side effects (e.g. parsing the file
 * locally and posting a synthetic user message via `chat.appendUser`). Unlike
 * the default "Attach file" action, files routed through a custom handler do
 * NOT flow through the attachment draft — they never reach the model as raw
 * bytes, only via whatever the handler chooses to do.
 */
export type AttachmentMenuItem = {
	id: string
	label: string
	description?: string
	/** File picker `accept` filter, e.g. `'.yaml,.yml,.json'`. */
	accept: string
	/** Allow picking multiple files at once. Defaults to false. */
	multiple?: boolean
	/** Optional icon rendered alongside the label. */
	icon?: import('svelte').Component
	/** Receives a stable snapshot of the picked files (the source `FileList` is
	 * a live collection that gets cleared when the input is reset, so we pass a
	 * `File[]` instead). */
	handler: (files: File[], api: ChatCommandApi) => void | Promise<void>
}

export type ChatContext = {
	/** Inline system prompt. Exactly one of `systemPrompt` or `serverContext` must be
	 * provided — when both are present, `serverContext` wins (the client prompt is
	 * dropped before sending). */
	systemPrompt?: string | (() => string)
	/** Reference to a server-registered context. The authoritative prompt is built
	 * server-side; the client only supplies the `id` plus any dynamic `vars()`
	 * evaluated fresh at send-time. */
	serverContext?: {
		id: string
		vars?: () => Record<string, unknown>
	}
	tools: ToolDefinition[]
	toolHandlers: Record<string, ToolHandler>
	/** Slash commands available in the chat input. Merged with built-in commands;
	 * a user-supplied command with the same `name` overrides the built-in. */
	commands?: ChatCommand[]
	/** Custom entries in the 📎 menu. When at least one item is registered, the
	 * paperclip button becomes a dropdown with a default "Attach file" entry
	 * (the standard draft flow) plus one menu item per registered handler. */
	attachmentMenuItems?: AttachmentMenuItem[]
	/** Override default attachment limits. Unspecified fields fall back to module defaults. */
	attachments?: Partial<AttachmentLimits>
	transport?: Transport
	canUseAssistant?: () => boolean | Promise<boolean>
	maxToolRounds?: number
	model?: string
}

export type ChatStatus = 'idle' | 'sending' | 'executing_tools' | 'waiting_user' | 'error'
