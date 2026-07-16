import { describe, it, expect } from 'vitest'
import { emptyToNull } from './empty-to-null'

describe('emptyToNull', () => {
  describe('scalars', () => {
    it('converts empty string to null', () => {
      expect(emptyToNull('')).toBeNull()
    })

    it('leaves non-empty strings intact', () => {
      expect(emptyToNull('hello')).toBe('hello')
      expect(emptyToNull(' ')).toBe(' ')
    })

    it('leaves numbers untouched (including 0)', () => {
      expect(emptyToNull(0)).toBe(0)
      expect(emptyToNull(42)).toBe(42)
      expect(emptyToNull(-1.5)).toBe(-1.5)
    })

    it('leaves booleans untouched (including false)', () => {
      expect(emptyToNull(false)).toBe(false)
      expect(emptyToNull(true)).toBe(true)
    })

    it('leaves null and undefined untouched', () => {
      expect(emptyToNull(null)).toBeNull()
      expect(emptyToNull(undefined)).toBeUndefined()
    })
  })

  describe('top-level objects', () => {
    it('converts empty strings to null on a flat object', () => {
      const input = {
        customer_id: 'abc',
        carrier_id: '',
        warehouse_id: '',
        shipping_time: '',
        packages_count: 0,
      }
      expect(emptyToNull(input)).toEqual({
        customer_id: 'abc',
        carrier_id: null,
        warehouse_id: null,
        shipping_time: null,
        packages_count: 0,
      })
    })

    it('preserves empty arrays and empty objects', () => {
      expect(emptyToNull({ items: [], meta: {} })).toEqual({ items: [], meta: {} })
    })
  })

  describe('nested structures', () => {
    it('recurses into nested objects', () => {
      const input = {
        address: {
          city: 'Milano',
          province: '',
          notes: '',
        },
      }
      expect(emptyToNull(input)).toEqual({
        address: {
          city: 'Milano',
          province: null,
          notes: null,
        },
      })
    })

    it('recurses into arrays of objects (items[])', () => {
      const input = {
        items: [
          { description: 'A', uom: '', quantity: 1 },
          { description: '', uom: 'pcs', quantity: 0 },
        ],
      }
      expect(emptyToNull(input)).toEqual({
        items: [
          { description: 'A', uom: null, quantity: 1 },
          { description: null, uom: 'pcs', quantity: 0 },
        ],
      })
    })

    it('recurses into nested arrays', () => {
      expect(emptyToNull([['', 'a', ''], [0, '']])).toEqual([
        [null, 'a', null],
        [0, null],
      ])
    })
  })

  describe('snapshot fields (skip-list)', () => {
    it('does not touch keys ending in _snapshot', () => {
      const snapshot = {
        name: 'Acme',
        address_line_2: '',
        province: '',
      }
      const input = {
        customer_id: 'abc',
        carrier_id: '',
        customer_snapshot: snapshot,
      }
      const out = emptyToNull(input) as typeof input
      expect(out.customer_snapshot).toEqual(snapshot)
      expect(out.carrier_id).toBeNull()
    })

    it('skips any *_snapshot key (item_snapshot, vat_code_snapshot, ship_to_snapshot)', () => {
      const input = {
        items: [
          {
            item_id: 'x',
            description: '',
            item_snapshot: { code: '', name: 'X' },
            vat_code_snapshot: { rate: 0, label: '' },
          },
        ],
        ship_to_snapshot: { address_line_2: '' },
      }
      const out = emptyToNull(input) as typeof input
      expect(out.items[0].description).toBeNull()
      expect(out.items[0].item_snapshot).toEqual({ code: '', name: 'X' })
      expect(out.items[0].vat_code_snapshot).toEqual({ rate: 0, label: '' })
      expect(out.ship_to_snapshot).toEqual({ address_line_2: '' })
    })
  })

  describe('non-plain objects', () => {
    it('leaves Date instances untouched', () => {
      const d = new Date('2026-01-15')
      expect(emptyToNull({ when: d })).toEqual({ when: d })
    })
  })

  describe('immutability', () => {
    it('does not mutate the input', () => {
      const input = { a: '', b: { c: '' } }
      const snapshot = JSON.parse(JSON.stringify(input))
      emptyToNull(input)
      expect(input).toEqual(snapshot)
    })
  })

  describe('realistic transport-document payload', () => {
    it('normalizes a transport-document-shaped object end-to-end', () => {
      const payload = {
        document_number: 'DDT-001',
        customer_id: 'cust-1',
        carrier_id: '',
        warehouse_id: '',
        shipping_time: '',
        packages_count: 0,
        notes_internal: '',
        customer_snapshot: { name: 'Acme', address_line_2: '' },
        items: [
          {
            type: 'item',
            item_id: 'item-1',
            description: 'Widget',
            quantity: 2,
            uom: 'pcs',
            unit_price: 10,
            vat_code_id: 'vat-1',
            item_snapshot: { code: '', name: 'Widget' },
          },
          {
            type: 'descriptive',
            description: '',
          },
        ],
      }

      expect(emptyToNull(payload)).toEqual({
        document_number: 'DDT-001',
        customer_id: 'cust-1',
        carrier_id: null,
        warehouse_id: null,
        shipping_time: null,
        packages_count: 0,
        notes_internal: null,
        customer_snapshot: { name: 'Acme', address_line_2: '' },
        items: [
          {
            type: 'item',
            item_id: 'item-1',
            description: 'Widget',
            quantity: 2,
            uom: 'pcs',
            unit_price: 10,
            vat_code_id: 'vat-1',
            item_snapshot: { code: '', name: 'Widget' },
          },
          {
            type: 'descriptive',
            description: null,
          },
        ],
      })
    })
  })
})
