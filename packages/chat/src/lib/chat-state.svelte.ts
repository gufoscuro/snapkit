import type {
	ApiMessage,
	AttachmentMenuItem,
	AttachmentRef,
	ChatCommand,
	ChatContext,
	ChatMessage,
	ChatStatus,
	ContentBlock,
	ImageBlock,
	MessagesApiPayload,
	MessagesApiResponse,
	PendingInteractive,
	TextBlock,
	ToolHandler,
	ToolResultBlock,
	ToolUseBlock,
	Transport
} from './types'
import { httpTransport } from './transport/http-transport'
import { createId } from './internal/id'
import { builtinCommands } from './builtin-commands'
import { formatTextAttachment } from './internal/attachments'

const DEFAULT_MODEL = 'claude-sonnet-4-6'
const DEFAULT_MAX_TOOL_ROUNDS = 10
const DEFAULT_HTTP_URL = '/api/chat/messages'

export type ChatState = ReturnType<typeof createChatState>

export function createChatState(getContext: () => ChatContext) {
	const messages = $state<ChatMessage[]>([])
	let status = $state<ChatStatus>('idle')
	let errorMessage = $state<string | null>(null)
	let pendingInteractive = $state<PendingInteractive | null>(null)

	function resolveTransport(context: ChatContext): Transport {
		return context.transport ?? httpTransport({ url: DEFAULT_HTTP_URL })
	}

	function resolveSystemPrompt(context: ChatContext): string | undefined {
		const prompt = context.systemPrompt
		if (prompt === undefined) return undefined
		return typeof prompt === 'function' ? prompt() : prompt
	}

	function toApiMessages(source: ChatMessage[]): ApiMessage[] {
		return source.map((msg) => ({
			role: msg.role,
			content: flattenContent(msg)
		}))
	}

	function flattenContent(msg: ChatMessage): ContentBlock[] {
		if (!msg.attachments || msg.attachments.length === 0) return msg.content

		const result: ContentBlock[] = []
		const textWraps: string[] = []

		for (const att of msg.attachments) {
			if (att.kind === 'image') {
				const imageBlock: ImageBlock = {
					type: 'image',
					source: { type: 'base64', media_type: att.mimeType, data: att.base64 }
				}
				result.push(imageBlock)
			} else {
				textWraps.push(formatTextAttachment(att))
			}
		}

		let textMerged = false
		for (const block of msg.content) {
			if (block.type === 'text' && !textMerged) {
				const merged = [...textWraps, block.text].filter((piece) => piece.length > 0).join('\n\n')
				result.push({ type: 'text', text: merged })
				textMerged = true
			} else {
				result.push(block)
			}
		}
		if (!textMerged && textWraps.length > 0) {
			result.push({ type: 'text', text: textWraps.join('\n\n') })
		}

		return result
	}

	function appendMessage(
		role: 'user' | 'assistant',
		content: ContentBlock[],
		attachments?: AttachmentRef[]
	): ChatMessage {
		const message: ChatMessage = {
			id: createId('msg'),
			timestamp: Date.now(),
			role,
			content
		}
		if (attachments && attachments.length > 0) message.attachments = attachments
		messages.push(message)
		return message
	}

	function buildPayload(context: ChatContext): MessagesApiPayload {
		const payload: MessagesApiPayload = {
			model: context.model ?? DEFAULT_MODEL,
			messages: toApiMessages(messages),
			tools: context.tools
		}
		if (context.serverContext) {
			payload.serverContext = {
				id: context.serverContext.id,
				vars: context.serverContext.vars?.() ?? {}
			}
		} else {
			const system = resolveSystemPrompt(context)
			if (system !== undefined) payload.system = system
		}
		return payload
	}

	function errorResult(toolUseId: string, message: string): ToolResultBlock {
		return {
			type: 'tool_result',
			tool_use_id: toolUseId,
			content: JSON.stringify({ error: message }),
			is_error: true
		}
	}

	function findToolResult(toolUseId: string): ToolResultBlock | null {
		for (const msg of messages) {
			for (const block of msg.content) {
				if (block.type === 'tool_result' && block.tool_use_id === toolUseId) {
					return block
				}
			}
		}
		return null
	}

	function executeInteractiveTool(block: ToolUseBlock): Promise<ToolResultBlock> {
		return new Promise<ToolResultBlock>((resolvePromise) => {
			const submit = (contentJson: string) => {
				if (pendingInteractive?.toolUseId !== block.id) return
				pendingInteractive = null
				resolvePromise({ type: 'tool_result', tool_use_id: block.id, content: contentJson })
			}
			const cancel = () => {
				if (pendingInteractive?.toolUseId !== block.id) return
				pendingInteractive = null
				resolvePromise(errorResult(block.id, 'User cancelled'))
			}
			pendingInteractive = {
				toolUseId: block.id,
				toolName: block.name,
				input: block.input,
				submit,
				cancel
			}
			status = 'waiting_user'
		})
	}

	async function executeToolUseBlock(
		block: ToolUseBlock,
		handlers: Record<string, ToolHandler>
	): Promise<ToolResultBlock> {
		const handler = handlers[block.name]
		if (!handler) {
			return errorResult(block.id, `No handler registered for tool "${block.name}"`)
		}

		try {
			if (handler.type === 'sync') {
				const content = handler.execute(block.input)
				return { type: 'tool_result', tool_use_id: block.id, content }
			}

			if (handler.type === 'async') {
				const content = await handler.execute(block.input)
				return { type: 'tool_result', tool_use_id: block.id, content }
			}

			// interactive: state machine switches to waiting_user and awaits submit/cancel
			return await executeInteractiveTool(block)
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err)
			return errorResult(block.id, message)
		}
	}

	async function executeToolBatch(
		response: MessagesApiResponse,
		handlers: Record<string, ToolHandler>
	): Promise<ToolResultBlock[]> {
		const toolUses = response.content.filter(
			(block): block is ToolUseBlock => block.type === 'tool_use'
		)
		const results: ToolResultBlock[] = []
		for (const block of toolUses) {
			status = 'executing_tools'
			results.push(await executeToolUseBlock(block, handlers))
		}
		return results
	}

	async function send(text: string, attachments: AttachmentRef[] = []): Promise<void> {
		const trimmed = text.trim()
		if (!trimmed && attachments.length === 0) return
		if (status !== 'idle' && status !== 'error') return

		const context = getContext()

		errorMessage = null

		if (context.canUseAssistant) {
			const allowed = await context.canUseAssistant()
			if (!allowed) {
				status = 'error'
				errorMessage = 'Assistant is not available'
				return
			}
		}

		const userBlocks: ContentBlock[] = trimmed
			? ([{ type: 'text', text: trimmed }] satisfies TextBlock[])
			: []
		appendMessage('user', userBlocks, attachments.length > 0 ? attachments : undefined)

		const transport = resolveTransport(context)
		const maxRounds = context.maxToolRounds ?? DEFAULT_MAX_TOOL_ROUNDS

		try {
			for (let round = 0; round < maxRounds; round++) {
				status = 'sending'
				const response = await transport.send(buildPayload(context))
				appendMessage('assistant', response.content)

				if (response.stop_reason === 'end_turn') {
					status = 'idle'
					return
				}

				if (response.stop_reason !== 'tool_use') {
					status = 'error'
					errorMessage = `Unexpected stop_reason "${response.stop_reason}"`
					return
				}

				const toolResults = await executeToolBatch(response, context.toolHandlers)
				appendMessage('user', toolResults)
			}

			status = 'error'
			errorMessage = `Tool loop exceeded max rounds (${maxRounds})`
		} catch (err) {
			status = 'error'
			errorMessage = err instanceof Error ? err.message : String(err)
		}
	}

	function appendAssistant(text: string): void {
		const trimmed = text.trim()
		if (!trimmed) return
		appendMessage('assistant', [{ type: 'text', text: trimmed }])
	}

	function appendUser(text: string): void {
		const trimmed = text.trim()
		if (!trimmed) return
		appendMessage('user', [{ type: 'text', text: trimmed }])
	}

	function reset(): void {
		if (pendingInteractive) pendingInteractive.cancel()
		messages.length = 0
		status = 'idle'
		errorMessage = null
	}

	function cleanup(): void {
		if (pendingInteractive) pendingInteractive.cancel()
	}

	function getCommandRegistry(): ChatCommand[] {
		const userCommands = getContext().commands ?? []
		const overridden = new Set(userCommands.map((c) => c.name))
		return [...builtinCommands.filter((c) => !overridden.has(c.name)), ...userCommands]
	}

	function getAttachmentMenuItems(): AttachmentMenuItem[] {
		return getContext().attachmentMenuItems ?? []
	}

	async function invokeAttachmentMenuItem(id: string, files: File[]): Promise<void> {
		const item = getAttachmentMenuItems().find((m) => m.id === id)
		if (!item) return
		await item.handler(files, { reset, send, appendAssistant, appendUser })
	}

	function parseCommand(text: string): { name: string; args: string } | null {
		const trimmed = text.trim()
		if (!trimmed.startsWith('/')) return null
		const body = trimmed.slice(1)
		const spaceIdx = body.indexOf(' ')
		const name = spaceIdx === -1 ? body : body.slice(0, spaceIdx)
		const args = spaceIdx === -1 ? '' : body.slice(spaceIdx + 1).trim()
		if (!name) return null
		return { name, args }
	}

	async function executeCommand(text: string): Promise<{ ok: true } | { ok: false; error: string }> {
		const parsed = parseCommand(text)
		if (!parsed) return { ok: false, error: 'Not a command' }
		const cmd = getCommandRegistry().find((c) => c.name === parsed.name)
		if (!cmd) return { ok: false, error: `Unknown command: /${parsed.name}` }
		try {
			await cmd.handler({ chat: { reset, send, appendAssistant, appendUser }, args: parsed.args })
			return { ok: true }
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err)
			return { ok: false, error: message }
		}
	}

	return {
		get messages() {
			return messages
		},
		get status() {
			return status
		},
		get errorMessage() {
			return errorMessage
		},
		get pendingInteractive() {
			return pendingInteractive
		},
		get isBusy() {
			return status === 'sending' || status === 'executing_tools' || status === 'waiting_user'
		},
		get isWaitingUser() {
			return status === 'waiting_user'
		},
		get commands() {
			return getCommandRegistry()
		},
		get attachmentMenuItems() {
			return getAttachmentMenuItems()
		},
		findToolResult,
		send,
		appendAssistant,
		appendUser,
		reset,
		cleanup,
		executeCommand,
		invokeAttachmentMenuItem
	}
}

export { DEFAULT_MAX_TOOL_ROUNDS, DEFAULT_MODEL, DEFAULT_HTTP_URL }
