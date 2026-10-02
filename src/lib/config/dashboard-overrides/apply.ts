import type { DashboardConfigData } from '$lib/stores/tenant-config/types'
import type { PageConfig } from '$lib/utils/page-registry'
import { type DashboardOverride, UnresolvedReason, type UnresolvedOverride } from './types'

export type ApplyOverridesResult = {
  dashboard: DashboardConfigData
  /** Overrides that could not be applied, in declaration order — never dropped silently */
  unresolved: UnresolvedOverride[]
}

function findPage(pages: PageConfig[], id: string): PageConfig | undefined {
  for (const page of pages) {
    if (page.$id === id) return page
    const nested = page.subpages ? findPage(page.subpages, id) : undefined
    if (nested) return nested
  }
  return undefined
}

/**
 * Applies tenant overrides on top of a dashboard (normally the fresh scaffold).
 *
 * Pure: the input is cloned, never mutated. Overrides apply in order, so a later
 * override can target a page added by an earlier `page.add`. An override whose
 * target is missing is reported in `unresolved` and skipped — the push must surface
 * it, because it means the scaffold changed under a tenant customization.
 */
export function applyOverrides(
  dashboard: DashboardConfigData,
  overrides: readonly DashboardOverride[],
): ApplyOverridesResult {
  const result = structuredClone(dashboard)
  const unresolved: UnresolvedOverride[] = []

  for (const override of overrides) {
    switch (override.op) {
      case 'snippet': {
        const page = findPage(result.pages, override.page)
        if (!page) {
          unresolved.push({ override, reason: UnresolvedReason.PageNotFound })
          break
        }
        const snippet = page.snippets?.[override.slot]
        if (!snippet) {
          unresolved.push({ override, reason: UnresolvedReason.SlotNotFound })
          break
        }
        const { props, ...rest } = override.set
        Object.assign(snippet, rest)
        if (props) snippet.props = { ...snippet.props, ...props }
        break
      }

      case 'page.add': {
        if (findPage(result.pages, override.page.$id)) {
          unresolved.push({ override, reason: UnresolvedReason.PageExists })
          break
        }
        const page = structuredClone(override.page)
        if (!override.parent) {
          result.pages.push(page)
          break
        }
        const parent = findPage(result.pages, override.parent)
        if (!parent) {
          unresolved.push({ override, reason: UnresolvedReason.PageNotFound })
          break
        }
        parent.subpages = [...(parent.subpages ?? []), page]
        break
      }
    }
  }

  return { dashboard: result, unresolved }
}
