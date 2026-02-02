import type { TSchema } from '@sinclair/typebox'
import type { ComponentKey } from '$generated/components-registry'
import type { ComponentContract } from '$lib/contexts/page-state'
import type { SnippetDefinition } from '$lib/utils/page-registry'
import { checkSchemaCompatibility, type CompatibilityResult } from './compatibility'
import { analyzePageState, type PageStateAnalysis } from './page-analyzer'
import { getAllContracts, getContract, loadContractRegistry, type ContractEntry } from './registry'

/**
 * Information about a consume that a component can satisfy.
 */
export interface CanSatisfyConsume {
	/** The namespace this component can provide */
	namespace: string
	/** The logical name in the provider's contract */
	logicalName: string
	/** Compatibility check result */
	compatibility: CompatibilityResult
}

/**
 * Information about a consume that is satisfied by existing providers.
 */
export interface ConsumesSatisfied {
	namespace: string
	logicalName: string
	providerKey: ComponentKey
	compatibility: CompatibilityResult
}

/**
 * Information about a consume that cannot be satisfied.
 */
export interface ConsumesUnsatisfied {
	namespace: string
	logicalName: string
	schema: TSchema
}

/**
 * Compatibility analysis for a single component against the page state.
 */
export interface ComponentCompatibility {
	componentKey: ComponentKey
	contract: ComponentContract
	description: string

	/** Consumes of the page that this component can satisfy (via its provides) */
	canSatisfyConsumes: CanSatisfyConsume[]

	/** This component's consumes that are satisfied by existing providers */
	consumesSatisfied: ConsumesSatisfied[]

	/** This component's consumes that have no provider in the page */
	consumesUnsatisfied: ConsumesUnsatisfied[]
}

/**
 * Options for finding compatible components.
 */
export interface FindCompatibleOptions {
	/** Component keys to exclude from results (e.g., already present in page) */
	excludeKeys?: ComponentKey[]
}

/**
 * Find all components that are compatible with the current page state.
 *
 * A component is "compatible" if at least one of:
 * - It can satisfy one or more unsatisfied consumes in the page
 * - All its consumes can be satisfied by existing providers
 *
 * @param pageAnalysis - The result of analyzePageState()
 * @param options - Filtering options
 * @returns Array of component compatibility info
 */
export async function findCompatibleComponents(
	pageAnalysis: PageStateAnalysis,
	options?: FindCompatibleOptions
): Promise<ComponentCompatibility[]> {
	await loadContractRegistry()

	const excludeSet = new Set(options?.excludeKeys ?? [])
	const allContracts = getAllContracts()

	const results: ComponentCompatibility[] = []

	for (const entry of allContracts) {
		// Skip excluded components
		if (excludeSet.has(entry.componentKey)) continue

		const compatibility = analyzeComponentCompatibility(entry, pageAnalysis)
		results.push(compatibility)
	}

	return results
}

/**
 * Analyze how a single component relates to the page state.
 */
function analyzeComponentCompatibility(
	entry: ContractEntry,
	pageAnalysis: PageStateAnalysis
): ComponentCompatibility {
	const { componentKey, contract, description } = entry
	const canSatisfyConsumes: CanSatisfyConsume[] = []
	const consumesSatisfied: ConsumesSatisfied[] = []
	const consumesUnsatisfied: ConsumesUnsatisfied[] = []

	// Check what this component's provides can satisfy
	for (const [logicalName, providesSchema] of Object.entries(contract.provides)) {
		// Check against unsatisfied consumes in the page
		for (const unsatisfied of pageAnalysis.unsatisfiedConsumes) {
			// For default bindings, the namespace matches the logical name
			// We check if this component's provides could satisfy the unsatisfied consume
			if (logicalName === unsatisfied.logicalName || logicalName === unsatisfied.namespace) {
				const compatibility = checkSchemaCompatibility(
					providesSchema as TSchema,
					unsatisfied.schema
				)

				if (compatibility.compatible) {
					canSatisfyConsumes.push({
						namespace: unsatisfied.namespace,
						logicalName,
						compatibility
					})
				}
			}
		}
	}

	// Check if this component's consumes can be satisfied
	for (const [logicalName, consumeSchema] of Object.entries(contract.consumes)) {
		// Look for a provider in the page (using default binding: namespace = logicalName)
		const provider = pageAnalysis.providedNamespaces.get(logicalName)

		if (provider) {
			const compatibility = checkSchemaCompatibility(provider.schema, consumeSchema as TSchema)

			consumesSatisfied.push({
				namespace: logicalName,
				logicalName,
				providerKey: provider.componentKey,
				compatibility
			})
		} else {
			consumesUnsatisfied.push({
				namespace: logicalName,
				logicalName,
				schema: consumeSchema as TSchema
			})
		}
	}

	return {
		componentKey,
		contract,
		description,
		canSatisfyConsumes,
		consumesSatisfied,
		consumesUnsatisfied
	}
}

/**
 * Result of page binding validation.
 */
export interface BindingValidationResult {
	valid: boolean
	errors: BindingError[]
	warnings: BindingWarning[]
}

/**
 * An error in the page bindings (blocks functionality).
 */
export interface BindingError {
	snippetId: string
	componentKey: ComponentKey
	namespace: string
	logicalName: string
	type: 'missing-provider' | 'incompatible-schema'
	message: string
	details?: CompatibilityResult
}

/**
 * A warning in the page bindings (doesn't block but may indicate issues).
 */
export interface BindingWarning {
	snippetId: string
	componentKey: ComponentKey
	message: string
}

/**
 * Validate all bindings in a page configuration.
 *
 * @param snippets - The snippets from a PageConfig
 * @returns Validation result with errors and warnings
 */
export async function validatePageBindings(
	snippets: Record<string, SnippetDefinition>
): Promise<BindingValidationResult> {
	const analysis = await analyzePageState(snippets)

	const errors: BindingError[] = []
	const warnings: BindingWarning[] = []

	// Report unsatisfied consumes as errors
	for (const unsatisfied of analysis.unsatisfiedConsumes) {
		errors.push({
			snippetId: unsatisfied.snippetId,
			componentKey: unsatisfied.componentKey,
			namespace: unsatisfied.namespace,
			logicalName: unsatisfied.logicalName,
			type: 'missing-provider',
			message: `No component provides "${unsatisfied.namespace}" for ${unsatisfied.componentKey}'s "${unsatisfied.logicalName}"`
		})
	}

	// Report incompatible schemas as errors
	for (const satisfied of analysis.satisfiedConsumes) {
		if (!satisfied.compatibility.compatible) {
			errors.push({
				snippetId: satisfied.consumerSnippetId,
				componentKey: satisfied.consumerKey,
				namespace: satisfied.namespace,
				logicalName: satisfied.namespace, // For satisfied, namespace is the resolved one
				type: 'incompatible-schema',
				message: satisfied.compatibility.summary,
				details: satisfied.compatibility
			})
		}
	}

	return {
		valid: errors.length === 0,
		errors,
		warnings
	}
}

/**
 * Get compatibility info for a specific component against a page.
 */
export async function getComponentCompatibility(
	componentKey: ComponentKey,
	snippets: Record<string, SnippetDefinition>
): Promise<ComponentCompatibility | null> {
	await loadContractRegistry()

	const contract = getContract(componentKey)
	if (!contract) return null

	const pageAnalysis = await analyzePageState(snippets)

	const entry: ContractEntry = {
		componentKey,
		contract,
		description: ''
	}

	return analyzeComponentCompatibility(entry, pageAnalysis)
}
