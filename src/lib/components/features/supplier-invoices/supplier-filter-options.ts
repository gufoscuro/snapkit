import type { Supplier } from '$lib/types/api-types'
import { createQueryRequestObject, type FilterOption, type PaginatedResponse } from '$lib/utils/filters'
import { api } from '$lib/utils/request'

/** Supplier search for the `supplier_id` filter of the payables listings. */
export async function fetchSupplierFilterOptions(
  legalEntityId: string | undefined,
  search: string,
): Promise<FilterOption[]> {
  if (!legalEntityId) return []
  const res = await api.get<PaginatedResponse<Supplier>>(`/legal-entities/${legalEntityId}/suppliers`, {
    queryParams: createQueryRequestObject({ search }),
  })
  return res.data.map(s => ({ value: s.id, label: s.name }))
}
