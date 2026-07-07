export type SchemaField = {
	name: string
	type: 'text' | 'number' | 'boolean' | 'json'
	label: string
	description?: string
	required: boolean
	default?: unknown
}

export function parseInputSchema(schema: Record<string, unknown>): SchemaField[] {
	const properties = schema.properties as Record<string, Record<string, unknown>> | undefined
	if (!properties) return []

	const required = (schema.required as string[]) ?? []

	return Object.entries(properties).map(([name, prop]) => {
		const jsonType = prop.type as string | undefined
		let type: SchemaField['type'] = 'text'

		if (jsonType === 'number' || jsonType === 'integer') {
			type = 'number'
		} else if (jsonType === 'boolean') {
			type = 'boolean'
		} else if (jsonType === 'object' || jsonType === 'array') {
			type = 'json'
		} else if (jsonType === 'string') {
			type = 'text'
		}

		return {
			name,
			type,
			label: (prop.title as string) ?? name,
			description: prop.description as string | undefined,
			required: required.includes(name),
			default: prop.default
		}
	})
}

export function buildInitialValues(fields: SchemaField[]): Record<string, unknown> {
	const values: Record<string, unknown> = {}
	for (const field of fields) {
		if (field.default !== undefined) {
			values[field.name] =
				field.type === 'json' ? JSON.stringify(field.default, null, 2) : field.default
		} else if (field.type === 'boolean') {
			values[field.name] = false
		} else {
			values[field.name] = ''
		}
	}
	return values
}

export function buildSubmitValues(
	formValues: Record<string, unknown>,
	fields: SchemaField[]
): Record<string, unknown> {
	const result: Record<string, unknown> = {}
	for (const field of fields) {
		const raw = formValues[field.name]
		if (field.type === 'json' && typeof raw === 'string' && raw.trim()) {
			try {
				result[field.name] = JSON.parse(raw)
			} catch {
				result[field.name] = raw
			}
		} else if (field.type === 'number' && typeof raw === 'string') {
			result[field.name] = raw === '' ? undefined : Number(raw)
		} else {
			result[field.name] = raw
		}
	}
	return result
}

/**
 * Light client-side validation for required fields and JSON parseability.
 * Returns a record of field name → error message, empty when valid.
 */
export function validateFields(
	formValues: Record<string, unknown>,
	fields: SchemaField[]
): Record<string, string> {
	const errors: Record<string, string> = {}
	for (const field of fields) {
		const raw = formValues[field.name]

		if (field.required) {
			if (field.type === 'boolean') {
				// boolean required means "must be true" — matches common UX for TOS-style checkboxes
				if (raw !== true) errors[field.name] = 'Required'
				continue
			}
			if (raw === undefined || raw === null || raw === '') {
				errors[field.name] = 'Required'
				continue
			}
		}

		if (field.type === 'json' && typeof raw === 'string' && raw.trim()) {
			try {
				JSON.parse(raw)
			} catch {
				errors[field.name] = 'Invalid JSON'
			}
		}

		if (field.type === 'number' && typeof raw === 'string' && raw !== '') {
			if (Number.isNaN(Number(raw))) {
				errors[field.name] = 'Invalid number'
			}
		}
	}
	return errors
}
