import { describe, expect, it } from 'vitest'
import { parseOverrides } from './schema'

const TD_DETAILS = 'transport-documents.transportdocumentdetails.default.TransportDocumentDetails'

const snippetOverride = {
  op: 'snippet',
  page: 'transport-document-details',
  slot: 'content',
  set: { props: { importLineSelection: true } },
  reason: 'Selective DDT import',
}

const addPageOverride = {
  op: 'page.add',
  parent: 'transport-documents',
  page: {
    $id: 'td-report',
    title: 'Report',
    route: '/transport-documents/report',
    layout: { componentKey: 'layouts.LeftSidebar', enabled: true },
    snippets: { content: { componentKey: TD_DETAILS, enabled: true } },
  },
}

const parse = (value: unknown) => parseOverrides(JSON.stringify(value))

describe('parseOverrides', () => {
  it('accepts valid snippet and page.add overrides', () => {
    const result = parse([snippetOverride, addPageOverride])

    expect(result).toEqual({ ok: true, overrides: [snippetOverride, addPageOverride] })
  })

  it('accepts an empty list', () => {
    expect(parse([])).toEqual({ ok: true, overrides: [] })
  })

  it('reports malformed JSON', () => {
    const result = parseOverrides('[{ "op": ')

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors[0].message).toMatch(/^Invalid JSON/)
  })

  it('rejects a non-array root', () => {
    expect(parse(snippetOverride).ok).toBe(false)
  })

  it('rejects an unknown op, pointing at it', () => {
    const result = parse([{ ...snippetOverride, op: 'menu.hide' }])

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors[0].path).toBe('/0/op')
  })

  it('rejects misspelled keys instead of ignoring them, pointing at the field', () => {
    const misspelled = parse([{ ...snippetOverride, set: { prop: { importLineSelection: true } } }])
    expect(misspelled.ok).toBe(false)
    if (!misspelled.ok) expect(misspelled.errors.map(e => e.path)).toContain('/0/set/prop')

    expect(parse([{ ...snippetOverride, slots: 'content' }]).ok).toBe(false)
  })

  it('rejects a snippet override that sets nothing', () => {
    expect(parse([{ ...snippetOverride, set: {} }]).ok).toBe(false)
  })

  it('rejects component keys missing from the registry, including nested pages', () => {
    const result = parse([
      { ...snippetOverride, set: { componentKey: 'nope.Missing' } },
      {
        ...addPageOverride,
        page: {
          ...addPageOverride.page,
          subpages: [{ ...addPageOverride.page, $id: 'child', layout: { componentKey: 'nope.Layout', enabled: true } }],
        },
      },
    ])

    expect(result).toEqual({
      ok: false,
      errors: [
        { path: '/0/set/componentKey', message: 'Unknown componentKey "nope.Missing"' },
        { path: '/1/page/subpages/0/layout/componentKey', message: 'Unknown componentKey "nope.Layout"' },
      ],
    })
  })
})
