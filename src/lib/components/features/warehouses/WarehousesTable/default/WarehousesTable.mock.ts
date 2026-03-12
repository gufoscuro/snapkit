import type { LegalEntityWarehouse } from '$lib/types/api-types'

export const mockWarehouses: LegalEntityWarehouse[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    code: 'WH-001',
    description: 'Main Warehouse',
    warehouse_type: 'main',
    is_negative_allowed: false,
    valuation_method: 'weighted_average',
    is_active: true,
    version: 1,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    code: 'WH-002',
    description: 'Returns Warehouse',
    warehouse_type: 'returns',
    is_negative_allowed: false,
    valuation_method: 'fifo',
    is_active: true,
    version: 1,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    code: 'WH-003',
    description: 'Transit Warehouse',
    warehouse_type: 'transit',
    is_negative_allowed: true,
    valuation_method: 'standard',
    is_active: false,
    version: 1,
  },
]
