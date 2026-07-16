import type { MockScenario } from '../mock-transport'

/**
 * Single-choice scenario — Claude asks the user to pick a deployment target
 * via `request_user_choice`. After the user picks, Claude echoes the selection.
 */
export const choiceScenario: MockScenario = {
	id: 'choice',
	match: { text: /\b(choose|choice|pick|deploy)\b/i },
	turns: [
		{
			stop_reason: 'tool_use',
			content: [
				{ type: 'text', text: 'Which environment do you want to deploy to?' },
				{
					type: 'tool_use',
					id: 'tu_choice_1',
					name: 'request_user_choice',
					input: {
						title: 'Deployment target',
						description: 'Pick the environment to deploy this build.',
						layout: 'cards',
						options: [
							{
								id: 'staging',
								label: 'Staging',
								description: 'Isolated preview — safe to break.'
							},
							{
								id: 'production',
								label: 'Production',
								description: 'Live users will see this deploy.'
							},
							{
								id: 'canary',
								label: 'Canary',
								description: '5% rollout before a full production promotion.'
							}
						],
						submit_label: 'Confirm target'
					}
				}
			]
		},
		{
			stop_reason: 'end_turn',
			content: [
				{
					type: 'text',
					text: 'Got it. (Next iteration will chain this into an actual deploy tool.)'
				}
			]
		}
	]
}

/**
 * Multichoice scenario — Claude asks the user to pick one or more tags
 * via `request_user_multichoice` (min 1, max 3). Then confirms.
 */
export const multichoiceScenario: MockScenario = {
	id: 'multichoice',
	match: { text: /\b(tag|tags|label|labels)\b/i },
	turns: [
		{
			stop_reason: 'tool_use',
			content: [
				{ type: 'text', text: 'Which tags should I attach to this record?' },
				{
					type: 'tool_use',
					id: 'tu_multi_1',
					name: 'request_user_multichoice',
					input: {
						title: 'Add tags',
						description: 'Pick between 1 and 3 tags.',
						min_select: 1,
						max_select: 3,
						options: [
							{ id: 'bug', label: 'Bug', description: 'Something is broken.' },
							{ id: 'feature', label: 'Feature', description: 'New capability.' },
							{ id: 'tech-debt', label: 'Tech debt', description: 'Refactor / cleanup.' },
							{ id: 'docs', label: 'Docs', description: 'Documentation work.' },
							{ id: 'ops', label: 'Ops', description: 'Infra / deploy.' }
						],
						submit_label: 'Apply tags'
					}
				}
			]
		},
		{
			stop_reason: 'end_turn',
			content: [
				{
					type: 'text',
					text: 'Tags applied. Let me know if you want to change them.'
				}
			]
		}
	]
}

/**
 * Form scenario — Claude asks the user to fill in a short form via
 * `request_user_input` with a JSON schema. After submit, Claude echoes back
 * the received values as `show_structured_data`.
 */
export const formScenario: MockScenario = {
	id: 'form',
	match: { text: /\b(form|create issue|new issue|file a bug)\b/i },
	turns: [
		{
			stop_reason: 'tool_use',
			content: [
				{ type: 'text', text: "Sure — let's open a new issue. Fill in the details below." },
				{
					type: 'tool_use',
					id: 'tu_form_1',
					name: 'request_user_input',
					input: {
						title: 'New issue',
						description: 'Required fields are marked with an asterisk.',
						submit_label: 'Create issue',
						schema: {
							type: 'object',
							required: ['title', 'severity'],
							properties: {
								title: {
									type: 'string',
									title: 'Title',
									description: 'Short summary of the issue.'
								},
								severity: {
									type: 'string',
									title: 'Severity',
									description: 'One of: low, medium, high, critical.'
								},
								story_points: {
									type: 'integer',
									title: 'Story points',
									description: 'Optional estimation.'
								},
								block_release: {
									type: 'boolean',
									title: 'Blocks release'
								},
								metadata: {
									type: 'object',
									title: 'Extra metadata (JSON)',
									description: 'Optional JSON object with any extra fields.'
								}
							}
						}
					}
				}
			]
		},
		{
			stop_reason: 'tool_use',
			content: [
				{ type: 'text', text: 'Got it — here is the issue I just created:' },
				{
					type: 'tool_use',
					id: 'tu_form_show',
					name: 'show_structured_data',
					input: {
						title: 'Created issue',
						data: { created: true, echo: 'the mock does not read the user values' }
					}
				}
			]
		},
		{
			stop_reason: 'end_turn',
			content: [
				{ type: 'text', text: "In a real integration I'd echo back the exact values you filled in." }
			]
		}
	]
}

export const interactiveScenarios: MockScenario[] = [choiceScenario, multichoiceScenario, formScenario]
