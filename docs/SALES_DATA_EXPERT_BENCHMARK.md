# `sales-data` Expert — Phase 0 Benchmark

The evaluation set for the pilot described in
[`ASSISTANT_ARCHITECTURE.md`](./ASSISTANT_ARCHITECTURE.md) §6.1. Written
**before** the expert exists, on purpose: a benchmark authored after the agent
is built gets unconsciously shaped around what the agent already does well, and
then measures nothing.

The deliverable of Phase 0 is not the code. It is the **transcript** of these
questions with verified answers, latency and cost — that is what tells us
whether the delegation model earns its infrastructure.

---

## 1. What we found before writing the questions

We read the actual listing endpoints in `moddopro/api` before drafting. The
finding matters enough to record, because it **raises the bar** and corrects
`ASSISTANT_ARCHITECTURE.md` §6.1:

Moddo's listing endpoints are richer than that section assumed. They already
expose **computed-status filters**, not just column filters:

| Endpoint | Notable filters |
| --- | --- |
| `GET /quotations` | `state`, **`conversion_status`** (`none`/`partial`/`full`), `customer_id` |
| `GET /sales-orders` | `state`, **`fulfillment_status`** (`none`…`fully_shipped`), `document_date_from/to`, `historical` |
| `GET /invoices` | `state`, **`payment_status`**, `document_date_from/to`, `customer_id` |
| `GET /invoice-due-dates` | `due_date_from/to`, `payment_status`, `customer_id`; defaults to *open* rows of *collectable* invoices |
| `GET /customers` | `commercial_status`, `tags` |

Consequences:

- **Two of §6.1's example tasks are dead.** "Quotations sent >30 days ago never
  converted to orders" is `?conversion_status=none&document_date_to=<date>` —
  one call. "Delivered orders still waiting to be invoiced" is what
  `/invoiceable-documents` already returns. Neither justifies an agent.
- **One is half-dead.** "Overdue unpaid due dates" retrieves in a single call
  (`?due_date_to=today`); only the per-customer aggregation and the paging need
  an agent.

This is not bad news — it is §2.2's escalation ladder being *right*: in Moddo
most questions genuinely are level 2. It does mean the pilot must be judged on
what survives that bar, so the questions below are chosen against it
deliberately.

### The bar

A question qualifies only if it needs at least one of:

| # | Property | Why a filtered listing can't do it |
| --- | --- | --- |
| **A** | Aggregation / ranking | No endpoint aggregates arbitrary dimensions. The Stats KPIs aggregate *fixed* ones |
| **B** | Cross-resource join | e.g. order lines × items × product families — no endpoint spans these |
| **C** | Derived filter value | One query's *output* is the next query's *input* |
| **D** | Interpretation | The question has no literal field behind it; the agent must decide what it means |
| **E** | Multi-hop lifecycle | Following quotation → order → invoice → payment |

Property **D** is the one to watch. A–C are mechanical and could, in principle,
be answered by writing more endpoints. **D cannot** — and it is the property
that decides whether an *agent* was the right shape, rather than a report.

---

## 2. Method

**Fixture.** A dedicated deterministic seeder (`SalesDataBenchmarkSeeder`),
not `ModdoTenantSeeder`. Its data is authored so that every expected answer is
small, hand-checkable, and includes at least one deliberate edge case (a
partially-paid due date, a credit note, an archived customer). Reusing the demo
seeder would make expected answers drift whenever someone edits it.

**Ground truth.** Each question below carries a computation method — an Eloquent
query using *the app's own scopes* where they exist. Using the app's scopes is
deliberate: it verifies the agent against the same definition of "settled" or
"collectable" the UI uses, so a mismatch means the agent is wrong rather than
the two of us disagreeing about vocabulary.

**Scoring.** Per question, record:

| Field | Meaning |
| --- | --- |
| `correct` | Does `answer` match ground truth? |
| `provenanced` | Are the numbers in `answer` backed by `data`/`sources`? An unbacked correct number scores **fail** |
| `turns` / `tokens` / `latency` | From the envelope's `usage` |
| `caveats_honest` | If it truncated or approximated, did it say so? |

