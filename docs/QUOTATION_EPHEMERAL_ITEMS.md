# Quotation Ephemeral Items — Backend Contract

Spec for **ephemeral quotation lines**: lines where the user types a code and a description
directly, without the article existing in the item registry.

> **Problem being solved.** Today a quotation line requires a real `item_id`. Sales people
> therefore create registry articles just to be able to quote. If the quotation never converts,
> those codes stay in the anagrafica forever. The registry gets polluted with articles that were
> never real.

---

## 1. Decisions taken (read this first)

| # | Decision | Rationale |
| --- | --- | --- |
| 1 | **Free-text line**, not a "draft article" flagged record | A draft-article record pollutes the registry anyway, occupies the code uniqueness space, needs a GC lifecycle, and must be filtered out of every selector/report/export. The free-text line has none of these problems. |
| 2 | A **new explicit line type** `ephemeral`, not `type: 'item'` with a nullable `item_id` | The invariant "`type === 'item'` ⇒ `item_id` is present" is assumed everywhere today (validators, stock, pricing). Relaxing it causes silent semantic drift. |
| 3 | The line is modelled as a **snapshot without an id** | See §2 — this is the single most important design point. |
| 4 | **An approved quotation contains zero ephemeral lines.** Before approval, every ephemeral line must be promoted (created or linked) or deleted. | Keeps every downstream document (sales order, transport document, invoice) completely unaware of ephemeral lines. |
| 5 | Promotion is **create-or-link**, via a **single transactional batch endpoint** | See §5 and §6. |
| 6 | Promoted articles get **system defaults** (unclassified category, draft status) so promotion is ~1 click | Friction at approval time is paid once per line, at the worst possible moment. |

---

## 2. Core model: a snapshot without an id

Quotation lines already carry `item_snapshot` and `vat_code_snapshot` — a frozen copy of the
article at the time the line was written. **An ephemeral line is literally that snapshot, with no
`item_id` behind it.**

Please model it exactly this way rather than introducing parallel fields
(`free_code`, `free_description`, …):

- printing / PDF generation, cross-document search and reporting **already read the snapshot**,
  not the article — so they keep working with little or no change;
- promotion becomes "fill in the missing `item_id`", not "migrate data between two field sets";
- there is one representation of "what was quoted", not two.

```jsonc
// ephemeral line
{
  "type": "ephemeral",
  "item_id": null,
  "item_snapshot": {
    "code": "TELAIO-SP-900",       // free text, NOT unique-checked, NOT reserved
    "name": "Telaio speciale 900mm",
    "primary_uom": "PZ"
  },
  "description": "Telaio speciale su misura, verniciato RAL 7016",
  "quantity": 4,
  "uom": "PZ",
  "unit_price": 185.00,
  "discount_percent": 5,
  "vat_code_id": "…",              // real FK — see §4
  "vat_code_snapshot": { … },
  "sort_order": 3
}
```

### Relationship to the existing line types

| Type | Article | Amounts | Contributes to totals | Survives approval |
| --- | --- | --- | --- | --- |
| `item` | required (`item_id`) | yes | yes | yes |
| `descriptive` | none | none | no | yes |
| `ephemeral` **(new)** | none | **yes** | **yes** | **no** |

`ephemeral` is *not* a variant of `descriptive`: it carries quantity, price, discounts and VAT, and
it participates in the document totals exactly like an `item` line. The only difference from `item`
is the missing `item_id`.

---

## 3. The invariant, and where it is enforced

> **An `ephemeral` line may only exist on a quotation in `open` state.**

This must be enforced **server-side on the `approve` transition**
(`POST /legal-entities/{le}/quotations/{id}/transition`), not only in the UI. A UI-only check is
bypassed by a direct API call, an import, or a stale browser tab — and every simplification listed
in §7 silently collapses the moment one ephemeral line reaches an approved quotation.

**Required behaviour:** if the quotation has ephemeral lines, `approve` fails with a structured,
machine-readable error the frontend can turn into the promotion dialog:

```jsonc
// 422
{
  "error": "quotation_has_ephemeral_items",
  "message": "The quotation contains lines without a linked article.",
  "ephemeral_items": [
    { "id": "…", "sort_order": 3, "code": "TELAIO-SP-900", "description": "Telaio speciale…" },
    { "id": "…", "sort_order": 7, "code": "MONT-01",       "description": "Montaggio in opera" }
  ]
}
```

The frontend pre-empts this error (it blocks approval and opens the promotion dialog first), but
the server-side check is the actual guarantee.

### Making "not yet approvable" visible before the approval attempt

A quotation that cannot be approved should say so *before* someone tries. Quotations already carry
a `tags` array rendered as badges in the listing and the detail view
(`QuotationTag = 'expired' | 'sent'`), so the cheapest correct answer is a **new tag**:

| Enum | Requested addition |
| --- | --- |
| `QuotationTag` | **`incomplete`** — set while the quotation has at least one ephemeral line |

The tag is derived, never stored as user input, and disappears the moment the last ephemeral line is
promoted or deleted. It gives the sales manager an at-a-glance view of which offers are not
approvable yet, and it costs us no new UI: the badge component already renders whatever tags the
backend returns.

### Lifecycle: duplication, revision, reopen

| Event | Expected behaviour |
| --- | --- |
| **Duplicate a quotation** (or create from a template) | Ephemeral lines are copied **as ephemeral**. No promotion is triggered, no article is created. Copying an offer must never touch the registry. |
| **Revise / supersede** an `open` quotation | Same: ephemeral lines carry over unchanged into the new revision. |
| **Revise an approved quotation** | Its lines are already real `item` lines; nothing to do. |
| **`reopen`** an approved quotation | State returns to `open`, so new ephemeral lines may be added again. Already-promoted lines stay linked — reopening does **not** un-promote anything (the article exists and may already be in use elsewhere). |
| **Approve again after reopen** | The §3 check runs again on the current line set. |

### Lines that legitimately live forever

Ephemeral lines **do** persist indefinitely on quotations that are `rejected`, `expired`,
`superseded` or archived — those are never approved, so the invariant does not apply to them.
Anything that reads historical quotations (cross-document search, offer-pipeline statistics) must
therefore handle `item_id: null`. This is the case that is easiest to forget.

---

## 4. Validation rules for an ephemeral line

| Field | Rule |
| --- | --- |
| `item_snapshot.code` | Optional, free text. **Never** checked against item-code uniqueness, never reserves a code. |
| `item_snapshot.name` / `description` | At least one is **required** — a priced line with no text is meaningless. |
| `quantity` | Required, `> 0`. |
| `uom` | Required, from the existing unit-of-measure enum (not free text). |
| `unit_price` | Required. Manual only — no price-list lookup is possible (§7). |
| `discount_percent` / `discount_amount` | Same rules as `item` lines. |
| `vat_code_id` | **Required, real FK to the VAT registry.** VAT is fiscal data: no free-text VAT codes, ever. |
| `item_id` | Must be `null`. A non-null `item_id` on an `ephemeral` line is a validation error. |

Symmetrically: an `item` line must still have a non-null `item_id`.

---

## 5. Promotion endpoint (batch, transactional, create-or-link)

Promotion must be **one transactional call**. Client-side orchestration
(`POST /items` in a loop, then `PATCH` the quotation) is not acceptable here:

- the quotation carries optimistic locking (`version`), so an N-call sequence races with concurrent
  editing;
- a partial failure leaves articles created but lines not relinked — i.e. **registry pollution,
  the exact problem this feature exists to prevent**;
- a code collision mid-loop leaves the operation half-applied with no clean rollback.

### Proposed shape

```
POST /legal-entities/{legalEntityId}/quotations/{quotationId}/items/promote
```

