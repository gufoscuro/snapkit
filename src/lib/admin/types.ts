import type { ComponentKey } from '$generated/components-registry'
import type { BindingConfig } from '$lib/contexts/page-state'
import type { NavItem } from '$lib/utils/customer-registry'
import type { TObject } from '@sinclair/typebox'

/**
 * Extended snippet definition with props support for the builder
 */
export interface ExtendedSnippetDefinition {
  componentKey: ComponentKey
  enabled: boolean
  bindings?: BindingConfig
  props?: Record<string, unknown>
}

/**
 * Page configuration for the builder
 */
export interface BuilderPageConfig {
  $id: string
  $params?: TObject
  tenantId: string // Foreign key to tenant
  title: string
  route: string
  layout: ExtendedSnippetDefinition
  snippets: Record<string, ExtendedSnippetDefinition>
  subpages?: BuilderPageConfig[]
}

/**
 * Menu configuration
 */
export interface MenuConfig {
  id: string
  tenantId: string // Foreign key to tenant
  name: string
  items: NavItem[]
}

/**
 * Tenant configuration
 */
export interface TenantConfig {
  id: string
  vanity: string
  name: string
}

/**
 * Block configuration
 */
export interface BlockConfig {
	id: string
	name: string
	description?: string
	folder?: string
	snippet: ExtendedSnippetDefinition
	previewProps?: Record<string, unknown>
	tags?: string[]
	createdAt: string
	updatedAt: string
}

/**
 * Tree node types for navigation
 */
export type TreeNodeType = 'folder' | 'page' | 'menu' | 'tenant' | 'block' | 'snippet'

/**
 * Tree node for admin navigation
 */
export interface TreeNode {
  id: string
  name: string
  type: TreeNodeType
  children?: TreeNode[]
  data?: BuilderPageConfig | MenuConfig | TenantConfig | BlockConfig | ExtendedSnippetDefinition
}

/**
 * Selection state for the admin panel
 */
export interface AdminSelection {
  type: 'page' | 'menu' | 'tenant' | 'block' | null
  id: string | null
}

/**
 * Complete admin builder state
 */
export interface AdminBuilderState {
  pages: BuilderPageConfig[]
  menus: MenuConfig[]
  tenants: TenantConfig[]
  blocks: BlockConfig[]
  selection: AdminSelection
  isDirty: boolean
  sidebarContext: 'navigation' | 'blocks'
}

/**
 * Default empty state
 */
export const DEFAULT_ADMIN_STATE: AdminBuilderState = {
  pages: [],
  menus: [],
  tenants: [],
  blocks: [],
  selection: { type: null, id: null },
  isDirty: false,
  sidebarContext: 'navigation',
}

/**
 * Layout slot definition - declares what slots a layout expects
 */
export interface LayoutSlotDefinition {
  name: string
  label: string
  description: string
}
