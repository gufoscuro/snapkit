import type { ComponentKey } from '$generated/components-registry'
import type { DashboardConfigData } from '$lib/stores/tenant-config/types'
import type { PageConfig } from '$lib/utils/page-registry'
import { describe, expect, it } from 'vitest'
import { applyOverrides } from './apply'
import type { DashboardOverride } from './types'

const key = (k: string) => k as ComponentKey

function page(id: string, extra: Partial<PageConfig> = {}): PageConfig {
  return {
    $id: id,
    title: id,
    route: `/${id}`,
    layout: { componentKey: key('layouts.LeftSidebar'), enabled: true },
    snippets: { content: { componentKey: key(`${id}.Content`), enabled: true } },
    ...extra,
  }
}

function dashboard(): DashboardConfigData {
  return {
    pages: [
      page('home'),
      page('transport-documents', {
        subpages: [
          page('transport-document-details', {
            snippets: {
              content: { componentKey: key('td.Details'), enabled: true, props: { highlight: true } },
            },
          }),
        ],
      }),
    ],
    menus: { main: { id: 'main', name: 'Main', items: [] } },
  }
}

describe('applyOverrides', () => {
  it('returns an equal dashboard when there are no overrides', () => {
    const base = dashboard()

    const { dashboard: result, unresolved } = applyOverrides(base, [])

    expect(result).toEqual(base)
    expect(unresolved).toEqual([])
  })

  it('merges snippet props on a nested page without dropping scaffold props', () => {
    const { dashboard: result } = applyOverrides(dashboard(), [
      {
        op: 'snippet',
        page: 'transport-document-details',
        slot: 'content',
        set: { props: { importLineSelection: true } },
      },
    ])

    expect(result.pages[1].subpages?.[0].snippets.content.props).toEqual({
      highlight: true,
      importLineSelection: true,
    })
  })

  it('replaces componentKey and enabled', () => {
    const { dashboard: result } = applyOverrides(dashboard(), [
      { op: 'snippet', page: 'home', slot: 'content', set: { componentKey: key('home.Variant'), enabled: false } },
    ])

    expect(result.pages[0].snippets.content).toEqual({ componentKey: 'home.Variant', enabled: false })
  })

  it('never mutates the input dashboard', () => {
    const base = dashboard()
    const snapshot = structuredClone(base)

    applyOverrides(base, [
      { op: 'snippet', page: 'home', slot: 'content', set: { props: { a: 1 } } },
      { op: 'page.add', page: page('extra') },
    ])

    expect(base).toEqual(snapshot)
  })

  it('adds a top-level page and a subpage', () => {
    const { dashboard: result, unresolved } = applyOverrides(dashboard(), [
      { op: 'page.add', page: page('extra') },
      { op: 'page.add', parent: 'transport-documents', page: page('td-report') },
    ])

    expect(unresolved).toEqual([])
    expect(result.pages.map(p => p.$id)).toEqual(['home', 'transport-documents', 'extra'])
    expect(result.pages[1].subpages?.map(p => p.$id)).toEqual(['transport-document-details', 'td-report'])
  })

  it('lets a later override target a page added by an earlier one', () => {
    const { dashboard: result, unresolved } = applyOverrides(dashboard(), [
      { op: 'page.add', page: page('extra') },
      { op: 'snippet', page: 'extra', slot: 'content', set: { props: { compact: true } } },
    ])

    expect(unresolved).toEqual([])
    expect(result.pages[2].snippets.content.props).toEqual({ compact: true })
  })

  it('reports overrides whose target is missing, and keeps applying the rest', () => {
    const missingPage: DashboardOverride = { op: 'snippet', page: 'gone', slot: 'content', set: { enabled: false } }
    const missingSlot: DashboardOverride = { op: 'snippet', page: 'home', slot: 'sidebar', set: { enabled: false } }
    const missingParent: DashboardOverride = { op: 'page.add', parent: 'gone', page: page('orphan') }
    const duplicate: DashboardOverride = { op: 'page.add', page: page('home') }
    const valid: DashboardOverride = { op: 'snippet', page: 'home', slot: 'content', set: { props: { ok: true } } }

    const { dashboard: result, unresolved } = applyOverrides(dashboard(), [
      missingPage,
      missingSlot,
      missingParent,
      duplicate,
      valid,
    ])

    expect(unresolved).toEqual([
      { override: missingPage, reason: 'page-not-found' },
      { override: missingSlot, reason: 'slot-not-found' },
      { override: missingParent, reason: 'page-not-found' },
      { override: duplicate, reason: 'page-exists' },
    ])
    expect(result.pages[0].snippets.content.props).toEqual({ ok: true })
    expect(result.pages).toHaveLength(2)
  })
})
