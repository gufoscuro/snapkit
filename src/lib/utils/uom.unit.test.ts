import { describe, it, expect, vi } from 'vitest'

vi.mock('$lib/paraglide/messages', () => ({
	uom_unit: () => 'pz',
	uom_liter: () => 'litro',
	uom_meter: () => 'metro',
	uom_kilogram: () => 'kg',
	uom_square_meter: () => 'mq',
	uom_square_decimeter: () => 'dmq',
	uom_box: () => 'scatola',
	uom_bottle: () => 'bottiglia',
	uom_roll: () => 'rotolo',
	uom_sheet: () => 'foglio',
	uom_reel: () => 'rocca',
	uom_cone: () => 'cono',
	uom_pq: () => 'pq',
	uom_cq: () => 'cq',
	uom_dq: () => 'dq',
	uom_mgl: () => 'mgl',
}))

import {
	findUOM,
	getUOMDisplayedSymbol,
	getUOMStep,
	getUOMMinQuantity,
	validateUOM,
	getUnitOfMeasureOptions,
	getAggregateUnitOfMeasureOptions,
	getAllUnitOfMeasureOptions,
	getUomBestMatch,
	isAggregateUOM,
	getUOMsByCategory,
	UnitOfMeasures,
} from './uom'

describe('findUOM', () => {
	it('finds an existing UOM by id', () => {
		const uom = findUOM('kilogram')
		expect(uom).toBeDefined()
		expect(uom?.id).toBe('kilogram')
		expect(uom?.step).toBe(0.1)
	})

	it('returns undefined for unknown id', () => {
		expect(findUOM('gallon')).toBeUndefined()
	})

	it('returns undefined for empty string', () => {
		expect(findUOM('')).toBeUndefined()
	})
})

describe('getUOMDisplayedSymbol', () => {
	it('returns localized label for known UOM', () => {
		expect(getUOMDisplayedSymbol('unit')).toBe('pz')
		expect(getUOMDisplayedSymbol('kilogram')).toBe('kg')
	})

	it('falls back to id for unknown UOM', () => {
		expect(getUOMDisplayedSymbol('gallon')).toBe('gallon')
	})
})

describe('getUOMStep', () => {
	it('returns step for known UOM', () => {
		expect(getUOMStep('unit')).toBe(1)
		expect(getUOMStep('liter')).toBe(0.5)
		expect(getUOMStep('mgl')).toBe(0.001)
	})

	it('returns 1 as default for unknown UOM', () => {
		expect(getUOMStep('unknown')).toBe(1)
	})
})

describe('getUOMMinQuantity', () => {
	it('returns minimum quantity for known UOM', () => {
		expect(getUOMMinQuantity('unit')).toBe(1)
		expect(getUOMMinQuantity('liter')).toBe(0.001)
		expect(getUOMMinQuantity('square_decimeter')).toBe(1)
	})

	it('returns 1 as default for unknown UOM', () => {
		expect(getUOMMinQuantity('unknown')).toBe(1)
	})
})

describe('validateUOM', () => {
	it('returns true for valid UOM', () => {
		expect(validateUOM('unit')).toBe(true)
		expect(validateUOM('kilogram')).toBe(true)
	})

	it('returns false for unknown UOM', () => {
		expect(validateUOM('gallon')).toBe(false)
	})

	it('returns false for empty string', () => {
		expect(validateUOM('')).toBe(false)
	})

	it('returns false for UNSET_UOM', () => {
		expect(validateUOM(UnitOfMeasures.Unset)).toBe(false)
	})
})

describe('isAggregateUOM', () => {
	it('returns true for aggregate UOMs', () => {
		expect(isAggregateUOM('box')).toBe(true)
		expect(isAggregateUOM('roll')).toBe(true)
		expect(isAggregateUOM('cone')).toBe(true)
	})

	it('returns false for base UOMs', () => {
		expect(isAggregateUOM('unit')).toBe(false)
		expect(isAggregateUOM('kilogram')).toBe(false)
	})

	it('returns false for unknown UOM', () => {
		expect(isAggregateUOM('unknown')).toBe(false)
	})
})

