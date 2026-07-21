# Assistant Architecture — Frontend Orchestrator, Backend Experts

Strategy document for growing the in-app assistant from a UI helper into a
multi-purpose assistant: a **guide** (navigate, explain the app), an
**information retriever** (data, documentation, third-party services), and an
**operator** (act on the user's data). It defines who owns what between
frontend and backend, the contracts between them, and why each choice was made.

Companion documents:

- [`ADMIN_CHAT_API.md`](./ADMIN_CHAT_API.md) — the backend contract for the
  admin assistant (authenticated LLM passthrough, config PUT hardening). The
  passthrough endpoint defined there (§2) is a **prerequisite** of this
  document and is referenced below, unchanged.
- [`.blueprints/chat/admin-assistant.md`](../.blueprints/chat/admin-assistant.md)
  — tool design rules for the admin context. Its Rule 1 (no tenant/entity
  params) is inherited here and generalized.

---

## 1. The architecture at a glance

```
┌──────────────────────────── FRONTEND (SvelteKit app) ────────────────────────────┐
│                                                                                  │
│  User ⇄ Chat UI ⇄ ORCHESTRATOR (@diaphora/chat loop, client-side)                │
│                     │                                                            │
│                     │ tool set = two layers:                                     │
│                     │                                                            │
│                     ├── GLOBAL LAYER (always available)                          │
│                     │     navigate_to_page, search_customers, show_toast, …      │
│                     │     search_docs, get_doc            (retrieval, planned)   │
│                     │     ask_data_expert, ask_acube_expert  (delegation, new)   │
│                     │                                                            │
│                     └── CONTEXTUAL LAYER (pushed by the active page)             │
│                           e.g. admin editor: get_config_node, add_page, …        │
│                                                                                  │
└───────────┬──────────────────────────────┬───────────────────────────────────────┘
            │                              │
            │ model calls                  │ delegation calls (user's bearer token)
            ▼                              ▼
┌────────── BACKEND (Laravel) ─────────────────────────────────────────────────────┐
│                                                                                  │
│  LLM passthrough                 EXPERT AGENTS (server-side LLM loops)           │
│  (ADMIN_CHAT_API §2)               data-expert      → Moddo APIs                 │
│  auth'd, prompt-less,              acube-expert     → A-Cube API (secrets here)  │
│  stateless                         …one per domain that earns it                 │
│                                                                                  │
│  Domain APIs (orders, customers, config, …) — authorization enforced here        │
└──────────────────────────────────────────────────────────────────────────────────┘
```

Division of labor, in one line: **the orchestrator owns dialogue, composition,
navigation and UX; backend experts own retrieval and interpretation; domain
APIs own authorization and validation.**

---

## 2. Principles and why

### 2.1 The orchestrator lives in the frontend

The assistant must talk to the user, drive the UI (open views, apply filters,
highlight state), and read ambient context (current page, current selection).
All of that exists only in the frontend. Moving the loop server-side would
mean proxying every UI interaction — inverting the architecture to save
nothing.

This is already how the app works: the `@diaphora/chat` orchestrator runs
client-side, system prompts are composed per-context in
`src/lib/chat/server/chat-contexts/`, and model calls go through a passthrough
(`/api/chat/gemini` today; the authenticated Laravel endpoint of
ADMIN_CHAT_API §2 in production).

**What this does NOT mean:** the frontend is not a trust boundary. See §2.7.

### 2.2 Not everything is an agent — the escalation ladder

Each capability climbs this ladder only as far as it needs:

| Level | Mechanism | Use when | Example |
| --- | --- | --- | --- |
| 1 | Ambient context | The model just needs to *know* it | current page, selection |
| 2 | Deterministic tool | One API call answers it | `search_customers`, "list open orders of X" |
| 3 | Retrieval tool | Search + fetch answers it | business docs (`search_docs` / `get_doc`) |
| 4 | **Expert agent** | Multi-step reasoning over bulky intermediate data | "what happened on A-Cube yesterday?" |

The test for level 4 is **context isolation**, not "expertise": an expert that
pages through 200 events and answers "the SDI rejected 3 invoices for VAT
mismatches" keeps those 200 events in *its* context, not the conversation's.
If a domain doesn't have that problem, an agent adds only latency, cost, and
fidelity loss per hop.

Practical consequence: at day one we expect **one or two experts** (data,
A-Cube), documentation as plain retrieval tools, and most integrations as
deterministic tools. The delegation infrastructure is built for the few cases
that need it — not as the default shape of everything.

### 2.3 Experts are tools

From the orchestrator's point of view, an expert **is a tool** — one that runs
an LLM loop instead of a function. The orchestrator calls
`ask_acube_expert({ task })`, gets a result, and neither knows nor cares that
eight internal tool round-trips happened behind it.

The tool **description is the routing mechanism**: the orchestrator knows it
can delegate because the description says so ("Use for questions about
e-invoicing transmission status, SDI events, A-Cube errors. Returns a
synthesized account with event references."). One tool per expert with a crisp
description beats a generic `delegate(agent, task)` dispatcher — the generic
form makes the model take two decisions with less signal.

### 2.4 Two tool layers: global capabilities, contextual views

- **Global layer** (always in the tool set): navigation, entity lookup,
  documentation retrieval, expert delegation. Nothing here depends on which
  page is open. Already real: `src/lib/chat/tools/global-tools.ts`.
- **Contextual layer** (pushed/popped by the active page via `usePageChat`):
  tools that manipulate the current view, plus domain writes designed for that
  page (the admin editor's config tools).

The rule: **per page only what touches the page; knowledge and data live in
the global layer.** This keeps "show me Foobar's invoices" from requiring
navigation *before* the query — the lookup is global, and navigation is the
*output* of the operation (`navigate_to_page` with filters in the URL), not
its precondition.

Delegation is what keeps the global layer affordable: one expert compresses an
entire domain into a single always-available tool, instead of 30 granular
tools bloating every conversation.

### 2.5 Flat hierarchy

One level only: orchestrator → experts. **Experts never call experts.** If two
domains must be combined, the orchestrator combines them (it can call two
experts in parallel in one turn). Nested delegation multiplies latency,
compounds errors, and makes traces unreadable.

### 2.6 Experts are read-only; writes stay near the user

Experts retrieve and interpret; they do not mutate. Writes remain orchestrator
tools, where the confirmation UX lives (admin-assistant Rule 4:
`request_user_choice` before destructive changes).

When experts eventually need to drive writes, the pattern is
**propose-then-apply**, not write-capable agents: the expert returns a typed
`proposed_action` in its result, and the orchestrator exposes a single generic
`apply_action` tool gated by user confirmation. Competence about *what* to
write lives in the expert; control over *whether* to write stays where the
user is. Server-side validation (422s) remains the backstop either way.

### 2.7 Security: authorization is server-side, per call

A client-side orchestrator runs on user-controlled territory — a hostile user
can forge any tool call without going through the model. Therefore:

- Every call (direct tool or delegation) carries the **user's own bearer
  token** and is authorized server-side like any normal API request. The
  expert can never read data its caller couldn't.
- The prompt and conversational gating are **UX, not a security boundary**.
- Third-party credentials (A-Cube keys, etc.) exist **only inside experts**,
  server-side. They never reach the frontend in any form.
- Inherited from admin-assistant Rule 1, generalized: **no tool or delegation
  request ever takes `tenant` / `legal_entity` as a model-provided parameter.**
  The entity comes from the URL/session. A hallucinated entity name must not
  be able to become a query against the wrong tenant.

### 2.8 Experts retrieve and interpret — they never compute

An expert may query, page, join, filter and interpret. It must **never do
arithmetic**. Every total, average, ranking or percentage in an answer has to
come from a tool that computed it in the database.

This is not a style preference, it is measured. The Phase 0 pilot, asked for
total overdue receivables, retrieved all 49 relevant rows in one page, applied
the right filter and the right measure — and then added them up itself,
answering **406.876,20 €** against a true **541.059,20 €**. A 25% error,
delivered to the user as fact, with no caveat raised. Nothing about the
retrieval was wrong; the model simply cannot sum dozens of floats, and is
equally confident whether or not it just did.

That failure shape is the dangerous one: "approximately right" is
indistinguishable from "right" to a reader, so it does not surface as a bug —
it surfaces as a number someone acts on. Adding an SQL-backed aggregation
primitive made the same question exact, and also **34% cheaper and 41% faster**,
because paging rows into context in order to add them up was always the
expensive path.

The corollary for tool design: give experts general aggregation primitives
(resource + filter + group-by + measure), **not** per-question report endpoints.
The agent must keep deciding *what* to aggregate — that judgement is why it is
an agent — while the counting happens where counting is exact.

### 2.9 Sync at the model level, async at the transport level

From the model's perspective delegation is always synchronous: tool call →
tool result. The sync/async question is about the **plumbing** underneath. A
single 10–60s HTTP request is fragile (proxy timeouts, lost work on retry, a
mute spinner). The contract below is therefore designed as a job: creation
returns immediately, progress streams, and the orchestrator runtime — not the
model — waits and injects the final result as the tool result. Bonus: two
delegations issued in the same model turn run as two concurrent jobs.

---

## 3. Contracts

### 3.1 Orchestrator ⇄ model

Unchanged from [`ADMIN_CHAT_API.md`](./ADMIN_CHAT_API.md) §2: authenticated,
prompt-less, stateless passthrough. The frontend owns the system prompt and
the tool loop. Expert tool *definitions* are part of the `tools` array like
any other tool — the passthrough never executes them.

### 3.2 Orchestrator ⇄ expert (delegation)

```
POST /api/legal-entities/{legalEntity}/agents/{agent}/tasks
Authorization: Bearer <the user's existing token>
```

`{agent}` is the expert's id (`data`, `acube`, …). 404 for unknown agents,
401/403 as usual. The legal entity comes from the path — resolved by the
frontend from the session, never by the model (§2.7).

**Request:**

| Field | Type | Req | Meaning |
| --- | --- | --- | --- |
| `task` | string | ✔ | The task in natural language, self-contained. Written by the orchestrator model |
| `context` | object | — | Structured hints the orchestrator already has (e.g. `{ "customer_id": "…" }`). Saves the expert a lookup; never trusted for authorization |
| `constraints` | object | — | `{ "max_turns": 12, "timeout_s": 60 }` — caps on the expert's internal loop. Backend enforces its own ceilings regardless |

**Response (creation):** `202 Accepted`

```json
{ "task_id": "tsk_01J…", "events": "/api/legal-entities/{le}/agents/{agent}/tasks/tsk_01J…/events" }
```

**Progress (SSE on the `events` URL):** consumed by the frontend runtime to
show live status in the chat ("reading yesterday's SDI events…") while the
model waits. Terminal event carries the result.

> **SSE is recommended, not strictly required.** An expert run can take tens
> of seconds, and a silent wait of that length reads as a hang — progress
> events are what make the latency acceptable UX. But nothing in the
> architecture depends on them: the polling fallback below implements the
> exact same contract, and a first iteration can ship with it and add SSE
> when the latency justifies the effort.

```
event: progress   data: { "message": "querying A-Cube events for 2026-07-16" }
event: progress   data: { "message": "38 events, filtering rejections" }
event: result     data: { …the result envelope below… }
```

**Result envelope** — the shape the orchestrator injects as the tool result:

```json
{
  "status": "completed",            // completed | failed
  "result": {
    "answer": "Yesterday A-Cube reported 3 invoice rejections from SDI, all for VAT number mismatches on customer Rossi S.p.A. (invoices 2026/0142, 0143, 0145). 35 other invoices were delivered normally.",
    "data": {
      "rejections": [
        { "invoice": "2026/0142", "reason": "VAT mismatch", "sdi_code": "00305", "at": "2026-07-16T09:14:00Z" }
      ]
    },
    "sources": [
      { "kind": "acube_event", "id": "evt_9f2…", "at": "2026-07-16T09:14:00Z" }
    ],
    "caveats": ["A-Cube pagination covered 2026-07-16 00:00–24:00 Europe/Rome only"]
  },
  "usage": { "turns": 5, "input_tokens": 18234, "output_tokens": 912 }
}
```

> **The envelope may not be provider-enforced.** Ideally it is a structured-output
> schema the provider guarantees. Gemini does not allow this: it rejects tool
> calling combined with a JSON response mime type (`INVALID_ARGUMENT — Function
> calling with a response mime type: 'application/json' is unsupported`), and an
> expert has tools by definition. On Gemini the envelope is therefore a **prompt
> contract**, which is a contract the model can break — so it must be parsed and
> validated server-side, and a malformed envelope must be returned as
> `status: "failed"`, never passed through half-filled. Providers that support
> both (OpenAI) allow the strict version; today only `GEMINI_API_KEY` is
> configured. Verified in Phase 0 — see the pilot document.

Design intents behind the envelope:

- **`answer` + `data` + `sources`, not prose alone.** The orchestrator will
  *reuse* the output (compose an email, fill a table); prose-only degrades on
  the second hop, and an aggregate number without provenance is easy to
  hallucinate and impossible to verify. Every claim in `answer` should be
  backed by `data`/`sources`.
- **`caveats`** — what the expert did *not* cover (truncated pagination,
  partial time window). Silent truncation reads as "covered everything".
- **`usage`** — delegation is a cost that can run away silently; surface it.
- **Failures are results too**: `{ "status": "failed", "error": { "code":
  "timeout" | "budget_exceeded" | "upstream_unavailable", "message": "…" } }`
  with 2xx on the task resource. The orchestrator model can read it and tell
  the user, or retry with a narrower task.

**Statelessness:** each task is one-shot and self-contained. No conversation
persists between orchestrator and expert; a follow-up question is a new task
(the orchestrator includes what's needed in `task`/`context`). This keeps
retries, caching and debugging trivial. A `previous_task_id` hint can be added
later *if usage shows repeated re-derivation* — not before.

**Fallback profile:** if SSE is impractical in a first iteration, the same
contract degrades to `POST` + polling `GET …/tasks/{task_id}` returning the
same envelope with `status: "running"` until terminal. The envelope is the
stable part; the transport can evolve.

### 3.3 Expert discovery

Static at first: the frontend ships the tool definitions
(`ask_data_expert`, `ask_acube_expert`) with hand-written descriptions,
exactly like its other global tools. A `GET /api/legal-entities/{le}/agents`
returning `{ id, description, input_hints }` is a later option if experts
multiply or vary per tenant — not needed to start.

### 3.4 What each expert is, backend-side

An expert = a system prompt + a scoped tool set + a loop, executed server-side
against the same LLM provider as the passthrough. Its tools call the domain
APIs **with the caller's token** (or internal equivalents enforcing the same
authorization). Requirements per expert:

- hard caps: max internal turns, wall-clock timeout, token budget
- traceability: `task_id` correlates orchestrator log ↔ expert internal trace
- prompt-injection awareness: everything the expert reads (order notes,
  customer names, third-party payloads) is untrusted data, not instructions

---

## 4. Worked example — delegation

> **User:** "Write me an email explaining to customer Rossi what happened in
> A-Cube yesterday"

```
FRONTEND (orchestrator)                          BACKEND (Laravel)
───────────────────────                          ─────────────────

1  user message
   └─ POST <llm-passthrough>            ──────►  auth ✓, forward to provider
      system: global-assistant prompt
      tools:  [global layer + page layer]
   ◄──────────────────────────────────────────   model responds:
      toolUse: ask_acube_expert({
        task: "Summarize what happened on
               A-Cube for legal entity's
               invoices on 2026-07-16,
               focusing on customer Rossi
               S.p.A. Include invoice numbers
               and rejection reasons."
      })

2  runtime executes the tool call:
   └─ POST /api/legal-entities/{le}/agents/acube/tasks
      Authorization: Bearer <user token>  ─────► auth ✓ (user may read invoices)
   ◄─ 202 { task_id, events }                    spawn expert loop:
                                                 ┌──────────────────────────────┐
   (chat UI shows live progress          ◄─SSE─  │ its own prompt + A-Cube tools│
    from the events stream;              ◄─SSE─  │ list_events(2026-07-16)      │
    the model turn is simply                     │ → 38 events (stay HERE, not  │
    "waiting for its tool result")               │   in the conversation ctx)   │
                                                 │ get_event(evt_9f2…) …        │
                                                 │ synthesize answer + sources  │
                                                 └──────────────────────────────┘
   ◄─ event: result { status: "completed",
        result: { answer, data: { rejections: […] }, sources, caveats } }

3  runtime injects the envelope as the toolResult
   └─ POST <llm-passthrough>            ──────►  (next model turn)
   ◄──────────────────────────────────────────   model composes the email from
                                                 result.answer + result.data,
                                                 cites invoice numbers from data
      assistant: "Here's a draft: …"
      (optionally toolUse: show_structured_data
       to render the rejection list)

4  user reads the draft in the chat. Nothing was sent anywhere —
   composing is not sending (sending would be a gated write tool).
```

Where things live, per this example:

| Concern | Owner |
| --- | --- |
| Understanding the user, choosing to delegate, wording of `task` | Orchestrator model (frontend) |
| Executing the delegation HTTP call, waiting, progress UX | Frontend runtime |
| A-Cube credentials, pagination, event interpretation | Expert (backend) |
| "Can this user see these invoices?" | Domain API authorization (backend) |
| Composing the email, presenting it, any follow-up edit | Orchestrator model (frontend) |
| The 38 raw events | **Expert's context only** — the conversation sees ~10 lines |

## 5. Counter-example — no delegation needed

> **User:** "Show me the invoices of Foobar S.R.L."

```
1  model → toolUse: search_customers({ query: "Foobar" })      (global tool)
2  runtime → GET /customers?search=Foobar → toolResult: uuid
3  model → toolUse: navigate_to_page({ page: "invoices",
                                       params: { customer: "<uuid>" } })
4  runtime navigates; the page reads filters from the URL
5  model: "Here are Foobar S.R.L.'s invoices."
```

Two deterministic global tools, zero experts, no backend work beyond existing
APIs. This is the ladder (§2.2) in action: **delegation is the exception that
justifies its infrastructure, not the default path.** If a flow can be
expressed as chained deterministic tools, it must be.

(Prerequisite this surfaces: listing pages should read their filters from URL
params, so navigation composes with filtering in one step.)

---

## 6. Rollout

| Phase | Scope | Backend work |
| --- | --- | --- |
| 0 | **Pilot experiment** (§6.1) — **BUILT, see §6.2**: one quickly-buildable expert behind a minimal §3.2 (polling transport is fine, envelope is mandatory), dev-only, evaluated against questions with known answers | Minimal expert runtime + the pilot expert |
| 1 | Global retrieval tools (`search_docs`, `get_doc`) over existing docs surface — independent of Phase 0, can run in parallel | None (endpoints exist) |
| 2 | Harden delegation: SSE progress, `usage` reporting, caps and tracing reviewed; promote the pilot to production quality | Incremental on Phase 0 |
| 3 | Second expert (`acube` is the likely candidate) if Phase 0 validated the model | One expert |
| 4 | Propose-then-apply (`proposed_action` in envelope + gated `apply_action` tool) | Typed action catalog + validation |

Phase 0 is deliberately an *experiment*, not a feature: its goal is to answer
"does the delegation model work as we expect?" with the smallest possible
build. The expensive part (the delegation runtime — auth propagation, caps,
tracing, envelope) gets validated on one case; adding experts afterwards is
"just" a prompt and a tool set.

### 6.1 The pilot: a `sales-data` expert

The best candidate is a read-only expert over the **active sales cycle**
(customers, quotations, sales orders, invoices, due dates, payments). Chosen
over the alternatives because:

- **Fastest to build.** Its internal tools query models that already exist
  (`Quotation`, `SalesOrder`, `Invoice`, `InvoiceDueDate`, `InvoicePayment`,
  `ProductFamily`) through the app's own scopes — in-process, no HTTP hop, no
  new domain endpoints. It also follows a pattern the codebase already has
  (`LegalEntityConfigAgent`), so the diff reads as idiomatic rather than novel.
- **Genuinely needs an agent.** The interesting questions require paging,
  joining and aggregating across resources — exactly what listing filters
  can't do and what would blow the conversation's context if done by the
  orchestrator. It is the context-isolation test (§2.2) passed cleanly.
- **Verifiable.** Every answer can be checked against the UI or the existing
  Stats KPIs — an experiment needs ground truth, and this domain has it.

> **Correction, from reading the API.** An earlier draft of this section listed
> example tasks that turned out to be *one filtered call away*: Moddo's listing
> endpoints already expose computed-status filters (`conversion_status`,
> `fulfillment_status`, `payment_status`), so "quotations never converted to
> orders" and "delivered orders awaiting invoicing" do **not** justify an
> agent. This raises the bar for the pilot rather than lowering it, and is
> itself evidence that the ladder in §2.2 is calibrated correctly: in Moddo,
> most questions genuinely are level 2.

What survives that bar — and therefore what the pilot must be judged on — is
aggregation and ranking, cross-resource joins (order lines × items × product
families), derived filter values, multi-hop lifecycle chains, and above all
**interpretive questions** ("which customers should I worry about?") that have
no literal field behind them. The first four could in principle be answered by
writing more endpoints; the last one is what decides whether an *agent* was the
right shape at all.

The expert's system prompt should lean on the business docs the API already
exposes (entity lifecycle states, computed statuses — see the `moddo-api`
business docs surface), so it interprets states correctly instead of guessing.

**The evaluation set is
[`SALES_DATA_EXPERT_BENCHMARK.md`](./SALES_DATA_EXPERT_BENCHMARK.md)**, written
before the expert exists so it can't be shaped around what the agent turns out
to do well. It defines the fixture, the ground-truth method, and the pass
criteria — including two control questions: one that must *not* be delegated,
and one that is unanswerable and must be refused. Fail or pass, the experiment
prices the whole strategy for the cost of one small expert.

### 6.2 Phase 0 status — built and run

The pilot exists. It was built on branch `spike/sales-data-agent` in the API
repo as a **demonstrator, not a merge candidate**: its purpose is to let the
strategy be judged against real transcripts rather than a design document.

- **How to run it, and what to ask:**
  [`SALES_DATA_EXPERT_PILOT.md`](./SALES_DATA_EXPERT_PILOT.md)
- **How it scored, and what broke:**
  [`SALES_DATA_EXPERT_BENCHMARK.md`](./SALES_DATA_EXPERT_BENCHMARK.md) §5

What the experiment settled, in short:

| Claim under test | Outcome |
| --- | --- |
| The backend can host an expert cheaply | **Yes, cheaper than assumed** — `laravel/ai` and a working agent already exist (§7); the expert is one class plus its tools |
| Tool descriptions route delegation correctly | **Yes** — "show me Brambilla's invoices" was *not* delegated, it navigated (§5's counter-example, unprompted) |
| The orchestrator can combine experts | **Yes** — a compound question issued two delegations in one turn, then composed |
| An expert knows the edge of its competence | **Yes** — the unanswerable control ("which customers churned?") was refused, nothing invented |
| Answers are trustworthy | **Only after §2.8** — before the aggregation primitive, a 25% error was reported as fact |

The last row is the reason to run experiments rather than reason about them:
that failure was invisible from the design, and would have discredited the
architecture for a reason that had nothing to do with the architecture.

Deliberately **not** carried into the pilot, and still owed before any non-dev
exposure: the 202/SSE transport (the pilot is a synchronous POST — §3.2 allows
the transport to evolve, the envelope is the stable part) and per-permission
scoping inside expert tools (§7).

## 7. Known risks / open points

- **Runaway cost.** An expert loop is spend without a user watching each step.
  Hard caps (§3.4) are a requirement, not an option, from Phase 0.
- **~~Second LLM integration point.~~ Largely already paid for.** This was
  drafted as the main structural ask — "the backend gains an agent runtime".
  Reading `moddopro/api` shows it mostly has one: `laravel/ai` is a dependency,
  `app/Ai/Agents/LegalEntityConfigAgent.php` is a working agent (instructions +
  tool set, `#[MaxSteps(10)]` — the §3.4 cap already enforced), its tools follow
  a `description()`/`handle()`/`schema()` contract equivalent to what an expert
  needs, `ChatLegalEntityConfigController` is the invocation pattern, and
  `::fake()` makes agents testable without spend. A second expert is closer to
  "one agent class plus a few tools" than to a new platform. The genuinely new
  parts are the **result envelope** (the existing agent returns prose) and
  **per-user authorization inside expert tools** (see below).
- **In-process experts don't inherit authorization for free.** §2.7's guarantee
  ("the expert can never read data its caller couldn't") arrives automatically
  when delegation is an HTTP call carrying the user's token. An expert running
  **in-process** in Laravel — which is how `LegalEntityConfigAgent` works, and
  the cheapest way to build the pilot — must apply the caller's scoping inside
  each tool explicitly. The permission vocabulary exists (`permission:view-invoices`
  gates the KPI routes), but wiring it into expert tools is deliberate work,
  not a side effect. Getting this wrong is a data leak, so it belongs in the
  pilot's review even though the pilot is dev-only.
- **Provenance discipline.** The envelope allows `answer`-only responses;
  expert prompts must require `data`/`sources` for factual claims, or the
  two-hop chain will invent numbers convincingly.
- **Headless future — a payoff, not just a risk.** A WhatsApp or Slack
  assistant, or a scheduled digest ("every morning, summarize overdue
  payments"), has no frontend orchestrator. This architecture is what makes
  those cheap later: the experts are stateless, channel-agnostic, and
  addressed through a plain HTTP contract, so a headless deployment is *a
  different orchestrator in front of the same experts* — a small server-side
  loop whose "UI tools" are replaced by channel primitives (send a Slack
  message, reply on WhatsApp), while retrieval and interpretation are reused
  unchanged. All the competence investment (expert prompts, tool sets,
  provenance discipline) transfers 1:1. Nothing to build now — but it is a
  strong reason to keep frontend assumptions out of the expert contract:
  a `task` must never presuppose a page, a selection, or a UI state.
