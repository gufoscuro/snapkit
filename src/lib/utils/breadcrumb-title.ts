import { getPageState, type PageState } from '$lib/contexts/page-state'

export const BREADCRUMB_LABELS_KEY = '__breadcrumb_labels'

export type BreadcrumbLabels = Record<string, string>

/** Set a breadcrumb label for a page by its $id. */
export function setBreadcrumbLabel(pageState: PageState, pageId: string, label: string): void {
  pageState.update<BreadcrumbLabels>(BREADCRUMB_LABELS_KEY, (prev) => ({
    ...(prev ?? {}),
    [pageId]: label,
  }))
}

/** Clear a breadcrumb label for a specific page. */
export function clearBreadcrumbLabel(pageState: PageState, pageId: string): void {
  pageState.update<BreadcrumbLabels>(BREADCRUMB_LABELS_KEY, (prev) => {
    if (!prev) return {}
    return Object.fromEntries(Object.entries(prev).filter(([key]) => key !== pageId))
  })
}

/** Read all breadcrumb labels from page state. */
export function getBreadcrumbLabels(pageState: PageState): BreadcrumbLabels {
  return pageState.get<BreadcrumbLabels>(BREADCRUMB_LABELS_KEY) ?? {}
}

/**
 * Convenience wrapper for use inside Svelte components.
 * Must be called synchronously during component initialisation (in <script>),
 * because it calls getContext internally.
 * The returned handles are safe to call anywhere, including async callbacks.
 */
export function useBreadcrumbTitle() {
  const pageState = getPageState()

  return {
    setLabel(pageId: string, label: string): void {
      setBreadcrumbLabel(pageState, pageId, label)
    },
    clearLabel(pageId: string): void {
      clearBreadcrumbLabel(pageState, pageId)
    },
  }
}
