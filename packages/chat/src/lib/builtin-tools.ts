import type { ToolDefinition, ToolHandler } from './types'

export const showStructuredDataTool: ToolDefinition = {
	name: 'show_structured_data',
	description:
		'Render structured data inline in the chat for the user. Use this whenever you want to display data (tables, objects, lists, summaries) rather than describing them in prose.',
	input_schema: {
		type: 'object',
		properties: {
			title: {
				type: 'string',
				description: 'Optional title rendered above the data.'
			},
			schema: {
				type: 'object',
				description: 'Optional JSON Schema describing the data shape (used by future schema-ui renderer).'
			},
			data: {
				description: 'The data to render. Any JSON-serializable value.'
			}
		},
		required: ['data']
	}
}

export const showActionLinksTool: ToolDefinition = {
	name: 'show_action_links',
	description:
		'Render one or more clickable action links/buttons in the chat. Use this whenever the user needs to navigate somewhere (authenticate an MCP server, open documentation, jump to a related page, etc.). All links open in a new tab. This is display-only — control returns to you immediately; if you need the user to confirm something afterwards, ask them in your text reply.',
	input_schema: {
		type: 'object',
		properties: {
			title: {
				type: 'string',
				description: 'Optional headline rendered above the links.'
			},
			description: {
				type: 'string',
				description: 'Optional helper text shown under the title.'
			},
			links: {
				type: 'array',
				description: 'The links to render as buttons.',
				items: {
					type: 'object',
					properties: {
						label: { type: 'string', description: 'Button text shown to the user.' },
						url: { type: 'string', description: 'Destination URL. Opens in a new tab.' },
						description: {
							type: 'string',
							description: 'Optional sub-text shown as a tooltip on hover.'
						},
						variant: {
							type: 'string',
							enum: ['default', 'secondary', 'outline'],
							description: 'Visual style. Defaults to "default" (filled primary).'
						}
					},
					required: ['label', 'url']
				}
			}
		},
		required: ['links']
	}
}

export const requestUserInputTool: ToolDefinition = {
	name: 'request_user_input',
	description:
		'Ask the user to fill in a form to collect structured data. The `schema` field is a standard JSON Schema describing the fields. Use this whenever you need free-form values (text, numbers, booleans, or nested JSON) that a single choice cannot capture. Returns the submitted values as JSON.',
	input_schema: {
		type: 'object',
		properties: {
			title: { type: 'string', description: 'Optional form title.' },
			description: { type: 'string', description: 'Optional helper text.' },
			schema: {
				type: 'object',
				description:
					'JSON Schema describing the form fields. `properties` is required; `required` lists mandatory fields.'
			},
			submit_label: { type: 'string', description: 'Custom submit button label.' }
		},
		required: ['schema']
	}
}

export const requestUserChoiceTool: ToolDefinition = {
	name: 'request_user_choice',
	description:
		'Ask the user to pick exactly one option from a list. Use this whenever the user must choose between mutually exclusive alternatives. Returns { choice: <id of selected option> }.',
	input_schema: {
		type: 'object',
		properties: {
			title: { type: 'string', description: 'Optional headline.' },
			description: { type: 'string', description: 'Optional helper text shown under the title.' },
			options: {
				type: 'array',
				description: 'The options the user can pick from. Required.',
				items: {
					type: 'object',
					properties: {
						id: { type: 'string', description: 'Value returned when this option is selected.' },
						label: { type: 'string', description: 'Text shown to the user.' },
						description: { type: 'string', description: 'Optional sub-text (mainly for "cards" layout).' },
						icon: { type: 'string', description: 'Optional icon name.' }
					},
					required: ['id', 'label']
				}
			},
			layout: {
				type: 'string',
				enum: ['radio', 'cards'],
				description: 'How to render the options. Defaults to "radio".'
			},
			submit_label: { type: 'string', description: 'Custom submit button label.' }
		},
		required: ['options']
	}
}

export const requestUserMultichoiceTool: ToolDefinition = {
	name: 'request_user_multichoice',
	description:
		'Ask the user to pick zero or more options from a list (checkboxes). Use this whenever the user can combine alternatives. Returns { choices: [<ids>] }.',
	input_schema: {
		type: 'object',
		properties: {
			title: { type: 'string' },
			description: { type: 'string' },
			options: {
				type: 'array',
				items: {
					type: 'object',
					properties: {
						id: { type: 'string' },
						label: { type: 'string' },
						description: { type: 'string' }
					},
					required: ['id', 'label']
				}
			},
			min_select: { type: 'number', description: 'Minimum number of options that must be selected.' },
			max_select: { type: 'number', description: 'Maximum number of options that can be selected.' },
			submit_label: { type: 'string' }
		},
		required: ['options']
	}
}

export const builtinTools: ToolDefinition[] = [
	showStructuredDataTool,
	showActionLinksTool,
	requestUserInputTool,
	requestUserChoiceTool,
	requestUserMultichoiceTool
]

export const builtinHandlers: Record<string, ToolHandler> = {
	show_structured_data: {
		type: 'sync',
		execute: () => JSON.stringify({ rendered: true })
	},
	show_action_links: {
		type: 'sync',
		execute: () => JSON.stringify({ rendered: true })
	},
	request_user_input: { type: 'interactive' },
	request_user_choice: { type: 'interactive' },
	request_user_multichoice: { type: 'interactive' }
}
