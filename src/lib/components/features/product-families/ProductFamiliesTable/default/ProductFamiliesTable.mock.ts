import type { ProductFamily } from '$lib/types/api-types'

/**
 * Mock data for ProductFamiliesTable component preview
 */
export const mockProductFamilies: ProductFamily[] = [
	{
		id: '550e8400-e29b-41d4-a716-446655440001',
		code: 'PF-001',
		name: 'Electronics',
		description: 'Consumer and industrial electronics',
		is_active: true,
	},
	{
		id: '550e8400-e29b-41d4-a716-446655440002',
		code: 'PF-002',
		name: 'Textiles',
		description: 'Fabrics and textile products',
		is_active: true,
	},
	{
		id: '550e8400-e29b-41d4-a716-446655440003',
		code: 'PF-003',
		name: 'Packaging',
		description: 'Packaging materials and solutions',
		is_active: false,
	},
]
