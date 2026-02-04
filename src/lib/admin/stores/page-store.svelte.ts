import type { ComponentKey } from '$generated/components-registry'
import type { ExtendedSnippetDefinition } from '$lib/admin/types'
import { analyzePageState, findCompatibleComponents, type ComponentCompatibility } from '$lib/contracts'

/**
 * Page Store - Svelte 5 function factory pattern with runes
 *
 * Manages the current page's context and compatibility analysis.
 * Pre-computes compatibility information that can be used by ComponentPicker,
 * SnippetSlotEditor, and other admin components.
 */
function createPageStore() {
  // Reactive state using $state rune
  let pageId = $state<string | null>(null)
  let snippets = $state<Record<string, ExtendedSnippetDefinition>>({})
  let compatibilityMap = $state<Map<ComponentKey, ComponentCompatibility>>(new Map())
  let isAnalyzing = $state(false)

  /**
   * Initialize the page context with page data and trigger analysis
   */
  function setPage(id: string, pageSnippets: Record<string, ExtendedSnippetDefinition>) {
    pageId = id
    snippets = pageSnippets
    analyze()
  }

  /**
   * Update snippets and re-analyze
   */
  function updateSnippets(pageSnippets: Record<string, ExtendedSnippetDefinition>) {
    snippets = pageSnippets
    analyze()
  }

  /**
   * Analyze the current page state and compute compatibility information
   */
  async function analyze() {
    if (!snippets || Object.keys(snippets).length === 0) {
      compatibilityMap = new Map()
      return
    }

    isAnalyzing = true
    try {
      const analysis = await analyzePageState(snippets)
      const compatible = await findCompatibleComponents(analysis)
      compatibilityMap = new Map(compatible.map(c => [c.componentKey, c]))
    } catch (error) {
      console.error('Failed to analyze page state:', error)
      compatibilityMap = new Map()
    } finally {
      isAnalyzing = false
    }
  }

  /**
   * Clear the page context
   */
  function clear() {
    pageId = null
    snippets = {}
    compatibilityMap = new Map()
    isAnalyzing = false
  }

  /**
   * Get compatibility information for a specific component
   */
  function getCompatibility(componentKey: ComponentKey): ComponentCompatibility | undefined {
    return compatibilityMap.get(componentKey)
  }

  // Return the store interface
  return {
    // Expose state as getters
    get pageId() { return pageId },
    get snippets() { return snippets },
    get compatibilityMap() { return compatibilityMap },
    get isAnalyzing() { return isAnalyzing },

    // Expose methods
    setPage,
    updateSnippets,
    analyze,
    clear,
    getCompatibility,
  }
}

// Export singleton instance
export const pageStore = createPageStore()
