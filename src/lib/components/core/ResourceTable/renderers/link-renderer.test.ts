import { describe, expect, it, vi, beforeEach } from 'vitest'

const { mockRenderSnippet, mockCreateRawSnippet } = vi.hoisted(() => ({
  mockRenderSnippet: vi.fn((snippet: any) => ({ __snippet: true, snippet })),
  mockCreateRawSnippet: vi.fn((fn: any) => fn()),
}))

vi.mock('$lib/components/ui/data-table', () => ({
  renderSnippet: mockRenderSnippet,
}))

vi.mock('svelte', () => ({
  createRawSnippet: mockCreateRawSnippet,
}))

import { createLinkRenderer } from './link-renderer'
import type { ColumnConfig } from '../types'

type TestRow = { id: string; name: string; internal_id?: string }

function mockCellContext(value: unknown, row: TestRow) {
  return {
    getValue: () => value,
    row: { original: row },
  } as any
}

describe('createLinkRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns "-" for null value', () => {
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'name',
      header: 'Name',
      renderer: 'link',
      rendererConfig: { urlBuilder: (row: TestRow) => `/items/${row.id}` },
    }
    const render = createLinkRenderer(config)
    expect(render(mockCellContext(null, { id: '1', name: '' }))).toBe('-')
  })

  it('returns "-" for undefined value', () => {
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'name',
      header: 'Name',
      renderer: 'link',
      rendererConfig: { urlBuilder: (row: TestRow) => `/items/${row.id}` },
    }
    const render = createLinkRenderer(config)
    expect(render(mockCellContext(undefined, { id: '1', name: '' }))).toBe('-')
  })

  it('returns "-" for empty string', () => {
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'name',
      header: 'Name',
      renderer: 'link',
      rendererConfig: { urlBuilder: (row: TestRow) => `/items/${row.id}` },
    }
    const render = createLinkRenderer(config)
    expect(render(mockCellContext('', { id: '1', name: '' }))).toBe('-')
  })

  it('returns plain text when no urlBuilder is provided', () => {
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'name',
      header: 'Name',
      renderer: 'link',
    }
    const render = createLinkRenderer(config)
    expect(render(mockCellContext('Test', { id: '1', name: 'Test' }))).toBe('Test')
  })

  it('returns plain text when urlBuilder returns empty string', () => {
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'name',
      header: 'Name',
      renderer: 'link',
      rendererConfig: { urlBuilder: () => '' },
    }
    const render = createLinkRenderer(config)
    expect(render(mockCellContext('Test', { id: '1', name: 'Test' }))).toBe('Test')
  })

  it('creates link snippet with correct URL and display value', () => {
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'name',
      header: 'Name',
      renderer: 'link',
      rendererConfig: { urlBuilder: (row: TestRow) => `/items/${row.id}` },
    }
    const render = createLinkRenderer(config)
    render(mockCellContext('Acme', { id: '42', name: 'Acme' }))

    expect(mockCreateRawSnippet).toHaveBeenCalled()
    const snippetFactory = mockCreateRawSnippet.mock.calls[0][0]
    const result = snippetFactory()
    const html = result.render()
    expect(html).toContain('href="/items/42"')
    expect(html).toContain('Acme')
  })

  it('uses valueAccessor when provided', () => {
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'internal_id',
      header: 'Order',
      renderer: 'link',
      rendererConfig: {
        urlBuilder: (row: TestRow) => `/orders/${row.id}`,
        valueAccessor: (row: TestRow) => row.internal_id ?? row.id,
      },
    }
    const render = createLinkRenderer(config)
    render(mockCellContext('ORD-001', { id: '1', name: 'Test', internal_id: 'ORD-001' }))

    const snippetFactory = mockCreateRawSnippet.mock.calls[0][0]
    const result = snippetFactory()
    const html = result.render()
    expect(html).toContain('ORD-001')
    expect(html).toContain('href="/orders/1"')
  })

  it('calls renderSnippet with the created snippet', () => {
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'name',
      header: 'Name',
      renderer: 'link',
      rendererConfig: { urlBuilder: (row: TestRow) => `/items/${row.id}` },
    }
    const render = createLinkRenderer(config)
    render(mockCellContext('Test', { id: '1', name: 'Test' }))

    expect(mockRenderSnippet).toHaveBeenCalled()
  })
})
