import { describe, expect, it, vi } from 'vitest'

const { mockRenderComponent } = vi.hoisted(() => ({
  mockRenderComponent: vi.fn((_comp: any, props: any) => ({ __component: true, props })),
}))

vi.mock('$lib/components/ui/data-table', () => ({
  renderComponent: mockRenderComponent,
}))

vi.mock('./ActionsCell.svelte', () => ({ default: 'ActionsCell' }))

import { createActionsRenderer } from './actions-renderer'
import type { ActionHelpers, ColumnConfig } from '../types'

type TestRow = { id: string; name: string }

const mockActionHelpers: ActionHelpers<TestRow> = {
  removeRow: vi.fn(),
  updateRow: vi.fn(),
  refresh: vi.fn(),
}

function mockCellContext(row: TestRow) {
  return {
    getValue: () => null,
    row: { original: row },
  } as any
}

describe('createActionsRenderer', () => {
  it('returns null when no actions configured', () => {
    const config: ColumnConfig<TestRow> = {
      header: 'Actions',
      renderer: 'actions',
      rendererConfig: { actions: [] },
    }
    const render = createActionsRenderer(config, mockActionHelpers)
    expect(render(mockCellContext({ id: '1', name: 'Test' }))).toBeNull()
  })

  it('returns null when rendererConfig is undefined', () => {
    const config: ColumnConfig<TestRow> = {
      header: 'Actions',
      renderer: 'actions',
    }
    const render = createActionsRenderer(config, mockActionHelpers)
    expect(render(mockCellContext({ id: '1', name: 'Test' }))).toBeNull()
  })

  it('renders ActionsCell with row and actions', () => {
    const onClick = vi.fn()
    const config: ColumnConfig<TestRow> = {
      header: 'Actions',
      renderer: 'actions',
      rendererConfig: {
        actions: [{ onClick, label: 'Delete' }],
        buttonSize: 'sm',
        dropdownAlign: 'end',
      },
    }
    const render = createActionsRenderer(config, mockActionHelpers)
    const row: TestRow = { id: '1', name: 'Test' }
    render(mockCellContext(row))

    expect(mockRenderComponent).toHaveBeenCalledWith('ActionsCell', {
      row,
      actions: [{ onClick, label: 'Delete' }],
      buttonSize: 'sm',
      dropdownAlign: 'end',
      actionHelpers: mockActionHelpers,
    })
  })

  it('passes actionHelpers to the component', () => {
    const config: ColumnConfig<TestRow> = {
      header: 'Actions',
      renderer: 'actions',
      rendererConfig: {
        actions: [{ onClick: vi.fn() }],
      },
    }
    const render = createActionsRenderer(config, mockActionHelpers)
    render(mockCellContext({ id: '1', name: 'Test' }))

    const callProps = mockRenderComponent.mock.calls[0][1]
    expect(callProps.actionHelpers).toBe(mockActionHelpers)
  })
})
