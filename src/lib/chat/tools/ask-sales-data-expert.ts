import { tenantConfigStore } from '$lib/stores/tenant-config'
import { apiRequest } from '$lib/utils/request'
import type { ToolDefinition, ToolHandler } from '@diaphora/chat'

/**
 * Delegation to a backend expert agent — docs/ASSISTANT_ARCHITECTURE.md §2.3, §3.2.
 *
 * From the orchestrator's point of view this is just a tool. That it runs an LLM loop
 * server-side, pages through hundreds of rows and never puts them in this conversation
 * is precisely the point: the expert's context absorbs the bulk, ours gets the answer.
 *
 * Note what is NOT a parameter: the legal entity. It comes from the session, never from
 * the model (§2.7, generalizing the admin-assistant's Rule 1) — a hallucinated entity
 * name must not be able to become a query against the wrong tenant.
 *
 * SPIKE: the endpoint is synchronous. The documented contract creates a task and streams
 * progress; the envelope is the stable part and the transport is allowed to evolve.
 */

type ExpertEnvelope = {
  status: 'completed' | 'failed'
  result?: {
    answer: string
    data: Array<{ label: string; value?: number; unit?: string; detail?: string }>
    sources: string[]
    caveats: string[]
  }
  error?: { code: string; message: string }
  usage?: { turns: number; input_tokens: number; output_tokens: number; duration_ms: number }
}

export const askSalesDataExpertTool: ToolDefinition = {
  name: 'ask_sales_data_expert',
  description:
    'Delegate a question about sales data to a backend expert that can query, page through and aggregate the whole active sales cycle: customers, quotations, sales orders, invoices, receivables, payments, and what was sold by product family. Use it for questions needing aggregation, ranking, cross-referencing or multi-step analysis ("who owes us the most", "top customers this quarter", "what did X buy by product family", "average time from quotation to order"). Do NOT use it to simply look up or display a record — for that use search_customers and navigate_to_page. Returns a synthesized answer plus the figures behind it, their sources, and any caveats.',
  input_schema: {
    type: 'object',
    properties: {
      task: {
        type: 'string',
        description:
          'The analytical task, in natural language, fully self-contained. The expert cannot see this conversation, the current page, or the user selection — spell out the period, the customer and the measure explicitly.',
      },
    },
    required: ['task'],
  },
}

export const askSalesDataExpertHandler: ToolHandler = {
  type: 'async',
  async execute(input) {
    const legalEntityId = tenantConfigStore.getLegalEntityId()
    if (!legalEntityId) {
      return JSON.stringify({ error: 'No active legal entity' })
    }

    const task = typeof input.task === 'string' ? input.task.trim() : ''
    if (!task) {
      return JSON.stringify({ error: 'A task is required' })
    }

    try {
      const res = await apiRequest<ExpertEnvelope>({
        url: `/legal-entities/${legalEntityId}/agents/sales-data/tasks`,
        method: 'POST',
        data: { task },
      })

      if (res.status === 'failed') {
        return JSON.stringify({
          error: 'The expert could not complete the task',
          code: res.error?.code,
          details: res.error?.message,
        })
      }

      // Pass the envelope through as-is. The orchestrator model composes from `answer`
      // and cites `data`; stripping either is what makes a two-hop chain invent numbers.
      return JSON.stringify(res.result)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return JSON.stringify({ error: 'Delegation failed', details: message })
    }
  },
}
