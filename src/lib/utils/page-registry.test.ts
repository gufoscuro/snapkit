import { describe, it, expect } from 'vitest'
import { PAGES } from './page-registry'
import type { PageConfig, PageDetails, SnippetDefinition } from './page-registry'

describe('page-registry', () => {
  it('exports PAGES as an array', () => {
    expect(Array.isArray(PAGES)).toBe(true)
  })

  it('PageConfig type is usable', () => {
    const config: PageConfig = {
      $id: 'test',
      title: 'Test',
      route: '/test',
      layout: { componentKey: 'TestLayout' as never, enabled: true },
      snippets: {},
    }
    expect(config.$id).toBe('test')
  })

  it('PageDetails type includes params', () => {
    const details: PageDetails = {
      config: {
        $id: 'test',
        title: 'Test',
        route: '/test/:id',
        layout: { componentKey: 'TestLayout' as never, enabled: true },
        snippets: {},
      },
      params: { id: '123' },
    }
    expect(details.params.id).toBe('123')
  })

  it('SnippetDefinition supports optional bindings and props', () => {
    const snippet: SnippetDefinition = {
      componentKey: 'TestComponent' as never,
      enabled: true,
      bindings: {},
      props: { color: 'red' },
    }
    expect(snippet.enabled).toBe(true)
    expect(snippet.props?.color).toBe('red')
  })
})
