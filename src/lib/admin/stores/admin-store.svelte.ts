import { browser } from '$app/environment'
import type { ComponentKey } from '$generated/components-registry'
import { tenantConfigStore } from '$lib/stores/tenant-config'
import {
  findPageById,
  getAllDescendants,
  getChildPages,
  nestedToFlat,
  validateNoCircularRefs,
  validateRouteUnique
} from '../page-hierarchy-utils'
import type {
  AdminBuilderState,
  AdminSelection,
  BuilderPageConfig,
  ExtendedSnippetDefinition,
  FlatBuilderPageConfig,
  MenuConfig,
  TenantConfig,
  TreeNode
} from '../types'

/** localStorage key for persisting selected tenant */
export const ADMIN_TENANT_STORAGE_KEY = 'admin-selected-tenant'

/**
 * Generate a unique ID for new entities
 */
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

/**
 * Admin Store - Svelte 5 function factory pattern with runes
 */
function createAdminStore() {
  // Reactive state using $state rune
  const state = $state<AdminBuilderState>({
    pages: [],
    menus: [],
    tenants: [],
    blocks: [],
    selection: { type: null, id: null },
    isDirty: false,
    sidebarContext: 'navigation',
    selectedTenantId: null,
  })

  // Derived values using $derived rune
  const selectedPage = $derived(
    state.selection.type === 'page'
      ? state.pages.find((p) => p.$id === state.selection.id) ?? null
      : null
  )

  const selectedMenu = $derived(
    state.selection.type === 'menu'
      ? state.menus.find((m) => m.id === state.selection.id) ?? null
      : null
  )

  const selectedTenant = $derived(
    state.selectedTenantId
      ? state.tenants.find((t) => t.id === state.selectedTenantId) ?? null
      : null
  )

  // Pages filtered by selected tenant
  const currentTenantPages = $derived(
    state.selectedTenantId
      ? state.pages.filter((p) => p.tenantId === state.selectedTenantId)
      : []
  )

  // Menus filtered by selected tenant
  const currentTenantMenus = $derived(
    state.selectedTenantId
      ? state.menus.filter((m) => m.tenantId === state.selectedTenantId)
      : []
  )

  // Selected block (blocks are global, not tenant-filtered)
  const selectedBlock = $derived(
    state.selection.type === 'block'
      ? state.blocks.find((b) => b.id === state.selection.id) ?? null
      : null
  )

  // ========== Tree Building ==========

  function buildNavigationTree(): TreeNode[] {
    // Helper to recursively build page nodes
    function buildPageNodes(pages: FlatBuilderPageConfig[]): TreeNode[] {
      return pages.map((p) => {
        const node: TreeNode = {
          id: p.$id,
          name: p.title,
          type: 'page' as const,
          data: p,
        }

        // Add children if page has subpages
        const children = getChildPages(p.$id, state.pages)
        if (children.length > 0) {
          node.children = buildPageNodes(children)
        }

        return node
      })
    }

    // Get only root level pages (no parentId)
    const rootPages = state.pages.filter((p) => !p.parentId)

    return [
      {
        id: 'pages',
        name: 'Pages',
        type: 'folder',
        children: buildPageNodes(rootPages),
      },
      {
        id: 'menus',
        name: 'Menus',
        type: 'folder',
        children: state.menus.map((m) => ({
          id: m.id,
          name: m.name,
          type: 'menu' as const,
          data: m,
        })),
      },
      {
        id: 'blocks',
        name: 'Blocks',
        type: 'folder',
        children: state.blocks.map((b) => ({
          id: b.id,
          name: b.name,
          type: 'block' as const,
          data: b,
        })),
      },
      {
        id: 'tenants',
        name: 'Tenants',
        type: 'folder',
        children: state.tenants.map((t) => ({
          id: t.id,
          name: t.name,
          type: 'tenant' as const,
          data: t,
        })),
      },
    ]
  }

  const navigationTree = $derived(buildNavigationTree())

  // ========== Tenant Selection ==========

  function setSelectedTenantId(tenantId: string | null) {
    state.selectedTenantId = tenantId
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
  function initializeTenantFromStorage() {
    if (!browser) return

    const savedTenantId = localStorage.getItem(ADMIN_TENANT_STORAGE_KEY)
    if (savedTenantId && state.tenants.some((t) => t.id === savedTenantId)) {
      state.selectedTenantId = savedTenantId
    } else if (state.tenants.length === 1) {
      // Auto-select if only one tenant
      setSelectedTenantId(state.tenants[0].id)
    } else {
      // Clear invalid saved tenant
      localStorage.removeItem(ADMIN_TENANT_STORAGE_KEY)
      state.selectedTenantId = null
    }
  }

  // ========== Selection Actions ==========

  function select(selection: AdminSelection) {
    state.selection = selection
  }

  function selectPage(id: string) {
    state.selection = { type: 'page', id }
  }

  function selectMenu(id: string) {
    state.selection = { type: 'menu', id }
  }

  function selectTenant(id: string) {
    state.selection = { type: 'tenant', id }
  }

  function selectBlock(id: string) {
    state.selection = { type: 'block', id }
  }

  function clearSelection() {
    state.selection = { type: null, id: null }
  }

  // ========== Sidebar Context ==========

  function setSidebarContext(context: 'navigation' | 'blocks' | 'pages') {
    state.sidebarContext = context
  }

  // ========== Page Actions ==========

  function addPage(page?: Partial<FlatBuilderPageConfig>): FlatBuilderPageConfig {
    if (!state.selectedTenantId) {
      throw new Error('No tenant selected. Please select a tenant before creating a page.')
    }

    const newPage: FlatBuilderPageConfig = {
      $id: page?.$id ?? generateId('page'),
      tenantId: state.selectedTenantId,
      title: page?.title ?? '',
      route: page?.route ?? '',
      layout: page?.layout ?? {
        componentKey: 'layouts.List' as ComponentKey,
        enabled: true,
      },
      snippets: page?.snippets ?? {},
      parentId: null, // Root level page by default
      ...page,
    }
    state.pages.push(newPage)
    state.isDirty = true
    return newPage
  }

  function addSubpage(parentId: string, subpage?: Partial<BuilderPageConfig>): FlatBuilderPageConfig {
    const parent = findPageById(parentId, state.pages)
    if (!parent) {
      throw new Error(`Parent page not found: ${parentId}`)
    }

    const newSubpage: FlatBuilderPageConfig = {
      $id: subpage?.$id ?? generateId('page'),
      tenantId: parent.tenantId, // Inherit from parent
      title: subpage?.title ?? '',
      route: subpage?.route ?? '',
      layout: subpage?.layout ?? {
        componentKey: 'layouts.List' as ComponentKey,
        enabled: true,
      },
      snippets: subpage?.snippets ?? {},
      parentId: parentId, // Set parent relationship
      ...subpage,
    }

    // Validate route uniqueness
    if (!validateRouteUnique(newSubpage.route, newSubpage.tenantId, null, state.pages)) {
      throw new Error(`Route ${newSubpage.route} already exists in this tenant`)
    }

    state.pages.push(newSubpage)
    state.isDirty = true
    return newSubpage
  }

  function updatePage(id: string, updates: Partial<FlatBuilderPageConfig>) {
    const index = state.pages.findIndex((p) => p.$id === id)
    if (index === -1) return

    // If changing parentId, validate no circular refs
    if (updates.parentId !== undefined) {
      if (!validateNoCircularRefs(id, updates.parentId, state.pages)) {
        throw new Error('Cannot move page: would create circular reference')
      }
    }

    // If changing route, validate uniqueness
    if (updates.route !== undefined) {
      const page = state.pages[index]
      if (!validateRouteUnique(updates.route, page.tenantId, id, state.pages)) {
        throw new Error(`Route ${updates.route} already exists in this tenant`)
      }
    }

    state.pages[index] = { ...state.pages[index], ...updates }
    state.isDirty = true
  }

  function deletePage(id: string, cascade: boolean = true) {
    const page = findPageById(id, state.pages)
    if (!page) return

    if (cascade) {
      // Get all descendants
      const descendants = getAllDescendants(id, state.pages)
      const idsToDelete = [id, ...descendants.map((d) => d.$id)]

      // Remove all at once
      state.pages = state.pages.filter((p) => !idsToDelete.includes(p.$id))

      // Clear selection if any deleted page was selected
      if (state.selection.type === 'page' && idsToDelete.includes(state.selection.id!)) {
        clearSelection()
      }
    } else {
      // Non-cascade: promote children to same level as deleted page
      const children = getChildPages(id, state.pages)
      children.forEach((child) => {
        child.parentId = page.parentId // Move to deleted page's parent
      })

      // Remove only the page
      const index = state.pages.findIndex((p) => p.$id === id)
      state.pages.splice(index, 1)

      if (state.selection.type === 'page' && state.selection.id === id) {
        clearSelection()
      }
    }

    state.isDirty = true
  }

  // ========== Snippet Actions ==========

  function addSnippet(pageId: string, slotName: string, snippet: ExtendedSnippetDefinition) {
    const page = state.pages.find((p) => p.$id === pageId)
    if (page) {
      page.snippets[slotName] = snippet
      state.isDirty = true
    }
  }

  function updateSnippet(
    pageId: string,
    slotName: string,
    updates: Partial<ExtendedSnippetDefinition>
  ) {
    const page = state.pages.find((p) => p.$id === pageId)
    if (page && page.snippets[slotName]) {
      page.snippets[slotName] = { ...page.snippets[slotName], ...updates }
      state.isDirty = true
    }
  }

  function deleteSnippet(pageId: string, slotName: string) {
    const page = state.pages.find((p) => p.$id === pageId)
    if (page && page.snippets[slotName]) {
      delete page.snippets[slotName]
      state.isDirty = true
    }
  }

  function reorderSnippets(pageId: string, newOrder: string[]) {
    const page = state.pages.find((p) => p.$id === pageId)
    if (page) {
      const reordered: Record<string, ExtendedSnippetDefinition> = {}
      for (const slotName of newOrder) {
        if (page.snippets[slotName]) {
          reordered[slotName] = page.snippets[slotName]
        }
      }
      page.snippets = reordered
      state.isDirty = true
    }
  }

  // ========== Menu Actions ==========

  function addMenu(menu?: Partial<MenuConfig>): MenuConfig {
    if (!state.selectedTenantId) {
      throw new Error('No tenant selected. Please select a tenant before creating a menu.')
    }

    const newMenu: MenuConfig = {
      id: menu?.id ?? generateId('menu'),
      tenantId: menu?.tenantId ?? state.selectedTenantId,
      name: menu?.name ?? 'New Menu',
      items: menu?.items ?? [],
    }
    state.menus.push(newMenu)
    state.isDirty = true
    return newMenu
  }

  function updateMenu(id: string, updates: Partial<MenuConfig>) {
    const index = state.menus.findIndex((m) => m.id === id)
    if (index !== -1) {
      state.menus[index] = { ...state.menus[index], ...updates }
      state.isDirty = true
    }
  }

  function deleteMenu(id: string) {
    const index = state.menus.findIndex((m) => m.id === id)
    if (index !== -1) {
      state.menus.splice(index, 1)
      if (state.selection.type === 'menu' && state.selection.id === id) {
        clearSelection()
      }
      state.isDirty = true
    }
  }

  // ========== Tenant Actions ==========

  /**
   * Create a new tenant config object without adding it to the store.
   * Use this for the "new tenant" form - tenant is only added when user saves.
   */
  function createTenantConfig(tenant?: Partial<TenantConfig>): TenantConfig {
    return {
      id: tenant?.id ?? generateId('tenant'),
      vanity: tenant?.vanity ?? 'new-tenant',
      name: tenant?.name ?? 'New Tenant',
    }
  }

  /**
   * Add a tenant to the store (used when saving a new tenant)
   */
  function addTenant(tenant: TenantConfig): TenantConfig {
    state.tenants.push(tenant)
    state.isDirty = true
    return tenant
  }

  function updateTenant(id: string, updates: Partial<TenantConfig>) {
    const index = state.tenants.findIndex((t) => t.id === id)
    if (index !== -1) {
      state.tenants[index] = { ...state.tenants[index], ...updates }
      state.isDirty = true
    }
  }

  function deleteTenant(id: string) {
    const index = state.tenants.findIndex((t) => t.id === id)
    if (index !== -1) {
      state.tenants.splice(index, 1)
      if (state.selection.type === 'tenant' && state.selection.id === id) {
        clearSelection()
      }

      // If deleting the currently selected tenant, clear URL param
      // Note: This requires window access, will be handled in the component layer
      state.isDirty = true
    }
  }

  // ========== Serialization ==========

  function toJSON(): string {
    return JSON.stringify(
      {
        pages: state.pages,
        menus: state.menus,
        tenants: state.tenants,
        blocks: state.blocks,
      },
      null,
      2
    )
  }

  function fromJSON(json: string) {
    try {
      const data = JSON.parse(json)
      state.pages = data.pages ?? []
      state.menus = data.menus ?? []
      state.tenants = data.tenants ?? []
      state.blocks = data.blocks ?? []
      state.isDirty = false
      clearSelection()
    } catch (e) {
      console.error('Failed to parse admin config JSON:', e)
    }
  }

  function loadState(newState: Pick<AdminBuilderState, 'pages' | 'menus' | 'tenants' | 'blocks'>) {
    // Convert nested pages to flat with parentId tracking
    state.pages = nestedToFlat(newState.pages ?? [])
    state.menus = newState.menus ?? []
    state.tenants = newState.tenants ?? []
    state.blocks = newState.blocks ?? []
    state.isDirty = false
    clearSelection()
  }

  function markClean() {
    state.isDirty = false
  }

  /**
   * Call this after exporting/publishing config changes
   * Invalidates the tenant config cache so end-users see the latest config
   */
  function onConfigPublished() {
    tenantConfigStore.invalidate()
  }

  // Return the store interface
  return {
    state,

    // Expose derived values as getters
    get selectedPage() { return selectedPage },
    get selectedMenu() { return selectedMenu },
    get selectedTenant() { return selectedTenant },
    get currentTenantPages() { return currentTenantPages },
    get currentTenantMenus() { return currentTenantMenus },
    get selectedBlock() { return selectedBlock },
    get navigationTree() { return navigationTree },

    // Expose methods
    setSelectedTenantId,
    initializeTenantFromStorage,
    select,
    selectPage,
    selectMenu,
    selectTenant,
    selectBlock,
    clearSelection,
    setSidebarContext,
    addPage,
    addSubpage,
    updatePage,
    deletePage,
    addSnippet,
    updateSnippet,
    deleteSnippet,
    reorderSnippets,
    addMenu,
    updateMenu,
    deleteMenu,
    createTenantConfig,
    addTenant,
    updateTenant,
    deleteTenant,
    toJSON,
    fromJSON,
    loadState,
    markClean,
    onConfigPublished,
  }
}

// Export singleton instance
export const adminStore = createAdminStore()
