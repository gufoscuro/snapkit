/**
 * Contract utilities for component state sharing.
 *
 * This module provides tools for:
 * - Schema compatibility checking between provides/consumes
 * - Contract registry for discovering component capabilities
 * - Page state analysis for understanding wiring
 * - Component matching for suggesting compatible components
 */

// Base schemas
export * from './base-schemas'

// Compatibility checking
export {
	checkSchemaCompatibility,
	isSchemaCompatible,
	type CompatibilityResult,
	type PropertyCompatibility
} from './compatibility'

// Contract registry
export {
	loadContractRegistry,
	getContract,
	getProviders,
	getConsumers,
	getAllContracts,
	getRegistryState,
	resetRegistry,
	type ContractEntry,
	type ContractRegistry
} from './registry'

// Page state analysis
export {
	analyzePageState,
	isPageValid,
	type PageStateAnalysis,
	type ProvidedNamespace,
	type UnsatisfiedConsume,
	type SatisfiedConsume
} from './page-analyzer'

// Component matching
export {
	findCompatibleComponents,
	validatePageBindings,
	getComponentCompatibility,
	type ComponentCompatibility,
	type CanSatisfyConsume,
	type ConsumesSatisfied,
	type ConsumesUnsatisfied,
	type FindCompatibleOptions,
	type BindingValidationResult,
	type BindingError,
	type BindingWarning
} from './matcher'
