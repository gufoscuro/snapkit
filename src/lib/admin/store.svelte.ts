import { browser } from '$app/environment'
import type { ComponentKey } from '$generated/components-registry'
import type {
  AdminBuilderState,
  AdminSelection,
  BuilderPageConfig,
  ExtendedSnippetDefinition,
  MenuConfig,
  TenantConfig,
  TreeNode,
  DEFAULT_ADMIN_STATE,
} from './types'

/** localStorage key for persisting selected tenant */
export const ADMIN_TENANT_STORAGE_KEY = 'admin-selected-tenant'

/**
 * Generate a unique ID for new entities
 */
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

/**
 * Admin Store - Svelte 5 class-based store with runes
 */
class AdminStore {
  // Reactive state using $state rune
  state = $state<AdminBuilderState>({
    pages: [],
    menus: [],
    tenants: [],
    selection: { type: null, id: null },
    isDirty: false,
  })

  // Selected tenant ID stored in state (synced with localStorage)
  private _selectedTenantId = $state<string | null>(null)

  // Derived values using $derived rune
  selectedPage = $derived(
    this.state.selection.type === 'page'
      ? this.state.pages.find((p) => p.$id === this.state.selection.id) ?? null
      : null
  )

  selectedMenu = $derived(
    this.state.selection.type === 'menu'
      ? this.state.menus.find((m) => m.id === this.state.selection.id) ?? null
      : null
  )

  // Tenant selection from state
  selectedTenantId = $derived(this._selectedTenantId)

  selectedTenant = $derived(
    this._selectedTenantId
      ? this.state.tenants.find((t) => t.id === this._selectedTenantId) ?? null
      : null
  )

  // Pages filtered by selected tenant
  currentTenantPages = $derived(
    this._selectedTenantId
      ? this.state.pages.filter((p) => p.tenantId === this._selectedTenantId)
      : []
  )

  // Menus filtered by selected tenant
  currentTenantMenus = $derived(
    this._selectedTenantId
      ? this.state.menus.filter((m) => m.tenantId === this._selectedTenantId)
      : []
  )

  navigationTree = $derived(this.buildNavigationTree())

  // ========== Tenant Selection ==========

  setSelectedTenantId(tenantId: string | null) {
    this._selectedTenantId = tenantId
    if (browser) {
      if (tenantId) {
        localStorage.setItem(ADMIN_TENANT_STORAGE_KEY, tenantId)
      } else {
        localStorage.removeItem(ADMIN_TENANT_STORAGE_KEY)
      }
    }
  }

  /**
   * Initialize tenant selection from localStorage
   * Called after tenants are loaded to validate the saved tenant exists
   */
  initializeTenantFromStorage() {
    if (!browser) return

    const savedTenantId = localStorage.getItem(ADMIN_TENANT_STORAGE_KEY)
    if (savedTenantId && this.state.tenants.some((t) => t.id === savedTenantId)) {
      this._selectedTenantId = savedTenantId
    } else if (this.state.tenants.length === 1) {
      // Auto-select if only one tenant
      this.setSelectedTenantId(this.state.tenants[0].id)
    } else {
      // Clear invalid saved tenant
      localStorage.removeItem(ADMIN_TENANT_STORAGE_KEY)
      this._selectedTenantId = null
    }
  }

  // ========== Selection Actions ==========

  select(selection: AdminSelection) {
    this.state.selection = selection
  }

  selectPage(id: string) {
    this.state.selection = { type: 'page', id }
  }

  selectMenu(id: string) {
    this.state.selection = { type: 'menu', id }
  }

  selectTenant(id: string) {
    this.state.selection = { type: 'tenant', id }
  }

  clearSelection() {
    this.state.selection = { type: null, id: null }
  }

  // ========== Page Actions ==========

  addPage(page?: Partial<BuilderPageConfig>): BuilderPageConfig {
    if (!this.selectedTenantId) {
      throw new Error('No tenant selected. Please select a tenant before creating a page.')
    }

    const newPage: BuilderPageConfig = {
      $id: page?.$id ?? generateId('page'),
      tenantId: this.selectedTenantId,
      title: page?.title ?? 'New Page',
      route: page?.route ?? '/new-page',
      layout: page?.layout ?? {
        componentKey: 'layouts.List' as ComponentKey,
        enabled: true,
      },
      snippets: page?.snippets ?? {},
      ...page,
    }
    this.state.pages.push(newPage)
    this.state.isDirty = true
    return newPage
  }

  updatePage(id: string, updates: Partial<BuilderPageConfig>) {
    const index = this.state.pages.findIndex((p) => p.$id === id)
    if (index !== -1) {
      this.state.pages[index] = { ...this.state.pages[index], ...updates }
      this.state.isDirty = true
    }
  }

  deletePage(id: string) {
    const index = this.state.pages.findIndex((p) => p.$id === id)
    if (index !== -1) {
      this.state.pages.splice(index, 1)
      if (this.state.selection.type === 'page' && this.state.selection.id === id) {
        this.clearSelection()
      }
      this.state.isDirty = true
    }
  }

  // ========== Snippet Actions ==========

  addSnippet(pageId: string, slotName: string, snippet: ExtendedSnippetDefinition) {
    const page = this.state.pages.find((p) => p.$id === pageId)
    if (page) {
      page.snippets[slotName] = snippet
      this.state.isDirty = true
    }
  }

