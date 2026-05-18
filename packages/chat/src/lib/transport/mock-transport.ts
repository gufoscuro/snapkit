import type {
	ContentBlock,
	MessagesApiPayload,
	MessagesApiResponse,
	StopReason,
	Transport
} from '../types'
import { createId } from '../internal/id'

export type MockTurn = {
	stop_reason: StopReason
	content: ContentBlock[]
}

export type MockMatcher =
	| { text: RegExp }
	| { afterToolResult: string }
	| { always: true }

export type MockScenario = {
	id: string
	match: MockMatcher
	turns: MockTurn[]
}

export type MockTransportConfig = {
	scenarios: MockScenario[]
	latencyMs?: number
	fallback?: MockTurn
}

type ActiveScenario = {
	scenarioId: string
	nextTurn: number
}

const FALLBACK_TURN: MockTurn = {
	stop_reason: 'end_turn',
	content: [
		{
			type: 'text',
			text: "No mock scenario matches this input. Add a scenario under `src/lib/chat/transport/scenarios/`."
		}
	]
}

export function mockTransport(config: MockTransportConfig): Transport {
	const latency = config.latencyMs ?? 300
	const fallback = config.fallback ?? FALLBACK_TURN
	let active: ActiveScenario | null = null

	return {
		async send(payload: MessagesApiPayload): Promise<MessagesApiResponse> {
			await delay(latency)

			const turn = pickTurn(payload, config.scenarios, active, fallback)
			active = turn.active

			return {
				id: `mock_${Date.now()}`,
				role: 'assistant',
				content: regenerateToolIds(turn.turn.content),
				stop_reason: turn.turn.stop_reason,
				model: payload.model,
				usage: { input_tokens: 0, output_tokens: 0 }
			}
		}
	}
}

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Mocks reuse scenario content across invocations, so hardcoded tool_use IDs
 * collide when the same scenario runs twice. We regenerate IDs per response
 * so every tool_use block in the conversation is unique.
 */
function regenerateToolIds(content: ContentBlock[]): ContentBlock[] {
	return content.map((block) =>
		block.type === 'tool_use' ? { ...block, id: createId('tu') } : block
	)
}

function pickTurn(
	payload: MessagesApiPayload,
	scenarios: MockScenario[],
	active: ActiveScenario | null,
	fallback: MockTurn
): { turn: MockTurn; active: ActiveScenario | null } {
	if (active) {
		const scenario = scenarios.find((s) => s.id === active.scenarioId)
		if (scenario && active.nextTurn < scenario.turns.length) {
			const turn = scenario.turns[active.nextTurn]
			const isLast = active.nextTurn + 1 >= scenario.turns.length
			return {
				turn,
				active: isLast ? null : { scenarioId: scenario.id, nextTurn: active.nextTurn + 1 }
			}
		}
	}

	const lastUserText = extractLastUserText(payload)
	const matched = scenarios.find((scenario) => matches(scenario.match, lastUserText))

	if (!matched) {
		return { turn: fallback, active: null }
	}

	const first = matched.turns[0] ?? fallback
	const hasMore = matched.turns.length > 1
	return {
		turn: first,
		active: hasMore ? { scenarioId: matched.id, nextTurn: 1 } : null
	}
}

function matches(matcher: MockMatcher, userText: string): boolean {
	if ('always' in matcher) return true
	if ('text' in matcher) return matcher.text.test(userText)
	return false
}

function extractLastUserText(payload: MessagesApiPayload): string {
	for (let i = payload.messages.length - 1; i >= 0; i--) {
		const msg = payload.messages[i]
		if (msg.role !== 'user') continue

		if (typeof msg.content === 'string') return msg.content

		const textBlock = msg.content.find((block) => block.type === 'text')
		if (textBlock && textBlock.type === 'text') return textBlock.text
	}
	return ''
}
