import type { ProductLine } from '$lib/types/api-types'

/**
 * Mock data for ProductLinesTable component preview
 */
export const mockProductLines: ProductLine[] = [
	{
		id: '770e8400-e29b-41d4-a716-446655440001',
		code: 'PL-001',
		name: 'Industrial Automation',
		description: 'Automation systems and controllers',
		is_active: true,
	},
	{
		id: '770e8400-e29b-41d4-a716-446655440002',
		code: 'PL-002',
		name: 'Consumer Electronics',
		description: 'Smartphones, tablets and accessories',
		is_active: true,
	},
	{
		id: '770e8400-e29b-41d4-a716-446655440003',
		code: 'PL-003',
		name: 'Medical Devices',
		description: 'Diagnostic and monitoring equipment',
		is_active: false,
	},
]