describe('getUnitOfMeasureOptions', () => {
	it('returns only non-aggregate UOMs', () => {
		const options = getUnitOfMeasureOptions()
		expect(options.length).toBeGreaterThan(0)
		for (const opt of options) {
			expect(opt.label).toBeTruthy()
			expect(opt.value).toBeTruthy()
			expect(isAggregateUOM(opt.value)).toBe(false)
		}
	})
})

describe('getAggregateUnitOfMeasureOptions', () => {
	it('returns only aggregate UOMs', () => {
		const options = getAggregateUnitOfMeasureOptions()
		expect(options.length).toBeGreaterThan(0)
		for (const opt of options) {
			expect(isAggregateUOM(opt.value)).toBe(true)
		}
	})
})

describe('getAllUnitOfMeasureOptions', () => {
	it('returns all UOMs (base + aggregate)', () => {
		const all = getAllUnitOfMeasureOptions()
		const base = getUnitOfMeasureOptions()
		const agg = getAggregateUnitOfMeasureOptions()
		expect(all.length).toBe(base.length + agg.length)
	})

	it('each option has label and value', () => {
		for (const opt of getAllUnitOfMeasureOptions()) {
			expect(opt.label).toBeTruthy()
			expect(opt.value).toBeTruthy()
		}
	})
})

describe('getUOMsByCategory', () => {
	it('returns UOMs for a given category', () => {
		const textiles = getUOMsByCategory('textiles')
		expect(textiles.length).toBeGreaterThan(0)
		for (const opt of textiles) {
			const uom = findUOM(opt.value)
			expect(uom?.category).toBe('textiles')
		}
	})

	it('returns empty array for unknown category', () => {
		expect(getUOMsByCategory('nonexistent')).toEqual([])
	})
})

describe('getUomBestMatch', () => {
	describe('exact match', () => {
		it('matches by exact id', () => {
			expect(getUomBestMatch('unit')).toBe('unit')
			expect(getUomBestMatch('kilogram')).toBe('kilogram')
		})

		it('is case-insensitive', () => {
			expect(getUomBestMatch('UNIT')).toBe('unit')
			expect(getUomBestMatch('Kilogram')).toBe('kilogram')
		})

		it('trims whitespace', () => {
			expect(getUomBestMatch('  unit  ')).toBe('unit')
		})
	})

	describe('alias match', () => {
		it('resolves common aliases', () => {
			expect(getUomBestMatch('kg')).toBe('kilogram')
			expect(getUomBestMatch('pcs')).toBe('unit')
			expect(getUomBestMatch('pz')).toBe('unit')
			expect(getUomBestMatch('lt')).toBe('liter')
			expect(getUomBestMatch('m2')).toBe('square_meter')
		})

		it('aliases are case-insensitive', () => {
			expect(getUomBestMatch('KG')).toBe('kilogram')
			expect(getUomBestMatch('PCS')).toBe('unit')
		})
	})

	describe('partial match', () => {
		it('matches when input contains UOM id', () => {
			expect(getUomBestMatch('meters')).toBe('meter')
		})
	})

	describe('no match', () => {
		it('returns UNSET_UOM when no match and no fallback', () => {
			expect(getUomBestMatch('unknown_xyz')).toBe(UnitOfMeasures.Unset)
		})

		it('returns default when no match and fallbackToDefault is true', () => {
			expect(getUomBestMatch('unknown_xyz', true)).toBe(UnitOfMeasures.Default)
		})
	})

	describe('invalid input', () => {
		it('returns UNSET_UOM for empty string', () => {
			expect(getUomBestMatch('')).toBe(UnitOfMeasures.Unset)
		})

		it('returns default for empty string with fallback', () => {
			expect(getUomBestMatch('', true)).toBe(UnitOfMeasures.Default)
		})

		it('returns UNSET_UOM for non-string input', () => {
			// @ts-expect-error testing invalid input
			expect(getUomBestMatch(null)).toBe(UnitOfMeasures.Unset)
			// @ts-expect-error testing invalid input
			expect(getUomBestMatch(undefined)).toBe(UnitOfMeasures.Unset)
		})
	})
})
