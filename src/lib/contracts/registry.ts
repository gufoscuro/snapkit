import {
	COMPONENT_REGISTRY,
	getAllComponentKeys,
	type ComponentKey
} from '$generated/components-registry'
import type { ComponentContract } from '$lib/contexts/page-state'

/**
 * Entry in the contract registry.
 */
export interface ContractEntry {
	componentKey: ComponentKey
	contract: ComponentContract
	description: string
}

/**
 * The contract registry with multiple indexes for fast lookup.
 */
export interface ContractRegistry {
	/** All loaded contracts indexed by component key */
	byComponentKey: Map<ComponentKey, ContractEntry>

	/** Components indexed by what they provide (namespace -> components) */
	byProvidesNamespace: Map<string, ContractEntry[]>

	/** Components indexed by what they consume (namespace -> components) */
	byConsumesNamespace: Map<string, ContractEntry[]>

	/** Loading status */
	loaded: boolean
	loading: boolean
	error: Error | null
}

// Module-level singleton
const registry: ContractRegistry = {
	byComponentKey: new Map(),
	byProvidesNamespace: new Map(),
	byConsumesNamespace: new Map(),
	loaded: false,
	loading: false,
	error: null
}

// Singleton promise for loading
let loadPromise: Promise<ContractRegistry> | null = null

/**
 * Load all contracts from the component registry.
 * This is idempotent - calling multiple times returns the same promise.
 */
export async function loadContractRegistry(): Promise<ContractRegistry> {
	if (registry.loaded) return registry
	if (loadPromise) return loadPromise

	registry.loading = true

	loadPromise = (async () => {
		const componentKeys = getAllComponentKeys()

		await Promise.all(
			componentKeys.map(async (key) => {
				try {
					const componentDef = COMPONENT_REGISTRY[key]
					const module = await componentDef.component()
					const contract = module.contract as ComponentContract | undefined

					if (!contract) return

					const entry: ContractEntry = {
						componentKey: key,
						contract,
						description: componentDef.description
					}

					// Index by component key
					registry.byComponentKey.set(key, entry)

					// Index by provides namespaces
					for (const namespace of Object.keys(contract.provides)) {
						const list = registry.byProvidesNamespace.get(namespace) ?? []
						list.push(entry)
						registry.byProvidesNamespace.set(namespace, list)
					}

					// Index by consumes namespaces
					for (const namespace of Object.keys(contract.consumes)) {
						const list = registry.byConsumesNamespace.get(namespace) ?? []
						list.push(entry)
						registry.byConsumesNamespace.set(namespace, list)
					}
				} catch (err) {
					console.warn(`Failed to load contract for ${key}:`, err)
				}
			})
		)

		registry.loaded = true
		registry.loading = false
		return registry
	})()

	return loadPromise
}

/**
 * Get the contract for a specific component (if loaded).
 */
export function getContract(componentKey: ComponentKey): ComponentContract | null {
	return registry.byComponentKey.get(componentKey)?.contract ?? null
}

/**
 * Get all components that provide a specific namespace.
 */
export function getProviders(namespace: string): ContractEntry[] {
	return registry.byProvidesNamespace.get(namespace) ?? []
}

/**
 * Get all components that consume a specific namespace.
 */
export function getConsumers(namespace: string): ContractEntry[] {
	return registry.byConsumesNamespace.get(namespace) ?? []
}

/**
 * Get all loaded contract entries.
 */
export function getAllContracts(): ContractEntry[] {
	return Array.from(registry.byComponentKey.values())
}

/**
 * Get the current registry state (may not be fully loaded).
 */
export function getRegistryState(): Readonly<ContractRegistry> {
	return registry
}

/**
 * Reset the registry (useful for testing).
 */
export function resetRegistry(): void {
	registry.byComponentKey.clear()
	registry.byProvidesNamespace.clear()
	registry.byConsumesNamespace.clear()
	registry.loaded = false
	registry.loading = false
	registry.error = null
	loadPromise = null
}
