import { describe, expect, it, vi, beforeEach } from 'vitest'

const { mockRenderComponent, mockCreateRawSnippet } = vi.hoisted(() => ({
  mockRenderComponent: vi.fn((_comp: any, props: any) => ({ __component: true, props })),
  mockCreateRawSnippet: vi.fn((fn: any) => fn()),
}))

vi.mock('$lib/components/ui/data-table', () => ({
  renderComponent: mockRenderComponent,
}))

vi.mock('svelte', () => ({
  createRawSnippet: mockCreateRawSnippet,
}))

vi.mock('$lib/components/ui/badge/badge.svelte', () => ({ default: 'Badge' }))

import { createBadgeRenderer } from './badge-renderer'
import type { ColumnConfig } from '../types'

type TestRow = { status: string }

function mockCellContext(value: unknown) {
  return {
    getValue: () => value,
    row: { original: { status: '' } },
  } as any
}

describe('createBadgeRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns "-" for null value', () => {
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'status',
      header: 'Status',
      renderer: 'badge',
      rendererConfig: { variantMapper: () => 'default' as any },
    }
    const render = createBadgeRenderer(config)
    expect(render(mockCellContext(null))).toBe('-')
  })

  it('returns "-" for undefined value', () => {
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'status',
      header: 'Status',
      renderer: 'badge',
      rendererConfig: { variantMapper: () => 'default' as any },
    }
    const render = createBadgeRenderer(config)
    expect(render(mockCellContext(undefined))).toBe('-')
  })

  it('returns "-" for empty string', () => {
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'status',
      header: 'Status',
      renderer: 'badge',
      rendererConfig: { variantMapper: () => 'default' as any },
    }
    const render = createBadgeRenderer(config)
    expect(render(mockCellContext(''))).toBe('-')
  })

  it('returns string value when no variantMapper', () => {
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'status',
      header: 'Status',
      renderer: 'badge',
    }
    const render = createBadgeRenderer(config)
    expect(render(mockCellContext('active'))).toBe('active')
  })

  it('calls renderComponent with mapped variant', () => {
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'status',
      header: 'Status',
      renderer: 'badge',
      rendererConfig: {
        variantMapper: (value: any) => (value === 'active' ? 'default' : 'secondary'),
      },
    }
    const render = createBadgeRenderer(config)
    render(mockCellContext('active'))

    expect(mockRenderComponent).toHaveBeenCalledWith(
      'Badge',
      expect.objectContaining({ variant: 'default' }),
    )
  })

  it('uses labelMapper when provided', () => {
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'status',
      header: 'Status',
      renderer: 'badge',
      rendererConfig: {
        variantMapper: () => 'default' as any,
        labelMapper: (value: any) => value.toUpperCase(),
      },
    }
    const render = createBadgeRenderer(config)
    render(mockCellContext('active'))

    expect(mockCreateRawSnippet).toHaveBeenCalled()
    // The snippet should produce HTML with "ACTIVE"
    const snippetFactory = mockCreateRawSnippet.mock.calls[0][0]
    const result = snippetFactory()
    expect(result.render()).toContain('ACTIVE')
  })

  it('uses String(value) as label when no labelMapper', () => {
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'status',
      header: 'Status',
      renderer: 'badge',
      rendererConfig: {
        variantMapper: () => 'default' as any,
      },
    }
    const render = createBadgeRenderer(config)
    render(mockCellContext('pending'))

    const snippetFactory = mockCreateRawSnippet.mock.calls[0][0]
    const result = snippetFactory()
    expect(result.render()).toContain('pending')
  })
})