  updateSnippet(
    pageId: string,
    slotName: string,
    updates: Partial<ExtendedSnippetDefinition>
  ) {
    const page = this.state.pages.find((p) => p.$id === pageId)
    if (page && page.snippets[slotName]) {
      page.snippets[slotName] = { ...page.snippets[slotName], ...updates }
      this.state.isDirty = true
    }
  }

  deleteSnippet(pageId: string, slotName: string) {
    const page = this.state.pages.find((p) => p.$id === pageId)
    if (page && page.snippets[slotName]) {
      delete page.snippets[slotName]
      this.state.isDirty = true
    }
  }

  reorderSnippets(pageId: string, newOrder: string[]) {
    const page = this.state.pages.find((p) => p.$id === pageId)
    if (page) {
      const reordered: Record<string, ExtendedSnippetDefinition> = {}
      for (const slotName of newOrder) {
        if (page.snippets[slotName]) {
          reordered[slotName] = page.snippets[slotName]
        }
      }
      page.snippets = reordered
      this.state.isDirty = true
    }
  }

  // ========== Menu Actions ==========

  addMenu(menu?: Partial<MenuConfig>): MenuConfig {
    if (!this.selectedTenantId) {
      throw new Error('No tenant selected. Please select a tenant before creating a menu.')
    }

    const newMenu: MenuConfig = {
      id: menu?.id ?? generateId('menu'),
      tenantId: menu?.tenantId ?? this.selectedTenantId,
      name: menu?.name ?? 'New Menu',
      items: menu?.items ?? [],
    }
    this.state.menus.push(newMenu)
    this.state.isDirty = true
    return newMenu
  }

  updateMenu(id: string, updates: Partial<MenuConfig>) {
    const index = this.state.menus.findIndex((m) => m.id === id)
    if (index !== -1) {
      this.state.menus[index] = { ...this.state.menus[index], ...updates }
      this.state.isDirty = true
    }
  }

  deleteMenu(id: string) {
    const index = this.state.menus.findIndex((m) => m.id === id)
    if (index !== -1) {
      this.state.menus.splice(index, 1)
      if (this.state.selection.type === 'menu' && this.state.selection.id === id) {
        this.clearSelection()
      }
      this.state.isDirty = true
    }
  }

  // ========== Tenant Actions ==========

  addTenant(tenant?: Partial<TenantConfig>): TenantConfig {
    const newTenant: TenantConfig = {
      id: tenant?.id ?? generateId('tenant'),
      vanity: tenant?.vanity ?? 'new-tenant',
      name: tenant?.name ?? 'New Tenant',
    }
    this.state.tenants.push(newTenant)
    this.state.isDirty = true
    return newTenant
  }

  updateTenant(id: string, updates: Partial<TenantConfig>) {
    const index = this.state.tenants.findIndex((t) => t.id === id)
    if (index !== -1) {
      this.state.tenants[index] = { ...this.state.tenants[index], ...updates }
      this.state.isDirty = true
    }
  }

  deleteTenant(id: string) {
    const index = this.state.tenants.findIndex((t) => t.id === id)
    if (index !== -1) {
      this.state.tenants.splice(index, 1)
      if (this.state.selection.type === 'tenant' && this.state.selection.id === id) {
        this.clearSelection()
      }

      // If deleting the currently selected tenant, clear URL param
      // Note: This requires window access, will be handled in the component layer
      this.state.isDirty = true
    }
  }

  // ========== Serialization ==========

  toJSON(): string {
    return JSON.stringify(
      {
        pages: this.state.pages,
        menus: this.state.menus,
        tenants: this.state.tenants,
      },
      null,
      2
    )
  }

  fromJSON(json: string) {
    try {
      const data = JSON.parse(json)
      this.state.pages = data.pages ?? []
      this.state.menus = data.menus ?? []
      this.state.tenants = data.tenants ?? []
      this.state.isDirty = false
      this.clearSelection()
    } catch (e) {
      console.error('Failed to parse admin config JSON:', e)
    }
  }

  loadState(state: Pick<AdminBuilderState, 'pages' | 'menus' | 'tenants'>) {
    this.state.pages = state.pages ?? []
    this.state.menus = state.menus ?? []
    this.state.tenants = state.tenants ?? []
    this.state.isDirty = false
    this.clearSelection()
  }

  markClean() {
    this.state.isDirty = false
  }

  // ========== Tree Building ==========

  private buildNavigationTree(): TreeNode[] {
    return [
      {
        id: 'pages',
        name: 'Pages',
        type: 'folder',
        children: this.state.pages.map((p) => ({
          id: p.$id,
          name: p.title,
          type: 'page' as const,
          data: p,
        })),
      },
      {
        id: 'menus',
        name: 'Menus',
        type: 'folder',
        children: this.state.menus.map((m) => ({
          id: m.id,
          name: m.name,
          type: 'menu' as const,
          data: m,
        })),
      },
      {
        id: 'tenants',
        name: 'Tenants',
        type: 'folder',
        children: this.state.tenants.map((t) => ({
          id: t.id,
          name: t.name,
          type: 'tenant' as const,
          data: t,
        })),
      },
    ]
  }
}

// Export singleton instance
export const adminStore = new AdminStore()

// Also export the class for testing
export { AdminStore }
