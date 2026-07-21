/**
 * Headless replica of the SnapKit orchestrator loop, for the Phase 0 spike.
 *
 * It is NOT a reimplementation of the architecture — it drives the real pieces:
 *   - the real passthrough (/api/chat/gemini), so the real system prompt and the real
 *     Anthropic<->Gemini translation are exercised
 *   - the real tool definitions (globalTools), so routing is decided by the real
 *     descriptions
 *   - the real backend expert over HTTP
 *
 * Only the client-side loop and the browser session are stood in for: tool execution is
 * done here, and the Laravel call carries a bearer token instead of a session cookie.
 * What we are testing is whether the orchestrator CHOOSES to delegate and whether it
 * REUSES the envelope faithfully — both of which this preserves.
 */

const SNAPKIT = 'http://localhost:5173'
const API = process.env.API_GATEWAY ?? 'http://api.moddo.local:8000'
const TOKEN = process.env.MODDO_TOKEN
const LEGAL_ENTITY = process.env.MODDO_LE

const userMessage = process.argv[2] ?? 'Quanto ci devono in tutto i clienti, di scaduto?'

// Mirrors src/lib/chat/tools/*.ts. Kept minimal: only what the orchestrator needs to
// decide between answering directly, using a deterministic tool, or delegating.
const tools = [
  {
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
  },
  {
    name: 'search_customers',
    description:
      'Look up customers of the active legal entity by free-text query. Returns at most 10 matches with id and display name — enough to disambiguate and pass an id to a follow-up tool.',
    input_schema: {
      type: 'object',
      properties: { query: { type: 'string' } },
      required: [],
    },
  },
  {
    name: 'navigate_to_page',
    description: 'Take the user to a page of the app, optionally with filters applied.',
    input_schema: {
      type: 'object',
      properties: { page: { type: 'string' }, params: { type: 'object' } },
      required: ['page'],
    },
  },
]

const serverContext = {
  id: 'global-assistant',
  vars: {
    AVAILABLE_PAGES: '- customers (Clienti)\n- sales-orders (Ordini)\n- invoices (Fatture)',
    BREADCRUMBS: '(none)',
    CURRENT_DATE: new Date().toISOString().slice(0, 10),
    CURRENT_PAGE: 'dashboard',
    SESSION_GOAL: '(none)',
  },
}

async function callModel(messages) {
  const res = await fetch(`${SNAPKIT}/api/chat/gemini`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ messages, tools, serverContext }),
  })
  if (!res.ok) throw new Error(`passthrough ${res.status}: ${(await res.text()).slice(0, 400)}`)
  return res.json()
}

async function executeTool(name, input) {
  if (name !== 'ask_sales_data_expert') {
    return JSON.stringify({ note: `[harness] ${name} not executed in this test` })
  }

  const started = Date.now()
  const res = await fetch(`${API}/api/legal-entities/${LEGAL_ENTITY}/agents/sales-data/tasks`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
      authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ task: input.task }),
  })

  const body = await res.json()
  console.log(`   ↳ backend ${res.status} in ${Date.now() - started}ms`)
  if (body.usage) console.log(`   ↳ expert usage: ${JSON.stringify(body.usage)}`)
  if (body.status === 'failed') {
    console.log(`   ↳ FAILED: ${JSON.stringify(body.error).slice(0, 300)}`)
    return JSON.stringify({ error: body.error })
  }
  return JSON.stringify(body.result)
}

const messages = [{ role: 'user', content: userMessage }]

console.log(`\n\x1b[1mUSER:\x1b[0m ${userMessage}\n`)

for (let turn = 1; turn <= 6; turn++) {
  const response = await callModel(messages)
  const blocks = response.content ?? []

  const text = blocks
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('')
  const toolUses = blocks.filter(b => b.type === 'tool_use')

  if (text.trim()) console.log(`\x1b[1mASSISTANT:\x1b[0m ${text.trim()}\n`)

  if (toolUses.length === 0) {
    console.log(`\x1b[2m[done after ${turn} model turn(s)]\x1b[0m`)
    break
  }

  messages.push({ role: 'assistant', content: blocks })

  const results = []
  for (const use of toolUses) {
    console.log(`\x1b[36m→ toolUse:\x1b[0m ${use.name}(${JSON.stringify(use.input)})`)
    const content = await executeTool(use.name, use.input ?? {})
    console.log(`\x1b[2m   ↳ result: ${content.slice(0, 300)}${content.length > 300 ? '…' : ''}\x1b[0m\n`)
    results.push({ type: 'tool_result', tool_use_id: use.id, content })
  }

  messages.push({ role: 'user', content: results })
}
