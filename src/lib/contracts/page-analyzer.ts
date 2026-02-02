import type { TSchema } from '@sinclair/typebox'
import type { ComponentKey } from '$generated/components-registry'
import type { SnippetDefinition } from '$lib/utils/page-registry'
import { checkSchemaCompatibility, type CompatibilityResult } from './compatibility'
import { getContract, loadContractRegistry } from './registry'

/**
 * Information about a namespace that is provided by a component.
 */
export interface ProvidedNamespace {
	schema: TSchema
	componentKey: ComponentKey
	snippetId: string
	/** The logical name in the contract (may differ from namespace if bindings are used) */
	logicalName: string
}

/**
 * Information about a consume that is not satisfied.
 */
export interface UnsatisfiedConsume {
	namespace: string
	schema: TSchema
	componentKey: ComponentKey
	snippetId: string
	logicalName: string
}

/**
 * Information about a consume that is satisfied by a provider.
 */
export interface SatisfiedConsume {
	namespace: string
	consumerKey: ComponentKey
	consumerSnippetId: string
	providerKey: ComponentKey
	providerSnippetId: string
	compatibility: CompatibilityResult
}

/**
 * Analysis of a page's state sharing configuration.
 */
export interface PageStateAnalysis {
	/** Namespace forniti con i loro schemi */
	providedNamespaces: Map<string, ProvidedNamespace>

	/** Namespace consumati che NON hanno un provider */
	unsatisfiedConsumes: UnsatisfiedConsume[]

	/** Namespace consumati che HANNO un provider (con info compatibilità) */
	satisfiedConsumes: SatisfiedConsume[]
}

/**
 * Analyze a page configuration to understand its state sharing setup.
 *
 * @param snippets - The snippets configuration from a PageConfig
 * @returns Analysis of provides/consumes relationships
 */
export async function analyzePageState(
	snippets: Record<string, SnippetDefinition>
): Promise<PageStateAnalysis> {
	await loadContractRegistry()

	const providedNamespaces = new Map<string, ProvidedNamespace>()
	const unsatisfiedConsumes: UnsatisfiedConsume[] = []
	const satisfiedConsumes: SatisfiedConsume[] = []

	// First pass: collect all provides
	for (const [snippetId, snippet] of Object.entries(snippets)) {
		if (!snippet.enabled) continue

		const contract = getContract(snippet.componentKey)
		if (!contract) continue

		for (const [logicalName, schema] of Object.entries(contract.provides)) {
			// Resolve the namespace (use binding if specified, otherwise logical name)
			const namespace = snippet.bindings?.provides?.[logicalName] ?? logicalName

			providedNamespaces.set(namespace, {
				schema: schema as TSchema,
				componentKey: snippet.componentKey,
				snippetId,
				logicalName
			})
		}
	}

	// Second pass: check all consumes
	for (const [snippetId, snippet] of Object.entries(snippets)) {
		if (!snippet.enabled) continue

		const contract = getContract(snippet.componentKey)
		if (!contract) continue

		for (const [logicalName, consumeSchema] of Object.entries(contract.consumes)) {
			// Resolve the namespace (use binding if specified, otherwise logical name)
			const namespace = snippet.bindings?.consumes?.[logicalName] ?? logicalName

			const provider = providedNamespaces.get(namespace)

			if (!provider) {
				// No provider for this namespace
				unsatisfiedConsumes.push({
					namespace,
					schema: consumeSchema as TSchema,
					componentKey: snippet.componentKey,
					snippetId,
					logicalName
				})
			} else {
				// Check compatibility
				const compatibility = checkSchemaCompatibility(
					provider.schema,
					consumeSchema as TSchema
				)

				satisfiedConsumes.push({
					namespace,
					consumerKey: snippet.componentKey,
					consumerSnippetId: snippetId,
					providerKey: provider.componentKey,
					providerSnippetId: provider.snippetId,
					compatibility
				})
			}
		}
	}

	return {
		providedNamespaces,
		unsatisfiedConsumes,
		satisfiedConsumes
	}
}

/**
 * Quick validation to check if all consumes are satisfied.
 */
export async function isPageValid(snippets: Record<string, SnippetDefinition>): Promise<boolean> {
	const analysis = await analyzePageState(snippets)

	// Page is valid if:
	// 1. No unsatisfied consumes
	// 2. All satisfied consumes are compatible
	return (
		analysis.unsatisfiedConsumes.length === 0 &&
		analysis.satisfiedConsumes.every((s) => s.compatibility.compatible)
	)
}