```jsonc
{
  "version": 7,                     // quotation version, for optimistic locking
  "promotions": [
    {
      "quotation_item_id": "…",
      "action": "create",
      "item": {                     // all optional — see §6 for defaults
        "code": "TELAIO-SP-900",
        "name": "Telaio speciale 900mm",
        "primary_uom": "PZ",
        "item_category": null,      // null ⇒ system default
        "item_status": null         // null ⇒ system default
      }
    },
    {
      "quotation_item_id": "…",
      "action": "link",
      "item_id": "existing-article-uuid"
    }
  ]
}
```

Response — the full updated quotation (or at least the promoted lines plus the new document
`version`), so the frontend can refresh without a second round-trip:

```jsonc
{
  "version": 8,
  "promoted": [
    { "quotation_item_id": "…", "item_id": "…", "created": true,  "item_snapshot": { … } },
    { "quotation_item_id": "…", "item_id": "…", "created": false, "item_snapshot": { … } }
  ]
}
```

Per promotion the server must, **atomically for the whole batch**:

1. create the article (`action: "create"`) or resolve the existing one (`action: "link"`);
2. set `item_id` on the quotation line and **refresh `item_snapshot` from the real article**
   (the snapshot must now reflect registry truth, not the hand-typed text);
3. flip the line `type` from `ephemeral` to `item`;
4. bump the quotation `version` **once** for the whole batch.

If any promotion fails, **nothing is applied** — no article created, no line touched.

### Error cases

| Case | Expected response |
| --- | --- |
| `code` already exists in the registry | `409` naming the offending promotion **and the id of the existing article**, so the UI can offer "link to it instead" rather than dead-ending. |
| `version` mismatch | Standard optimistic-locking `409`, batch not applied. |
| Line is not `ephemeral` (already promoted by someone else) | `422` identifying the line; batch not applied. |
| Caller lacks item-create permission | See §9 — open point. |

### The hand-typed code, and what it is worth

`item_snapshot.code` is optional on an ephemeral line, but when the user does fill it in it is the
single most useful piece of information for promotion. Required handling:

| Situation | Expected behaviour |
| --- | --- |
| Code present at promotion, no registry match | Used verbatim as the new article's `code`, even when the legal entity uses automatic numbering. The user typed a meaningful code; do not overwrite it with a generated one. |
| Code present, **exact** registry match | Not an error to surface late: the promotion dialog must know **before** submitting. See candidate lookup below — the frontend pre-flights it and defaults that line to `action: "link"`. |
| Code present, **fuzzy** registry match | Offered as a link candidate, not auto-linked. Linking to the wrong article is worse than creating a duplicate. |
| Code absent | The article is created with the standard numbering rules for the legal entity (automatic sequence, or a validation error if numbering is manual — in which case the promotion dialog must ask for it). |

Confirm which of the two "code absent + manual numbering" behaviours applies, since it decides
whether the dialog needs a code input on that path.

### Candidate lookup (for create-or-link)

To offer "link to existing" the frontend needs to surface likely matches. Either:

- a dedicated endpoint returning candidates for a code/description
  (`GET …/items/promotion-candidates?code=…&description=…`), ranked by similarity; **or**
- confirmation that the existing item search endpoint is good enough for a fuzzy code/name lookup,
  in which case the frontend uses that and no new endpoint is needed.

**Backend to decide and confirm which.** A dedicated endpoint is preferable if the matching should
be fuzzy (a hand-typed code is rarely character-identical to the registry one).

---

## 6. Defaults for promoted articles

Creating an article today requires `item_category`, `item_status` and `name` (plus `code` when
numbering is manual). Asking for all of them, per line, at approval time reintroduces exactly the
friction this feature removes. **Promotion must be effectively one click.**

Requested behaviour: when `item_category` / `item_status` are omitted, the backend assigns system
defaults. This requires **extending two currently-closed enums**:

| Enum | Current values | Requested addition |
| --- | --- | --- |
| `ItemCategory` | `finished_good`, `raw_material`, `semi_finished`, `component`, `phantom`, `packaging`, `subcontract`, `service_expense`, `kit` | **`unclassified`** — "da classificare" |
| `ItemStatus` | `active`, `inactive`, `obsolete` | **`draft`** — "bozza" |

