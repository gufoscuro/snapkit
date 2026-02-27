import { describe, expect, it, vi } from 'vitest'

const { mockRenderComponent } = vi.hoisted(() => ({
  mockRenderComponent: vi.fn((_comp: any, props: any) => ({ __component: true, props })),
}))

vi.mock('$lib/components/ui/data-table', () => ({
  renderComponent: mockRenderComponent,
}))

import { createBadgesRenderer } from './badges-renderer'
import type { ColumnConfig } from '../types'

type TestRow = { categories: Array<{ name: string }> }

function mockCellContext(value: unknown, row: TestRow = { categories: [] }) {
  return {
    getValue: () => value,
    row: { original: row },
  } as any
}

describe('createBadgesRenderer', () => {
  it('renders component with items from accessorKey', () => {
    const FakeComponent = {} as any
    const items = [{ name: 'Cat A' }, { name: 'Cat B' }]
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'categories',
      header: 'Categories',
      renderer: 'badges',
      rendererConfig: { component: FakeComponent },
    }
    const render = createBadgesRenderer(config)
    render(mockCellContext(items, { categories: items }))

    expect(mockRenderComponent).toHaveBeenCalledWith(FakeComponent, { categories: items })
  })

  it('uses custom accessor when provided', () => {
    const FakeComponent = {} as any
    const items = [{ name: 'Tag 1' }]
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'categories',
      header: 'Tags',
      renderer: 'badges',
      rendererConfig: {
        component: FakeComponent,
        accessor: (row: TestRow) => row.categories,
      },
    }
    const render = createBadgesRenderer(config)
    render(mockCellContext(null, { categories: items }))

    expect(mockRenderComponent).toHaveBeenCalledWith(FakeComponent, { categories: items })
  })

  it('uses "items" as prop name when no accessorKey', () => {
    const FakeComponent = {} as any
    const items = [{ name: 'Item 1' }]
    const config: ColumnConfig<TestRow> = {
      header: 'Items',
      renderer: 'badges',
      rendererConfig: {
        component: FakeComponent,
        accessor: () => items,
      },
    }
    const render = createBadgesRenderer(config)
    render(mockCellContext(null, { categories: [] }))

    expect(mockRenderComponent).toHaveBeenCalledWith(FakeComponent, { items })
  })

  it('returns "-" for null items', () => {
    const FakeComponent = {} as any
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'categories',
      header: 'Categories',
      renderer: 'badges',
      rendererConfig: { component: FakeComponent },
    }
    const render = createBadgesRenderer(config)
    expect(render(mockCellContext(null))).toBe('-')
  })

  it('returns "-" for empty array', () => {
    const FakeComponent = {} as any
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'categories',
      header: 'Categories',
      renderer: 'badges',
      rendererConfig: { component: FakeComponent },
    }
    const render = createBadgesRenderer(config)
    expect(render(mockCellContext([]))).toBe('-')
  })

  it('returns "-" for non-array value', () => {
    const FakeComponent = {} as any
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'categories',
      header: 'Categories',
      renderer: 'badges',
      rendererConfig: { component: FakeComponent },
    }
    const render = createBadgesRenderer(config)
    expect(render(mockCellContext('not-array'))).toBe('-')
  })

  it('throws if component is not provided', () => {
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'categories',
      header: 'Categories',
      renderer: 'badges',
      rendererConfig: {} as any,
    }
    const render = createBadgesRenderer(config)
    expect(() => render(mockCellContext([{ name: 'test' }]))).toThrow(
      'badges renderer requires a component',
    )
  })
})
