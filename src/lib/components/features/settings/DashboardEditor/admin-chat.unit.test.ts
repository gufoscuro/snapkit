import { describe, expect, it } from 'vitest'
import { mockLegalEntityConfig } from './DashboardEditor.mock'
import { formatConfigSummary, formatLegalEntity, formatSelection } from './admin-chat'

describe('formatLegalEntity', () => {
  it('renders name and id together', () => {
    expect(formatLegalEntity({ id: 'le-1', name: 'Acme Industriale' })).toBe('Acme Industriale (id: le-1)')
  })

  it('degrades to whichever part is present', () => {
    expect(formatLegalEntity({ name: 'Acme Industriale' })).toBe('Acme Industriale')
    expect(formatLegalEntity({ id: 'le-1' })).toBe('(id: le-1)')
  })

  it('returns an empty string when there is no entity', () => {
    expect(formatLegalEntity(null)).toBe('')
    expect(formatLegalEntity(undefined)).toBe('')
  })
})

describe('formatConfigSummary', () => {
  const summary = formatConfigSummary(mockLegalEntityConfig)

  it('names each page with its id, title and route', () => {
    expect(summary).toContain('dashboard-home — "Dashboard" → /')
  })

  it('counts the top-level sections', () => {
    expect(summary).toContain('pages (1):')
    expect(summary).toContain('menus (1):')
    expect(summary).toContain('resources (2):')
  })

  it('describes resources by field and custom-field count', () => {
    expect(summary).toContain('customers — 3 field(s), 1 custom field(s)')
    expect(summary).toContain('suppliers — 2 field(s), 0 custom field(s)')
  })

  it('marks empty sections rather than omitting them, so the model sees the gap', () => {
    expect(summary).toContain('policies (0):')
    expect(summary).toContain('  (none)')
  })

  it('walks nested subpages, indenting them under their parent', () => {
    const nested = formatConfigSummary({
      ...mockLegalEntityConfig,
      dashboard: {
        ...mockLegalEntityConfig.dashboard,
        pages: [
          {
            ...mockLegalEntityConfig.dashboard.pages[0],
            subpages: [
              {
                $id: 'dashboard-detail',
                title: 'Detail',
                route: '/detail/:uuid',
                layout: { componentKey: 'layouts.LeftSidebar', enabled: true, props: {} },
                snippets: {},
              },
            ],
          },
        ],
      },
    })
    expect(nested).toContain('pages (2):')
    expect(nested).toContain('    dashboard-detail — "Detail" → /detail/:uuid')
  })

  it('reports an unset version explicitly instead of printing null', () => {
    expect(formatConfigSummary({ ...mockLegalEntityConfig, version: null })).toContain('version: (unset)')
  })
})

describe('formatSelection', () => {
  it('describes the raw view', () => {
    expect(formatSelection({ type: 'raw' })).toBe('the raw JSON view of the whole configuration')
  })

  it('describes a node by kind and path', () => {
    expect(formatSelection({ type: 'node', path: ['pages', 0] })).toBe('page at path: pages → 0')
    expect(formatSelection({ type: 'node', path: ['resources', 'customers', 'fields', 'email'] })).toBe(
      'resource-field at path: resources → customers → fields → email',
    )
  })

  it('falls back to unknown for a path with no kind', () => {
    expect(formatSelection({ type: 'node', path: ['nope'] })).toBe('unknown at path: nope')
  })

  it('reports an empty selection', () => {
    expect(formatSelection(null)).toBe('nothing selected')
  })
})
