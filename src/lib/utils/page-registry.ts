import type { ComponentKey } from '$generated/components-registry'
import type { BindingConfig } from '$lib/contexts/page-state'
import { type TObject } from '@sinclair/typebox'

export interface PageConfig {
  /** Unique identifier for this page, used for route generation */
  $id: string
  /** Optional TypeBox schema defining the route parameters */
  $params?: TObject
  title: string
  route: string // Now supports patterns like /orders/:uuid or /orders/:uuid/delivery/:delivery_uuid
  layout: SnippetDefinition
  snippets: Record<string, SnippetDefinition>
  subpages?: PageConfig[]
}

export interface SnippetDefinition {
  componentKey: ComponentKey
  enabled: boolean
  /** Optional bindings to map logical names to namespaces. If not specified, defaults are used. */
  bindings?: BindingConfig
  props?: Record<string, unknown> // Static props to pass to the snippet component
}

export const PAGES: PageConfig[] = []

// Result type that includes matched parameters
export interface PageDetails {
  config: PageConfig
  params: Record<string, string>
}
