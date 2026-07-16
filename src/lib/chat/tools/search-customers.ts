import { tenantConfigStore } from '$lib/stores/tenant-config'
import { apiRequest } from '$lib/utils/request'
import type { ToolDefinition, ToolHandler } from '@diaphora/chat'

type CustomerRecord = {
  id: string
  name: string
  last_name?: string | null
  trade_name?: string | null
  type?: 'company' | 'individual' | 'public_entity' | 'consortium' | 'association' | null
  vat_number?: string | null
  tax_id?: string | null
  commercial_status?: 'active' | 'prospect' | null
}

type CustomerListResponse = {
  data: CustomerRecord[]
}

const RESULT_CAP = 10

export const searchCustomersTool: ToolDefinition = {
  name: 'search_customers',
  description:
    'Look up customers (clienti) of the active legal entity by free-text query (name, trade name, VAT number, tax id). Returns at most 10 matches with id, display name, type, and identifiers — enough to disambiguate and pass an id to a follow-up tool.',
  input_schema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description:
          'Free-text search. Leave empty to browse the most recent customers (use only when the user has not given a specific name).',
      },
      commercial_status: {
        type: 'string',
        enum: ['active', 'prospect'],
        description:
          'Optional filter by commercial status. Omit unless the user explicitly asks for active or prospect customers.',
      },
    },
    required: [],
  },
}

export const searchCustomersHandler: ToolHandler = {
  type: 'async',
  async execute(input) {
    const legalEntityId = tenantConfigStore.getLegalEntityId()
    if (!legalEntityId) {
      return JSON.stringify({ error: 'No active legal entity' })
    }

    const queryParams: Record<string, string> = {}
    if (typeof input.query === 'string' && input.query.trim().length > 0) {
      queryParams.search = input.query.trim()
    }
    if (input.commercial_status === 'active' || input.commercial_status === 'prospect') {
      queryParams.commercial_status = input.commercial_status
    }

    try {
      const res = await apiRequest<CustomerListResponse>({
        url: `/legal-entities/${legalEntityId}/customers`,
        queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
      })
      const items = (res?.data ?? []).slice(0, RESULT_CAP).map(summarize)
      return JSON.stringify({ count: items.length, customers: items })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return JSON.stringify({ error: 'Customer search failed', details: message })
    }
  },
}

function summarize(c: CustomerRecord) {
  return {
    id: c.id,
    display_name: displayName(c),
    type: c.type ?? undefined,
    vat_number: c.vat_number ?? undefined,
    tax_id: c.tax_id ?? undefined,
    commercial_status: c.commercial_status ?? undefined,
  }
}

function displayName(c: CustomerRecord): string {
  if (c.trade_name && c.trade_name.trim().length > 0) return c.trade_name.trim()
  if (c.type === 'individual') {
    return [c.name, c.last_name].filter(Boolean).join(' ').trim() || c.name
  }
  return c.name
}
