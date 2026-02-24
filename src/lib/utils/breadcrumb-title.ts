import { getPageState } from '$lib/contexts/page-state'

const KEY = '__breadcrumb_title'

/**
 * Call this during component initialisation (synchronously in <script>).
 * Returns set/clear functions safe to call anywhere, including async callbacks.
 */
export function useBreadcrumbTitle() {
  const pageState = getPageState()

  return {
    set(title: string): void {
      pageState.set(KEY, title)
    },
    clear(): void {
      pageState.set(KEY, undefined)
    },
  }
}
