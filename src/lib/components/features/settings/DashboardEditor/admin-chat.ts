import type { LegalEntityConfigResponse } from '$lib/stores/tenant-config/types'
import type { PageConfig } from '$lib/utils/page-registry'
import { getKind } from '$lib/utils/config-tree'
import type { Selection } from './types'

/**
 * Ambient context handed to the `admin-assistant` prompt on every send.
 *
 * These are summaries, not dumps: a legal entity config runs to tens of
 * kilobytes of JSON, and re-sending all of it each round would crowd out the
 * conversation itself. The model gets the shape — ids, routes, counts — and the
 * operator can point it at any node via the raw JSON view.
 */

export function formatLegalEntity(legalEntity: { id?: string; name?: string } | null | undefined): string {
  if (!legalEntity) return ''
  const parts: string[] = []
  if (legalEntity.name) parts.push(legalEntity.name)
  if (legalEntity.id) parts.push(`(id: ${legalEntity.id})`)
  return parts.join(' ')
}

export function formatConfigSummary(config: LegalEntityConfigResponse): string {
  const lines: string[] = []

  lines.push(`version: ${config.version ?? '(unset)'}`)

  const pages: string[] = []
  collectPages(config.dashboard.pages, pages, 0)
  lines.push('', `pages (${pages.length}):`, ...(pages.length > 0 ? pages : ['  (none)']))

  const menuEntries = Object.entries(config.dashboard.menus)
  lines.push('', `menus (${menuEntries.length}):`)
  if (menuEntries.length === 0) lines.push('  (none)')
  for (const [key, menu] of menuEntries) {
    lines.push(`  ${key} — "${menu.name}", ${menu.items?.length ?? 0} item(s)`)
  }

  const resourceEntries = Object.entries(config.resources ?? {})
  lines.push('', `resources (${resourceEntries.length}):`)
  if (resourceEntries.length === 0) lines.push('  (none)')
  for (const [key, resource] of resourceEntries) {
    const fieldCount = Object.keys(resource.fields ?? {}).length
    const customCount = resource.custom_fields?.length ?? 0
    lines.push(`  ${key} — ${fieldCount} field(s), ${customCount} custom field(s)`)
  }

  const policyEntries = Object.entries(config.policies ?? {})
  lines.push('', `policies (${policyEntries.length}):`)
  if (policyEntries.length === 0) lines.push('  (none)')
  for (const [key, value] of policyEntries) {
    lines.push(`  ${key} = ${JSON.stringify(value)}`)
  }

  return lines.join('\n')
}

function collectPages(pages: PageConfig[] | undefined, out: string[], depth: number) {
  if (!pages) return
  for (const page of pages) {
    out.push(`${'  '.repeat(depth + 1)}${page.$id} — "${page.title}" → ${page.route}`)
    if (page.subpages?.length) collectPages(page.subpages, out, depth + 1)
  }
}

/**
 * What the operator is currently looking at. Tells the model which node a bare
 * "questo campo" / "questa pagina" refers to.
 */
export function formatSelection(selection: Selection | null): string {
  if (!selection) return 'nothing selected'
  if (selection.type === 'raw') return 'the raw JSON view of the whole configuration'
  const kind = getKind(selection.path)
  return `${kind ?? 'unknown'} at path: ${selection.path.join(' → ')}`
}
