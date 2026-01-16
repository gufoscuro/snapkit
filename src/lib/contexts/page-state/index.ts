// Core page state
export { initPageState, getPageState, type PageState } from './page-state.svelte.js'

// Bindings system
export {
  resolveBindings,
  setSnippetBindings,
  getSnippetBindings,
  useProvides,
  useConsumes
} from './bindings.svelte.js'

// Types
export type {
  ComponentContract,
  BindingConfig,
  ResolvedBindings,
  StateHandle,
  InferContractProvides,
  InferContractConsumes
} from './types.js'
