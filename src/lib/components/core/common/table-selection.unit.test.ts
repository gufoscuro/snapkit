import { describe, expect, it, vi } from 'vitest'
import { createTableSelection } from './table-selection.svelte'

type Row = { id: string; name: string }

const rows: Row[] = [
  { id: 'a', name: 'Alpha' },
  { id: 'b', name: 'Beta' },
  { id: 'c', name: 'Gamma' },
]

function selectionWithPool(pool: Row[] = rows) {
  const selection = createTableSelection<Row>()
  selection.setPool(pool)
  return selection
}

describe('createTableSelection', () => {
  it('starts empty', () => {
    const selection = selectionWithPool()

    expect(selection.count).toBe(0)
    expect(selection.rows).toEqual([])
    expect(selection.allSelected).toBe(false)
    expect(selection.someSelected).toBe(false)
  })

  it('toggles a row on and off', () => {
    const selection = selectionWithPool()

    selection.toggle('b')
    expect(selection.has('b')).toBe(true)
    expect(selection.ids).toEqual(['b'])

    selection.toggle('b')
    expect(selection.has('b')).toBe(false)
    expect(selection.count).toBe(0)
  })

  it('resolves rows in pool order, not selection order', () => {
    const selection = selectionWithPool()

    selection.toggle('c')
    selection.toggle('a')

    expect(selection.ids).toEqual(['a', 'c'])
    expect(selection.rows.map(row => row.name)).toEqual(['Alpha', 'Gamma'])
  })

  it('reports a partial selection as indeterminate', () => {
    const selection = selectionWithPool()

    selection.toggle('a')

    expect(selection.someSelected).toBe(true)
    expect(selection.allSelected).toBe(false)
  })

  it('selects every loaded row, then clears on a second toggle', () => {
    const selection = selectionWithPool()

    selection.toggleAll()
    expect(selection.count).toBe(3)
    expect(selection.allSelected).toBe(true)
    expect(selection.someSelected).toBe(false)

    selection.toggleAll()
    expect(selection.count).toBe(0)
  })

  it('completes a partial selection rather than clearing it', () => {
    const selection = selectionWithPool()

    selection.toggle('b')
    selection.toggleAll()

    expect(selection.ids).toEqual(['a', 'b', 'c'])
  })

  it('never reports allSelected on an empty table', () => {
    const selection = selectionWithPool([])

    selection.toggleAll()

    expect(selection.allSelected).toBe(false)
    expect(selection.count).toBe(0)
  })

  it('prunes ids that left the table', () => {
    const selection = selectionWithPool()
    selection.toggleAll()

    // What a `removeRows` / filter change looks like from the store's side.
    selection.setPool([rows[0], rows[2]])

    expect(selection.ids).toEqual(['a', 'c'])
    expect(selection.has('b')).toBe(false)
    expect(selection.allSelected).toBe(true)
  })

  it('does not select rows appended by load more', () => {
    const selection = selectionWithPool()
    selection.toggleAll()

    selection.setPool([...rows, { id: 'd', name: 'Delta' }])

    expect(selection.ids).toEqual(['a', 'b', 'c'])
    expect(selection.allSelected).toBe(false)
    expect(selection.someSelected).toBe(true)
  })

  it('ignores rows without a string id', () => {
    const selection = createTableSelection<{ id?: string }>()
    selection.setPool([{ id: 'a' }, {}])

    selection.toggleAll()

    expect(selection.ids).toEqual(['a'])
    expect(selection.allSelected).toBe(true)
  })

  it('selects every row in the pool', () => {
    const selection = selectionWithPool()
    selection.toggle('b')

    selection.selectAll()

    expect(selection.ids).toEqual(['a', 'b', 'c'])
  })

  it('toggles a subset as a block', () => {
    const selection = selectionWithPool()

    selection.toggleMany(['a', 'b'])
    expect(selection.ids).toEqual(['a', 'b'])

    selection.toggleMany(['a', 'b'])
    expect(selection.count).toBe(0)
  })

  it('completes a partially selected subset rather than clearing it', () => {
    const selection = selectionWithPool()
    selection.toggle('a')

    selection.toggleMany(['a', 'b'])

    expect(selection.ids).toEqual(['a', 'b'])
  })

  it('reports the state of a subset', () => {
    const selection = selectionWithPool()

    expect(selection.stateOf(['a', 'b'])).toEqual({ all: false, some: false })
    selection.toggle('a')
    expect(selection.stateOf(['a', 'b'])).toEqual({ all: false, some: true })
    selection.toggle('b')
    expect(selection.stateOf(['a', 'b'])).toEqual({ all: true, some: false })
    expect(selection.stateOf([])).toEqual({ all: false, some: false })
  })

  it('clears the whole selection', () => {
    const selection = selectionWithPool()
    selection.toggleAll()

    selection.clear()

    expect(selection.count).toBe(0)
  })

  it('publishes the table action helpers', () => {
    const selection = selectionWithPool()
    expect(selection.helpers).toBeUndefined()

    const removeRows = vi.fn()
    selection.setHelpers({
      removeRow: vi.fn(),
      removeRows,
      updateRow: vi.fn(),
      refresh: vi.fn(),
    })

    // Identity is not asserted: `$state` hands back a proxy of the object.
    selection.helpers?.removeRows(['a'])
    expect(removeRows).toHaveBeenCalledWith(['a'])
  })
})
