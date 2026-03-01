import type { CommodityCode } from '$lib/types/api-types'

/**
 * Mock data for CommodityCodesTable component preview
 */
export const mockCommodityCodes: CommodityCode[] = [
	{
		id: '660e8400-e29b-41d4-a716-446655440001',
		code: 'HS-8471',
		name: 'Automatic data processing machines',
		description: 'Computers, peripherals and related equipment',
		is_active: true,
	},
	{
		id: '660e8400-e29b-41d4-a716-446655440002',
		code: 'HS-6109',
		name: 'T-shirts and singlets',
		description: 'Knitted or crocheted cotton garments',
		is_active: true,
	},
	{
		id: '660e8400-e29b-41d4-a716-446655440003',
		code: 'HS-3923',
		name: 'Plastic packaging',
		description: 'Articles for conveyance or packing of goods',
		is_active: false,
	},
]
