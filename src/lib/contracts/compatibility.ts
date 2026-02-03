import { TypeGuard, ExtendsCheck, ExtendsResult } from '@sinclair/typebox'
import type { TSchema, TObject } from '@sinclair/typebox'

/**
 * Result of a schema compatibility check.
 */
export interface CompatibilityResult {
	/** Whether the schemas are compatible */
	compatible: boolean
	/** Detailed info per property (for object schemas) */
	details: PropertyCompatibility[]
	/** Human-readable summary */
	summary: string
}

/**
 * Compatibility status for a single property.
 */
export interface PropertyCompatibility {
	property: string
	status: 'compatible' | 'missing' | 'incompatible' | 'optional-missing'
	message?: string
}

/**
 * Check if a provides schema satisfies a consumes schema.
 *
 * The provides schema must contain all required fields from consumes
 * with compatible (assignable) types.
 *
 * @param providesSchema - The schema from the provider component
 * @param consumesSchema - The schema from the consumer component
 * @returns Detailed compatibility result
 */
export function checkSchemaCompatibility(
	providesSchema: TSchema,
	consumesSchema: TSchema
): CompatibilityResult {
	// Handle non-object schemas with direct type checking
	if (!TypeGuard.IsObject(providesSchema) || !TypeGuard.IsObject(consumesSchema)) {
		const result = ExtendsCheck(providesSchema, consumesSchema)
		return {
			compatible: result === ExtendsResult.True,
			details: [],
			summary:
				result === ExtendsResult.True
					? 'Schemas are compatible'
					: 'Schemas are not compatible (non-object comparison)'
		}
	}

	// Compare object schemas property by property
	return compareObjectSchemas(providesSchema, consumesSchema)
}

/**
 * Quick compatibility check - returns boolean only.
 * Use this for filtering, use checkSchemaCompatibility for detailed results.
 */
export function isSchemaCompatible(providesSchema: TSchema, consumesSchema: TSchema): boolean {
	return checkSchemaCompatibility(providesSchema, consumesSchema).compatible
}

/**
 * Compare two object schemas property by property.
 */
function compareObjectSchemas(
	providesSchema: TObject,
	consumesSchema: TObject
): CompatibilityResult {
	const details: PropertyCompatibility[] = []
	const consumesProps = consumesSchema.properties ?? {}
	const providesProps = providesSchema.properties ?? {}
	const requiredKeys = new Set(consumesSchema.required ?? [])

	for (const [key, consumesProp] of Object.entries(consumesProps)) {
		const providesProp = providesProps[key]
		const isRequired = requiredKeys.has(key) && !isOptionalSchema(consumesProp)

		if (!providesProp) {
			details.push({
				property: key,
				status: isRequired ? 'missing' : 'optional-missing',
				message: isRequired
					? `Required property "${key}" is missing from provides schema`
					: `Optional property "${key}" is not provided`
			})
			continue
		}

		const extendResult = ExtendsCheck(providesProp, consumesProp)
		if (extendResult === ExtendsResult.True) {
			details.push({ property: key, status: 'compatible' })
		} else {
			details.push({
				property: key,
				status: 'incompatible',
				message: `Type mismatch for "${key}"`
			})
		}
	}

	const hasBlockingIssue = details.some((d) => d.status === 'missing' || d.status === 'incompatible')

	const issues = details.filter((d) => d.status !== 'compatible' && d.status !== 'optional-missing')

	return {
		compatible: !hasBlockingIssue,
		details,
		summary: hasBlockingIssue
			? `Incompatible: ${issues.map((d) => d.message).join('; ')}`
			: 'Schemas are compatible'
	}
}

/**
 * Check if a schema represents an optional type.
 * TypeBox wraps optional types in TOptional which has a special modifier.
 */
function isOptionalSchema(schema: TSchema): boolean {
	// TypeBox optional schemas have [Optional] symbol or modifier
	return (
		TypeGuard.IsOptional(schema) ||
		(schema as Record<string, unknown>)[Symbol.for('TypeBox.Optional')] === 'Optional'
	)
}
