import { getContext, setContext } from 'svelte'
import type { ChatState } from './chat-state.svelte'

const CHAT_STATE_KEY = Symbol('chat-state')

export function setChatState(state: ChatState): ChatState {
	return setContext(CHAT_STATE_KEY, state)
}

export function getChatState(): ChatState {
	const state = getContext<ChatState | undefined>(CHAT_STATE_KEY)
	if (!state) {
		throw new Error('getChatState() called outside of a <ChatBox> context')
	}
	return state
}