The frontend side of this (labels, i18n, badge variants, filters) is our job; we need the enum
values to exist first.

### ⚠️ Trap to avoid: `mode=sellable`

`ItemSelector` filters articles server-side with a `mode=sellable` query parameter. **If `draft`
articles are excluded from `sellable`, the article just promoted disappears from the selector of
the very sales order it was promoted for.**

Requirement: an article with `item_status: draft` must remain fully usable in sales documents.
`draft` means "classification pending", not "not usable".

### Making the default survivable

Zero friction at promotion time only works if the classification debt is visible afterwards. If
nobody ever reclassifies them, `unclassified` articles are a politer version of the same pollution
this feature exists to remove — the codes just move from "never used" to "never classified".

Requested as part of this work:

- a boolean **`needs_classification`** on the article, set on promotion and cleared when a real
  category is assigned;
- that flag exposed as a **filter on the items listing**, so the registry owner can work through the
  backlog;
- **the source recorded** — which quotation (and line) the article was promoted from. Without it,
  whoever classifies the article three weeks later has no context to classify it *with*.

### Surfacing the backlog

Two consumers, both frontend-side but both needing backend support:

**1. Warning in the items registry** — "N articoli da classificare", linking to the filtered list.
Covered by the `needs_classification` filter above, provided the listing returns a total count.

**2. Dashboard counter.** This should follow the **existing KPI stat contract** in
[`DASHBOARD_STATS_API.md`](./DASHBOARD_STATS_API.md) rather than inventing a new shape — a plain
count whose `filters` deep-link the items listing:

```
GET /legal-entities/{legalEntityId}/stats/kpis/items-to-classify
```

```jsonc
{
  "value": 14,
  "format": "number",
  "filters": { "needs_classification": true }
}
```

The `filters` object is what the frontend turns into the card's link, so its keys must match the
items-listing query parameters exactly. `value: 0` is the "all clear" state and needs no special
handling.

> **Targeting note.** This warning is for whoever owns the registry, not for the sales person who
> triggered the promotion — they have already moved on and usually cannot classify the article
> anyway. It belongs in the items area and on the dashboard, **not** in the promotion dialog or on
> the quotation.

---

## 7. Impacts (mostly neutralised by the §3 invariant)

Because ephemeral lines never survive approval, the blast radius is small. Stated explicitly so it
can be verified rather than assumed:

| Area | Impact |
| --- | --- |
| **Sales orders / DDT / invoices** | **None.** They only ever receive lines from approved quotations, which by definition contain no ephemeral lines. The quotation→order import may keep skipping non-`item` types. |
| **Stock / availability / ATP / MRP** | **None.** Ephemeral lines never reach a stock-moving document. They must never contribute to committed/reserved quantities on open quotations either. |
| **Price lists (listino)** | No lookup is possible for an ephemeral line: `unit_price` is fully manual. No price-list entry may be created or keyed on a hand-typed code. |
| **Item price history** | Must ignore lines with `item_id: null`. Do **not** invent a history key from the free-text code. |
| **Margin / cost reporting** | Standard cost is unknown for an ephemeral line ⇒ margin must be returned as `null`, **never `0`**. Only relevant for quotation-stage reporting. |
| **Offer-pipeline statistics** | Ephemeral lines **do** contribute to quotation totals (open and rejected quotations). Any per-article breakdown of quoted value must bucket them as "no article" rather than dropping them — otherwise the per-article sum stops matching the document total and the figures lose credibility. |
| **Print / PDF** | Templates must tolerate `item_id: null` and render from the snapshot — see the callout below. |

> **The customer-facing PDF must be identical either way.** An ephemeral line renders exactly like
> an `item` line: same columns, same code, same description, same amounts. `ephemeral`,
> `unclassified`, `draft` and `needs_classification` are **internal bookkeeping** and must never
> appear on, or alter, anything the customer receives. A quotation whose lines are half promoted and
> half not must produce byte-identical output to the same quotation fully promoted. This is easy to
> get wrong by reusing the internal line badge in the print template.

