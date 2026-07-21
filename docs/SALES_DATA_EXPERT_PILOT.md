# `sales-data` Expert — Running the Pilot

How to stand up the Phase 0 demonstrator and exercise it, either through the
SnapKit chat UI or headlessly. Companion to
[`ASSISTANT_ARCHITECTURE.md`](./ASSISTANT_ARCHITECTURE.md) (why this shape) and
[`SALES_DATA_EXPERT_BENCHMARK.md`](./SALES_DATA_EXPERT_BENCHMARK.md) (how it
scored).

This file exists so the demo is reproducible by someone who was not there when
it was built — including the expected answers, so a wrong one is recognizable
as wrong.

> **Demonstrator, not a merge candidate.** The delegation route is registered
> only when `app()->environment('local')` and is superadmin-gated. The expert's
> tools scope to the legal entity but do **not** enforce the caller's read
> permissions — see `ASSISTANT_ARCHITECTURE.md` §7. Do not expose it further
> without closing that.

---

## 1. What was built, and where

| Piece | Where | Repo |
| --- | --- | --- |
| The expert | `app/Ai/Agents/SalesDataAgent.php` | api, branch `spike/sales-data-agent` |
| Its tools (8) | `app/Ai/Tools/SalesData/` | api |
| Envelope parsing | `app/Ai/EnvelopeParser.php` | api |
| Delegation endpoint | `app/Http/Controllers/Ai/AskAgentController.php` | api |
| Benchmark fixture | `database/seeders/SalesDataBenchmarkSeeder.php` | api |
| Delegation tool | `src/lib/chat/tools/ask-sales-data-expert.ts` | snapkit |
| Registration | `src/lib/chat/tools/global-tools.ts` | snapkit |

The tool set is deliberately **primitives, not answers**: seven read/list tools
plus one general aggregation tool. A `get_overdue_by_customer`-style tool would
have made the benchmark meaningless — it would be measuring a report, not an
agent.

`aggregate_sales_data` is the one to understand: resource + filters + group-by +
measure, computed in SQL. It exists because of the finding in
`ASSISTANT_ARCHITECTURE.md` §2.8 — experts must not do arithmetic.

## 2. Setup

```bash
# api repo
git checkout spike/sales-data-agent
docker compose up -d
php artisan db:seed --class=SalesDataBenchmarkSeeder   # idempotent, re-runnable
```

The seeder purges and recreates its own rows (named customers + `Cliente Volume
NN` + catalogue rows coded `BM-*`), so re-running converges on the same state
rather than accumulating. It seeds ~49 customers, ~166 quotations, ~268 orders,
~144 invoices and ~144 due dates — enough that aggregations must page.

Dates are relative to *today*, so ground-truth figures below hold whenever you
run it, but only against a freshly re-seeded fixture.

**Requires `GEMINI_API_KEY`** in the api `.env` (already present in local dev).

## 3. Driving it from the SnapKit chat UI

1. SnapKit dev server running (`npm run dev`, port 5173). The chat is gated by
   `chatEnabled = dev`, so a dev build is required — it is tree-shaken out of
   production.
2. **Log in as a superadmin** (`admin@moddo.pro`). The delegation route is
   superadmin-gated; a normal user gets a 403 that surfaces in chat as
   "Delegation failed".
3. Active legal entity must be **Moddo S.r.l.** — the tenant the fixture is
   seeded into.
4. Open the assistant from any page under the `(app)` layout and ask in Italian.

## 4. What to ask

### 4.1 Verified — exact answers known

| Ask | Correct answer |
| --- | --- |
| "Quanto ci devono in tutto i clienti, di scaduto?" | **541.059,20 €** across 49 due dates |
| "Chi sono i 3 clienti che ci devono di più?" | Volume 34 = 52.956,80 · Volume 19 = 52.306,40 · Volume 31 = 50.895,60 |
| "Quali clienti hanno scaduto non pagato?" | **27 customers** |
| "Quanto ha comprato Marchetti Arredi per famiglia di prodotto negli ultimi 12 mesi?" | **20.000 €**, all Idraulica |
| "Quanto ci deve Brambilla Impianti?" | **10.000 €** — see the traps |

Note the second row: "owe us most" is ambiguous between total exposure and
overdue only. The agent answered *total* and said so. Both readings are
defensible — what matters is that it declares which one it used. Overdue-only
would be 50.895,60 / 41.642,80 / 39.708,00.

### 4.2 The traps

Each is planted in the fixture to catch one specific way of being wrong.

| Ask | The trap |
| --- | --- |
| "Quanto ci deve Brambilla Impianti?" | Two due dates: 5.000 unpaid, and 8.000 with 3.000 collected. Correct is **10.000**; summing `amount` gives 13.000. Brambilla also has a **TD04 credit note of 1.200** that must not count |
| "Quanto ci deve Cortese Manifattura?" | Carries a **draft invoice of 9.999** with a due date. Drafts are not commercially real — counting it is wrong |
| "Salvi Componenti ha fatture aperte?" | Has orders but **zero invoices**. Must say so rather than infer billing from orders |
| "Quanto abbiamo venduto questo trimestre?" | A **rejected order of 50.000** sits in the current quarter. Including it inflates the answer by 50k |

