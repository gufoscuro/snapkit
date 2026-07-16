import type { MockScenario } from '../mock-transport'

/**
 * Sync tool scenario — Claude invokes `show_structured_data`, the handler
 * returns synchronously, Claude wraps up with a text reply in the next turn.
 */
export const showDataScenario: MockScenario = {
	id: 'show-data',
	match: { text: /\b(show|display|data|table)\b/i },
	turns: [
		{
			stop_reason: 'tool_use',
			content: [
				{ type: 'text', text: 'Here is the data you asked for:' },
				{
					type: 'tool_use',
					id: 'tu_show_1',
					name: 'show_structured_data',
					input: {
						title: 'Active users in the last 7 days',
						data: [
							{ id: 1, name: 'Alice', role: 'admin', lastSeen: '2026-04-17' },
							{ id: 2, name: 'Bob', role: 'editor', lastSeen: '2026-04-16' },
							{ id: 3, name: 'Carol', role: 'viewer', lastSeen: '2026-04-15' }
						]
					}
				}
			]
		},
		{
			stop_reason: 'end_turn',
			content: [
				{
					type: 'text',
					text: 'Let me know if you want me to filter or aggregate this in a different way.'
				}
			]
		}
	]
}

/**
 * Async tool scenario — Claude invokes a custom `fake_save_note` handler,
 * the handler awaits for ~700ms and returns { saved: true, id: ... }.
 * Claude reads the result and confirms in the next turn.
 */
export const asyncToolScenario: MockScenario = {
	id: 'async-save',
	match: { text: /\b(save|note)\b/i },
	turns: [
		{
			stop_reason: 'tool_use',
			content: [
				{ type: 'text', text: 'Saving the note…' },
				{
					type: 'tool_use',
					id: 'tu_save_1',
					name: 'fake_save_note',
					input: {
						title: 'Kickoff meeting',
						body: 'Agreed on the Q2 roadmap: focus on plan authoring and the chatbox.'
					}
				}
			]
		},
		{
			stop_reason: 'end_turn',
			content: [
				{
					type: 'text',
					text: 'Note saved. Want me to show the list of saved notes?'
				}
			]
		}
	]
}

export const toolUseScenarios: MockScenario[] = [showDataScenario, asyncToolScenario]