---

## 8. Cross-document line search (MOD-108 / MOD-109)

Ephemeral lines exist only on quotations, but they persist on rejected/expired/archived ones — so
line search must handle them.

1. **Index the snapshot text, not only `item_id`.** `item_snapshot.code` and the line description
   must be searchable, or ephemeral lines are invisible to the feature entirely.
2. **Searching by article should optionally surface unlinked matches.** When the user searches for
   article `X`, ephemeral lines whose code/description match `X` are shown as *"possible unlinked
   matches"*. This is not a workaround — it is the natural way to discover that the same off-catalogue
   code has been quoted repeatedly and deserves a real article.
3. **Facet: linked / unlinked.** The result set must be filterable on whether the line has an
   `item_id`.
4. **No retroactive rewriting.** Promoting a line updates *that* line only. Back-filling `item_id`
   on other historical lines with the same code must be an explicit, opt-in action showing the
   affected count — never automatic. Closed documents are not silently rewritten.

---

## 9. Explicitly out of scope

Listed so nothing gets built speculatively:

- **Un-promote / undo.** Once promoted, the article exists and may already be referenced elsewhere;
  there is no rollback action. Mistakes are cleaned up through the normal registry tools — which is
  survivable precisely because promoted articles land in `draft` / `needs_classification`.
- **No data migration.** `ephemeral` is a new line type; existing quotations are unaffected and need
  no backfill.
- **Ephemeral lines on other document types.** Sales orders, transport documents and invoices never
  accept them (§3). Do not add the type to those schemas.
- **Bulk paste / spreadsheet import of ephemeral lines.** A natural follow-up (customers often send
  their request as a spreadsheet), but not part of this work.
- **"Most-quoted off-catalogue codes" report.** The signal for what deserves a real article; falls
  out of the search work in §8 and can wait for it.

---

## 10. Open points for the backend

1. **Permissions.** What happens when the user approving a quotation lacks item-create permission?
   Not decided on our side. Our working assumption is *whoever can approve can promote*; if that is
   wrong, we need a distinct error so the UI can offer link-or-delete only.
2. **Candidate lookup** — dedicated endpoint or reuse of the item search? (§5)
3. **Endpoint placement** — the promotion endpoint is proposed under the quotation
   (`…/quotations/{id}/items/promote`) because it mutates the document too. If you prefer it under
   `items`, fine, as long as it stays a single transaction that also relinks the lines.
4. **Duplicate ephemeral codes within one quotation** — allowed (two lines, same hand-typed code)?
   And if so, does promoting both create one article or two? Our preference: detect it in the
   promotion dialog and default to one article linked to both lines.
5. **Promotion with no hand-typed code, under manual numbering** — does the article get created
   anyway, or is a code required at that point? (§5) Decides whether the dialog needs a code input.

---

## 11. Frontend scope (what we build on our side)

For coordination — no backend action required.

- `QuotationItemsEditor`: third line type `ephemeral`, with free-text code + description and the
  full amount columns (qty, price, discount, VAT, net value).
- Entry point: typing an unknown code in `ItemSelector` offers *"use «XYZ» as a free line"* —
  the type dropdown remains, but this is the ergonomic path.
- Switching a row between `item` and `ephemeral` preserves compatible fields (description,
  quantity, price, VAT) instead of resetting the row.
- Validators updated: `quotationItemsValid` gains the ephemeral rules from §4.
- Per-line "promote" action, available at any time during editing.
- Approval interception: the approve action is blocked while ephemeral lines exist and opens the
  promotion dialog, which resolves each line as **create / link / delete** and then issues one call
  to the endpoint in §5.
- Visual marking of ephemeral lines in the editor and in the quotation detail view.
- Items registry: `needs_classification` filter, plus a warning banner with the backlog count.
- Dashboard: an "articoli da classificare" KPI card wired to the stat endpoint in §6 — no new
  widget code needed, it reuses the existing config-driven KPI widget.
