import * as m from '$lib/paraglide/messages'
import type { Customer } from '$lib/types/api-types'

export function getCustomerTypeLabel(type: Customer['type']): string {
  const labels: Record<Customer['type'], string> = {
    company: m.customer_type_company(),
    individual: m.customer_type_individual(),
    public_entity: m.customer_type_public_entity(),
    consortium: m.customer_type_consortium(),
    association: m.customer_type_association(),
  }
  return labels[type] ?? type
}
