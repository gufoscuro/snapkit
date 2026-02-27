import { describe, expect, it, vi } from 'vitest'

const { mockRenderComponent } = vi.hoisted(() => ({
  mockRenderComponent: vi.fn((_comp: any, props: any) => ({ __component: true, props })),
}))

vi.mock('$lib/components/ui/data-table', () => ({
  renderComponent: mockRenderComponent,
}))

import { createComponentRenderer } from './component-renderer'
import type { ColumnConfig } from '../types'

type TestRow = { id: string; name: string }

function mockCellContext(row: TestRow) {
  return {
    getValue: () => row.name,
    row: { original: row },
  } as any
}

describe('createComponentRenderer', () => {
  it('renders component with mapped props', () => {
    const FakeComponent = {} as any
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'name',
      header: 'Name',
      renderer: 'component',
      rendererConfig: {
        component: FakeComponent,
        propsMapper: (row: TestRow) => ({ label: row.name, id: row.id }),
      },
    }
    const render = createComponentRenderer(config)
    const row: TestRow = { id: '1', name: 'Test' }
    render(mockCellContext(row))

    expect(mockRenderComponent).toHaveBeenCalledWith(FakeComponent, { label: 'Test', id: '1' })
  })

  it('throws if component is not provided', () => {
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'name',
      header: 'Name',
      renderer: 'component',
      rendererConfig: { propsMapper: () => ({}) } as any,
    }
    const render = createComponentRenderer(config)
    expect(() => render(mockCellContext({ id: '1', name: 'Test' }))).toThrow(
      'component renderer requires a component',
    )
  })

  it('throws if propsMapper is not provided', () => {
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'name',
      header: 'Name',
      renderer: 'component',
      rendererConfig: { component: {} } as any,
    }
    const render = createComponentRenderer(config)
    expect(() => render(mockCellContext({ id: '1', name: 'Test' }))).toThrow(
      'component renderer requires a propsMapper',
    )
  })

  it('throws if rendererConfig is undefined', () => {
    const config: ColumnConfig<TestRow> = {
      accessorKey: 'name',
      header: 'Name',
      renderer: 'component',
    }
    const render = createComponentRenderer(config)
    expect(() => render(mockCellContext({ id: '1', name: 'Test' }))).toThrow(
      'component renderer requires a component',
    )
  })
})
