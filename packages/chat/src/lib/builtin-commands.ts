import type { ChatCommand } from './types'

export const clearCommand: ChatCommand = {
	name: 'clear',
	description: 'Clear the conversation history',
	handler: ({ chat }) => chat.reset()
}

export const builtinCommands: ChatCommand[] = [clearCommand]