### 4.3 The two architectural controls

More load-bearing than any correct number.

| Ask | Required behaviour |
| --- | --- |
| "Mostrami le fatture di Brambilla" | **Must NOT delegate.** Should resolve the customer and navigate to the filtered invoices page (`ASSISTANT_ARCHITECTURE.md` §5). Delegating means the tool descriptions are miscalibrated |
| "Quali clienti hanno fatto churn l'anno scorso?" | **Must refuse.** Moddo models no churn concept. It may propose a proxy *labelled as a proposal*. Producing a churn number is the worst failure in the set |

### 4.4 Not yet exercised — where it may still break

| Ask | Why it is interesting |
| --- | --- |
| "Qual è il tempo medio tra preventivo e ordine?" | The quotation→order link lives on the **line** (`sales_order_items.quotation_item_id`), not the document — a migration moved it. Tests whether the surfaced `from_quotation` field is enough |
| "Come stiamo andando questo mese?" | Deliberately vague and unbounded. Designed to blow the step budget; a good answer picks 2–4 measures and says which |
| "Di quali clienti dovrei preoccuparmi?" | No "worry" field exists. Scored observationally, not pass/fail — it measures where the interpretive ceiling currently sits |
| "Quali preventivi non sono mai diventati ordini?" | Answerable by one filtered listing call. Watch whether it delegates unnecessarily |

## 5. What to watch, beyond the number

- **Provenance.** A right answer that does not say where it came from is a
  benchmark **failure**: an unverifiable correct number is indistinguishable
  from an invented one. `sources` should name the tool call and its parameters,
  or the documents.
- **Caveats.** If it truncated, approximated, or resolved an ambiguity by
  choosing, it must say so. Silent completeness is the failure the `caveats`
  field exists to prevent.
- **Whether it delegated at all.** Half the architecture's claim is that cheap
  questions stay cheap.

When something misbehaves, the endpoint returns a `trace` alongside the
envelope listing every tool call and its arguments — that usually shows the
cause immediately (wrong filter, no paging, arithmetic done in-model).

## 6. Headless harness

The chat UI needs a browser session; the harness does not, which makes it the
faster loop for iterating on prompts and tools. It drives the **real** pieces —
the real passthrough (so the real system prompt and Anthropic↔Gemini
translation), the real tool descriptions, the real backend expert — and stands
in only for the client-side loop and the browser session (bearer token instead
of a session cookie).

Mint a token:

```bash
php artisan tinker --execute='
tenancy()->initialize(App\Models\Tenant::where("vanity","moddo")->first());
$u = App\Models\User::where("is_superadmin", true)->first();
echo "TOKEN=".$u->createToken("pilot")->plainTextToken."\n";
echo "LE=".App\Models\LegalEntity::first()->id."\n";'
```

Then:

Then, from the SnapKit repo root (dev server must be up on 5173):

```bash
MODDO_TOKEN='…' MODDO_LE='…' node scripts/orchestrator-harness.mjs "la tua domanda"
```

The harness prints each `toolUse` with its arguments, the backend status and
`usage`, the envelope, and the final composed answer — i.e. the transcript that
is the actual deliverable of Phase 0.

Only `ask_sales_data_expert` is actually executed; the UI tools report back as
not-executed stubs, which is enough to observe *whether the orchestrator chose
to call them* — the point of the Q10 control.

## 7. Calling the endpoint directly

```
POST {API}/api/legal-entities/{legalEntity}/agents/sales-data/tasks
Authorization: Bearer <superadmin token>
Content-Type: application/json

{ "task": "Total overdue receivables, grouped by customer." }
```

Returns the §3.2 envelope, synchronously:

```json
{
  "status": "completed",
  "result": { "answer": "…", "data": [...], "sources": [...], "caveats": [] },
  "usage": { "turns": 3, "input_tokens": 11354, "output_tokens": 192, "duration_ms": 4308 },
  "trace": { "tool_calls": [ { "name": "aggregate_sales_data", "arguments": {…} } ] }
}
```

`trace` is spike-only and not part of the documented contract — it exists so the
benchmark can score paging behaviour and turn count, which the envelope alone
does not reveal.

Note the divergence from `ASSISTANT_ARCHITECTURE.md` §3.2: the contract there
creates a task (`202`) and streams progress over SSE. The pilot collapses that
to one synchronous hop. This is the documented degradation — the envelope is
the stable part, the transport is allowed to evolve — and keeps the demo's diff
small enough to be judged on the strategy rather than on the plumbing.
