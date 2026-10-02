import type { ComponentKey } from '$generated/components-registry'
import type { DashboardConfigData } from '$lib/stores/tenant-config/types'
import { CompletionContext, type CompletionResult } from '@codemirror/autocomplete'
import { json } from '@codemirror/lang-json'
import { EditorState } from '@codemirror/state'
import { describe, expect, it } from 'vitest'
import { buildOverridesEditorContext, createOverridesCompletionSource, lintOverrides, rangeAtPointer } from './editor'

const TD_DETAILS = 'transport-documents.transportdocumentdetails.default.TransportDocumentDetails'
const key = (k: string) => k as ComponentKey

const dashboard: DashboardConfigData = {
  pages: [
    {
      $id: 'transport-documents',
      title: 'DDT',
      route: '/transport-documents',
      layout: { componentKey: key('layouts.LeftSidebar'), enabled: true },
      snippets: {
        sidebar: { componentKey: key('a'), enabled: true },
        content: { componentKey: key('b'), enabled: true },
      },
      subpages: [
        {
          $id: 'transport-document-details',
          title: 'DDT',
          route: '/transport-documents/:uuid',
          layout: { componentKey: key('layouts.LeftSidebar'), enabled: true },
          snippets: { content: { componentKey: key(TD_DETAILS), enabled: true } },
        },
      ],
    },
  ],
  menus: { main: { id: 'main', name: 'Main', items: [] } },
}

const source = createOverridesCompletionSource(buildOverridesEditorContext(dashboard))

/** `|` marks the cursor. */
function complete(docWithCursor: string, explicit = true): CompletionResult | null {
  const pos = docWithCursor.indexOf('|')
  const doc = docWithCursor.replace('|', '')
  const state = EditorState.create({ doc, extensions: [json()] })
  return source(new CompletionContext(state, pos, explicit)) as CompletionResult | null
}

const labels = (result: CompletionResult | null) => result?.options.map(o => o.label) ?? []

const stateOf = (doc: string) => EditorState.create({ doc, extensions: [json()] })

describe('overrides completion', () => {
  it('offers whole-override templates in the root array', () => {
    expect(labels(complete('[|]'))).toEqual(['snippet', 'page.add'])
  })

  it('offers templates wrapped in an array for an empty document', () => {
    expect(labels(complete('|'))).toEqual(['snippet', 'page.add'])
  })

  it('offers the ops as values of "op"', () => {
    expect(labels(complete('[{ "op": "|" }]'))).toEqual(['snippet', 'page.add'])
    expect(complete('[{ "op": | }]')?.options.map(o => o.apply)).toEqual(['"snippet"', '"page.add"'])
  })

  it('offers the keys of a snippet override, minus the ones already present', () => {
    expect(labels(complete('[{ "op": "snippet", | }]'))).toEqual(['page', 'slot', 'set', 'reason'])
  })

  it('completes a key typed without its closing quote', () => {
    const result = complete('[{ "op": "snippet", "pa| }]')
    expect(labels(result)).toContain('page')
    expect(result?.options.find(o => o.label === 'page')?.apply).toBe('"page": ')
  })

  it('offers page $ids, nested ones included', () => {
    expect(labels(complete('[{ "op": "snippet", "page": "|" }]'))).toEqual([
      'transport-documents',
      'transport-document-details',
    ])
  })

  it('offers the slots of the chosen page', () => {
    expect(labels(complete('[{ "op": "snippet", "page": "transport-documents", "slot": "|" }]'))).toEqual([
      'sidebar',
      'content',
    ])
  })

  it('offers the keys of `set`', () => {
    expect(labels(complete('[{ "op": "snippet", "set": { | } }]'))).toEqual(['props', 'componentKey', 'enabled'])
  })

  it('offers registry component keys for componentKey', () => {
    expect(labels(complete('[{ "op": "snippet", "set": { "componentKey": "|" } }]'))).toContain(TD_DETAILS)
  })

  it('offers PageConfig keys inside an added page', () => {
    expect(labels(complete('[{ "op": "page.add", "page": { | } }]'))).toContain('route')
  })

  it('stays quiet on plain whitespace when not explicitly invoked', () => {
    expect(complete('[{ "op": "snippet",\n  "page": "x"  | }]', false)).toBeNull()
  })
})

describe('overrides diagnostics', () => {
  it('reports nothing for valid overrides or an empty document', () => {
    const valid = '[{ "op": "snippet", "page": "p", "slot": "content", "set": { "enabled": false } }]'
    expect(lintOverrides(stateOf(valid))).toEqual([])
    expect(lintOverrides(stateOf(''))).toEqual([])
  })

  it('reports a syntax error', () => {
    const diagnostics = lintOverrides(stateOf('[{ "op": }]'))
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toBe('Invalid JSON')
  })

  it('underlines a misspelled key', () => {
    const doc = '[{ "op": "snippet", "page": "p", "slot": "content", "set": { "prop": {} } }]'
    const diagnostics = lintOverrides(stateOf(doc))
    expect(diagnostics.map(d => doc.slice(d.from, d.to))).toContain('"prop": {}')
  })

  it('underlines an unknown component key', () => {
    const doc = '[{ "op": "snippet", "page": "p", "slot": "content", "set": { "componentKey": "nope" } }]'
    const diagnostics = lintOverrides(stateOf(doc))
    expect(diagnostics.map(d => doc.slice(d.from, d.to))).toEqual(['"componentKey": "nope"'])
  })

  it('points a missing key at the opening brace of its object', () => {
    const doc = '[{ "op": "snippet", "page": "p", "set": { "enabled": false } }]'
    expect(rangeAtPointer(stateOf(doc), '/0/slot')).toEqual({ from: 1, to: 2 })
  })
})
