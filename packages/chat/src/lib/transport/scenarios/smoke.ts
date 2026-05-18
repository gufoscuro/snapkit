import type { MockScenario } from '../mock-transport'

export const smokeScenarios: MockScenario[] = [
	{
		id: 'greeting',
		match: { text: /\b(hi|hello|hey|ciao)\b/i },
		turns: [
			{
				stop_reason: 'end_turn',
				content: [
					{
						type: 'text',
						text: "Hi! I'm a mock assistant. Type something to see the chat flow in action."
					}
				]
			}
		]
	},
	{
		id: 'echo',
		match: { always: true },
		turns: [
			{
				stop_reason: 'end_turn',
				content: [
					{
						type: 'text',
						text: "Got it. (fallback reply — I don't have a scenario for this input yet)"
					}
				]
			}
		]
	}
]
