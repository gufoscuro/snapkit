import { getContext, setContext } from 'svelte'
import { loadAttachment, resolveLimits } from './internal/attachments'
import { createId } from './internal/id'
import type { AttachmentLimits, AttachmentRef } from './types'

export type DraftAttachment = AttachmentRef & { id: string }

export type AttachmentDraftState = ReturnType<typeof createAttachmentDraftState>

export function createAttachmentDraftState(getOverrides: () => Partial<AttachmentLimits> | undefined) {
	const items = $state<DraftAttachment[]>([])
	let lastError = $state<string | null>(null)

	async function addFiles(files: Iterable<File>): Promise<void> {
		const limits = resolveLimits(getOverrides())
		const queue = Array.from(files)
		const errors: string[] = []

		for (const file of queue) {
			if (items.length >= limits.maxFiles) {
				errors.push(`Reached the limit of ${limits.maxFiles} attachments per message.`)
				break
			}
			const result = await loadAttachment(file, limits)
			if (!result.ok) {
				errors.push(result.error)
				continue
			}
			items.push({ ...result.ref, id: createId('att') })
		}

		lastError = errors.length > 0 ? errors.join(' ') : null
	}

	function remove(id: string): void {
		const idx = items.findIndex((item) => item.id === id)
		if (idx >= 0) items.splice(idx, 1)
	}

	function clear(): void {
		items.length = 0
		lastError = null
	}

	function clearError(): void {
		lastError = null
	}

	function snapshot(): AttachmentRef[] {
		return items.map((item) => {
			if (item.kind === 'text') {
				return {
					kind: 'text',
					name: item.name,
					mimeType: item.mimeType,
					size: item.size,
					content: item.content
				}
			}
			return {
				kind: 'image',
				name: item.name,
				mimeType: item.mimeType,
				size: item.size,
				base64: item.base64
			}
		})
	}

	return {
		get items() {
			return items
		},
		get lastError() {
			return lastError
		},
		get isFull() {
			return items.length >= resolveLimits(getOverrides()).maxFiles
		},
		addFiles,
		remove,
		clear,
		clearError,
		snapshot
	}
}

const ATTACHMENT_DRAFT_KEY = Symbol('attachment-draft-state')

export function setAttachmentDraftState(state: AttachmentDraftState): AttachmentDraftState {
	return setContext(ATTACHMENT_DRAFT_KEY, state)
}

export function getAttachmentDraftState(): AttachmentDraftState {
	const state = getContext<AttachmentDraftState | undefined>(ATTACHMENT_DRAFT_KEY)
	if (!state) {
		throw new Error('getAttachmentDraftState() called outside of a <ChatBox> context')
	}
	return state
}