`provenanced` failing while `correct` passes is the **most dangerous** outcome,
not a partial success: it means the pipeline produces convincing unverifiable
numbers, which is exactly the failure mode §7 warns about.

---

## 3. The questions

### Group 1 — aggregation and ranking (A)

**Q1. "Which customers have overdue unpaid amounts, and how much each?"**
Properties: A. Retrieval is one call; the agent must page it and aggregate per
customer, using `amount − paid_amount` rather than `amount`.
*Ground truth:* `InvoiceDueDate::collectable()->open()->where('due_date','<',today)`
grouped by `invoice.customer_id`.
*Edge case the fixture plants:* one partially-paid due date, to catch an agent
that sums `amount` and overstates exposure.

**Q2. "Top 5 customers by open sales order value this quarter."**
Properties: A, C (the quarter boundary must be derived from today's date).
*Ground truth:* `SalesOrder` open+approved, `document_date` within quarter,
summed per customer, ranked.
*Watch for:* whether it takes "open" literally as `state=open` or correctly
includes approved-but-unfulfilled. Either can be defended — what matters is
whether it **states which reading it used**. Silent choice = fail on `caveats_honest`.

**Q3. "What's our average time from quotation to order, for converted quotations?"**
Properties: A, E. Requires pairing each converted quotation to its order and
averaging a date delta.
*Ground truth:* per-quotation delta, mean, over `conversion_status = full`.

### Group 2 — cross-resource joins (B)

**Q4. "What has customer X bought in the last 12 months, by product family?"**
Properties: A, B. Order lines × items × product families. No endpoint spans
this chain — the strongest mechanical case in the set.
*Ground truth:* `SalesOrderItem` joined to `Item` → `ProductFamily`, summed.

**Q5. "Which product families are we selling less of this year than last?"**
Properties: A, B, C. Two aggregations plus a comparison.
*Watch for:* whether it compares like-for-like periods (year-to-date vs
year-to-date) or full-year-vs-partial-year — a silent apples-to-oranges here is
a realistic and dangerous failure.

### Group 3 — multi-hop lifecycle (E)

**Q6. "Customer X asks why they haven't received invoice N. What happened?"**
Properties: C, E, D. Resolve the customer, find the invoice, read its state and
history, explain in business terms.
*Ground truth:* the invoice's state + transitions.
*This is the question closest to real support use* — and the one whose answer
must be prose grounded in `sources`, not a table.

**Q7. "Which approved orders have been sitting unfulfilled the longest?"**
Properties: A, C. `fulfillment_status` filters, but "longest sitting" requires
computing and ranking an age.

### Group 4 — interpretation (D) — the decisive group

**Q8. "Which customers should I worry about?"** — *observational, not scored.*
Properties: D, A, B. There is no "worry" field. A good answer picks a defensible
definition (overdue exposure, or a drop in ordering), **states the definition**,
and answers it. A bad answer invents a metric silently, or refuses entirely.
*Ground truth:* none — we record what it does and judge it by eye.

Deliberately **excluded from the go/no-go**. A polite refusal here is an
acceptable outcome for the spike, and this question is not what we are trying to
prove yet. It stays in the set because it is the most valuable question in it:
"which customers should I worry about" is precisely the shape a filtered listing
can never take, and the day this answer becomes good is the day the strategy
stops being "a more capable chatbot" and becomes conversational business
intelligence. Treat the transcript as evidence about **where that ceiling
currently sits**, not as a test to pass.

**Q9. "How are we doing this month?"**
Properties: D, A. Deliberately vague and broad. The interesting failure mode is
an agent that tries to answer *everything* and burns its turn budget.
*Pass:* picks 2–4 relevant measures, says what it chose, stays within caps.

### Group 5 — controls (the ones designed to be failed badly)

**Q10. "Show me Foobar S.R.L.'s invoices."** — *control: should NOT be delegated.*
Scored at the **orchestrator** level, not the expert's: the correct behaviour is
`search_customers` + `navigate_to_page` (`ASSISTANT_ARCHITECTURE.md` §5). If the
orchestrator delegates this, the tool descriptions are wrong — a finding about
the *architecture*, which is precisely what Phase 0 is for.

**Q11. "Which customers churned last year?"** — *control: unanswerable.*
Moddo has no churn concept. Correct behaviour is to say so, optionally
proposing a proxy ("no orders in 12 months") **as a proposal, not as an answer**.
*Fail:* inventing a churn number. This is the single most important question in
the set — it measures whether the expert knows the edge of its own competence,
and an agent that fails it cannot be trusted on any of the others.

---

## 4. Pass criteria for Phase 0

The pilot is a **go** if:

1. **≥ 7/8** scored questions (Q1–Q7, Q9) correct against ground truth. Q8 is
   observational and excluded — see above.
2. **100%** of numeric claims provenanced. No exceptions — one confident
   unbacked number is a systemic finding, not a rounding error.
3. **Q11 refused correctly.** Non-negotiable, independent of the rest.
4. **Q10 not delegated.** If it is, the fix is tool descriptions, not the expert.
5. Latency tolerable without progress events (this is also how we decide
   whether SSE is required in Phase 2, per §3.2).
6. Caps demonstrably stop a runaway loop — verified by deliberately running Q9
   with `max_turns` set low.

A **no-go** is a valid and cheap outcome: the whole strategy gets priced for
the cost of one small expert. What would make it a *bad* experiment is an
ambiguous result, which is what the fixture determinism and the provenance
rule above are designed to prevent.

---

## 5. First run — findings

The expert is implemented on branch `spike/sales-data-agent` in the API repo.
**To reproduce any of this — setup, questions, expected answers — see
[`SALES_DATA_EXPERT_PILOT.md`](./SALES_DATA_EXPERT_PILOT.md).**

### 5.1 Structured output is NOT available on Gemini

The open question in this section previously asked whether `laravel/ai`
supports structured output. It does — `HasStructuredOutput` composes with
`HasTools` in the same `generateText` call. But the provider refuses:

```
Gemini Error [400]: INVALID_ARGUMENT
Function calling with a response mime type: 'application/json' is unsupported.
```

An expert has tools by definition, so on Gemini the envelope **cannot** be a
provider-enforced schema. It is a prompt contract, parsed and validated on the
way out (`app/Ai/EnvelopeParser.php`), and a malformed envelope is reported as
a `failed` status rather than passed through half-filled. Providers that
support both (OpenAI) would allow the strict version; only `GEMINI_API_KEY` is
configured today. **Carry into Phase 2:** either add an OpenAI key for experts,
or treat envelope validation as permanent infrastructure.

### 5.2 Results — and what is still unmeasured

**Scored so far: 4 of 11.** The go/no-go in §4 is therefore *not yet decided* —
what follows is evidence, not a verdict.

| Q | Verdict | Detail |
| --- | --- | --- |
| **Q1** overdue by customer | **Pass** (after §5.3) | 27/27 customers, matching ground truth. Brambilla correct at 10.000 — the partially-paid trap not taken. Initially 3 totals were off; exact once aggregation moved to SQL |
| **Q4** purchases by product family | **Pass** | 20.000 € Idraulica, exact. Chain `get_today → list_customers → list_sales_order_items` — the join no endpoint spans |
| **Q10** invoices lookup (control) | **Pass** | **Not delegated** — went `search_customers → navigate_to_page`, unprompted |
| **Q11** churn (control) | **Pass** | Refused correctly, invented nothing, 1 step, 1.8 s |

Both controls passing is the most load-bearing outcome: the expert knows the
edge of its own competence, and the orchestrator knows when *not* to call it.

**Not yet run — and each is unmeasured for a reason worth stating:**

| Q | Why it still matters |
| --- | --- |
| **Q2** top 5 by open order value | Tests whether it declares which reading of "open" it used |
| **Q3** avg quotation→order time | The link is per-**line**, not per-document (a migration moved it). Tests whether the surfaced `from_quotation` field suffices |
| **Q5** families selling less YoY | Tests like-for-like period comparison — a silent YTD-vs-full-year mismatch is realistic and dangerous |
| **Q6** why hasn't invoice N arrived | The closest to real support use; needs prose grounded in `sources` |
| **Q7** longest-unfulfilled orders | Ranking on a computed age |
| **Q8** who to worry about | Observational, excluded from scoring — measures the interpretive ceiling |
| **Q9** how are we doing this month | Deliberately unbounded; designed to exhaust the step budget |

Q3 and Q9 are the two most likely to fail. Anyone continuing this should start
there rather than with the easy wins.

### 5.3 The arithmetic finding — and its fix

Q1's three wrong totals looked like rounding noise. Run end-to-end through the
orchestrator, the same flaw produced this:

> **User:** "Quanto ci devono in tutto i clienti, di scaduto?"
> **Assistant:** "I clienti ti devono in totale **406.876,20 EUR** di scaduto."
> *Ground truth: 541.059,20 EUR.*

**A 25% error, stated to the user as fact, with no caveat.** And the cause was
not truncation: all 49 overdue rows had been retrieved in a single page, the
filter was right, the `amount - paid_amount` measure was right. The model simply
cannot add 49 floats — and is equally confident when it can't.

This is systemic, not a tuning problem. "Approximately right" is indistinguishable
from "right" to a reader, which makes it the worst possible failure shape for a
system whose entire value proposition is trustworthy numbers.

**The fix, implemented and verified:** `aggregate_sales_data` — a general
primitive taking a resource, filters, a group-by and a measure, computing the
aggregate in SQL. The agent still decides *what* to aggregate; it stops being the
calculator. Deliberately **not** a per-question report endpoint, which would make
the expert pointless.

Same question, after:

> **Assistant:** "I clienti ti devono in totale **541.059,20 EUR** di scaduto."

Exact. And cheaper: 11.354 input tokens vs 17.318 (−34%), 4,3 s vs 7,4 s (−41%),
because paging rows into context to add them up was always the expensive path.
Provenance improved too — `sources` now cites the exact call and its parameters
rather than a vague description of the filter.

**Design rule this establishes:** an expert may retrieve, join, filter and
interpret, but must never compute. Any arithmetic in an answer has to come from
a tool. Worth applying to every future expert, not just this one.

### 5.5 End-to-end through the orchestrator

Run against the real SnapKit passthrough (`/api/chat/gemini`, real system prompt,
real tool descriptions) with delegation over HTTP to the Laravel expert:

| Scenario | Result |
| --- | --- |
| "Quanto ci devono di scaduto?" | Delegated, **541.059,20 €** — exact |
| "I 3 clienti che ci devono di più?" | Delegated, top 3 exact. Read "owe us most" as total exposure rather than overdue — a defensible choice it stated |
| "Cosa ha comprato Marchetti per famiglia?" | Delegated, **20.000 € Idraulica** — exact, via the lines→items→families join |
| Compound question (two analyses at once) | **Two delegations in one turn**, then composed — §2.5's "the orchestrator combines" in practice |
| **"Mostrami le fatture di Brambilla"** (control) | **Not delegated** ✓ — went `search_customers → navigate_to_page → show_toast`, exactly §5's counter-example |

The control passing matters as much as the successes: the tool descriptions route
correctly on their own, with no orchestrator rule saying "don't delegate lookups".

### 5.4 Two bugs worth recording

Both were invisible from the outside and both are cheap lessons for Phase 2:

- **A throwing tool reads as a runaway agent.** A type hint mismatch made every
  call to one tool throw. The model responded by retrying it — identically —
  until it hit `MaxSteps(12)`. Symptom: an agent that "loops"; cause: a broken
  tool. Any expert runtime should surface tool exceptions distinctly from step
  exhaustion, or this diagnosis costs an hour every time.
  *(The caps did their job: the loop stopped. Pass criterion 6, demonstrated by
  accident.)*
- **Tool names default to the class basename.** `laravel/ai` names a tool
  `ListInvoiceDueDates` unless it defines `name()`, while the instructions
  referred to `list_invoice_due_dates`. Worth checking `LegalEntityConfigAgent`,
  which appears to have the same mismatch.
