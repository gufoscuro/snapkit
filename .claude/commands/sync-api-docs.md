---
description: Rileva drift tra Moddo API (enum + business doc tag) e codice, propone patch su tipi/contract/enum-labels/i18n/badge variants. Read-only su rimozioni.
---

# /sync-api-docs

Sincronizza il codice frontend con la verità di backend esposta dall'MCP `moddo-api`. È **strettamente non destructive**: rimozioni di enum value lato API vengono segnalate ma mai applicate automaticamente.

## Scope (MVP)

1. **Enum values** — drift tra tipi locali (`src/lib/types/api-types.ts`) e `mcp__moddo-api__get-enum-labels`
2. **Suggerimento variant badge** — per ogni nuovo `*Tag` value, propone una `StatusVariant` e label IT/EN basandosi sui business doc
3. **Business doc tags (computed)** — usa `mcp__moddo-api__get-business-doc` (slug `business-logic`) per estrarre la semantica dei nuovi tag e arricchire la proposta

## Workflow

### Fase 1 — Discovery (automatica, nessuna patch)

1. Leggi `src/lib/types/api-types.ts` ed estrai tutti i `export type *` definiti come union di string literal. Concentrati su nomi che corrispondono a enum API: `*Tag`, `*Status`, `*State`, `*Type`, `*Class`, `*Mode`, ecc.
2. Chiama `mcp__moddo-api__get-enum-labels` (senza parametro `enum`) per ottenere la lista completa degli enum esposti dall'API.
3. Per ogni enum locale, chiama `mcp__moddo-api__get-enum-labels` con il nome corrispondente (best-match: `SalesOrderTag` locale ↔ `SalesOrderTag` API).
4. Costruisci un report di drift per ogni enum:
   - **Aggiunte**: valori presenti nell'API ma non nel tipo locale
   - **Rimozioni**: valori nel tipo locale assenti nell'API (⚠️ **non destructive**, solo report)
   - **Match**: nessuna azione

### Fase 2 — Report

Presenta all'utente un report strutturato in markdown. Per ogni enum con drift:

```
## SalesOrderTag — 2 aggiunte, 0 rimozioni
- ➕ advance_pending
- ➕ requires_direct_invoicing
```

Per le **aggiunte** ai `*Tag`:
- Chiama `mcp__moddo-api__get-business-doc` con slug `business-logic` (una sola volta, cache nella conversazione)
- Estrai la riga **Computed tags** dell'entità corrispondente (es. Sales Order → `Computed tags`) e usa la descrizione per:
  - Proporre **label IT/EN** (italiano sempre breve e azionabile, evita parole-passive)
  - Proporre una **StatusVariant** dal set `active | in-progress | loading | paused | blocked | alert | neutral`. Euristiche:
    - "settled", "sent", "completed" → `active`
    - "pending", "in attesa", "advance" → `paused`
    - "required", "action needed", "missing" → `alert`
    - terminale negativo → `blocked`
    - informativo/neutro → `neutral`

Per le **rimozioni**: elenca i call site del valore rimosso (grep) ma **non proporre patch automatiche**. Chiedi all'utente come procedere (rinominare? dismettere il tag? feature flag?).

### Fase 3 — Conferma e patch

Dopo aver presentato il report, **fermati e chiedi conferma esplicita** prima di applicare qualunque patch. Usa `AskUserQuestion` per:
- Confermare le label IT/EN proposte
- Confermare la `StatusVariant` proposta per ogni nuovo tag
- Chiedere chiarimenti su valori ambigui (es. se l'API espone un valore che il business doc non documenta)

### Fase 4 — Applicazione patch (solo aggiunte)

Per ogni enum con valori aggiunti, applica in quest'ordine:

1. **Tipo locale** — estendi la union in `src/lib/types/api-types.ts`
2. **TypeBox contract** — cerca file `*.contract.ts` che hanno uno schema `Type.Union([Type.Literal(...)])` per quell'enum e aggiorna. Usa grep mirato (es. `grep -l "SalesOrderTagSchema\|SalesOrderTag" src/lib/components/**/*.contract.ts`).
3. **enum-labels.ts** — aggiungi entry a `*Config` con le label proposte. Per i `*Tag`, aggiungi anche entry a `*TagStatusVariantConfig` (creandolo se non esiste, vedi pattern esistente per `salesOrderTagStatusVariantConfig`).
4. **i18n** — aggiungi chiavi in `messages/it.json` e `messages/en.json` seguendo la naming convention `enum_<entity>_<concept>_<value>` (es. `enum_sales_order_tag_advance_pending`).
5. **Componenti badge** — se il `*TagBadges.svelte` corrispondente ha logica hardcoded di variant (legacy), refactorizzalo per usare l'helper di `enum-labels.ts`. Se invece passa già da `enum-labels`, nessuna azione.

### Fase 5 — Validazione

1. Ricompila paraglide: `npx @inlang/paraglide-js compile --project ./project.inlang --outdir ./src/lib/paraglide`
2. Type check mirato: `npx tsc --noEmit -p .` e filtra l'output ai file toccati
3. Per ogni `.svelte` modificato, chiama `mcp__svelte__svelte-autofixer` (skill `svelte` MCP)
4. Riassumi le modifiche all'utente con path cliccabili (`[file.ts:N](file.ts#LN)`)

## Regole hard

- **Mai** rimuovere un enum value senza esplicita conferma utente, anche se assente dall'API. Le rimozioni richiedono ragionamento di prodotto (feature flag, deprecation, transition window).
- **Mai** rinominare chiavi i18n esistenti — aggiungi nuove, non toccare le vecchie.
- **Mai** modificare la variant di un tag esistente senza chiedere — la UX corrente potrebbe essere intenzionale.
- Se trovi `export type X = string` (catch-all) invece di una union literale, segnalalo come "enum non strict" e suggerisci di strict-izzarlo, ma non farlo automaticamente.
- Se il business doc non documenta un nuovo tag, segnalalo e chiedi all'utente prima di proporre label/variant alla cieca.

## Pattern reference

Per la convenzione di codice (config + status variant config + badge component delegato), vedi:
- [src/lib/utils/enum-labels.ts](src/lib/utils/enum-labels.ts) — pattern `*Config` + `*StatusVariantConfig` + helper
- [src/lib/components/features/sales-orders/SalesOrderTagBadges.svelte](src/lib/components/features/sales-orders/SalesOrderTagBadges.svelte) — badge component che delega tutto agli helper
- [src/lib/components/core/ResourceTable/renderers/StatusBadge.types.ts](src/lib/components/core/ResourceTable/renderers/StatusBadge.types.ts) — varianti disponibili

## Esempio output Fase 2 (formato atteso)

```
# Sync API Docs — Report

## ✅ Allineati (3)
- QuotationTag · WarehouseOrderTag · Currency

## ⚠️ Drift su aggiunte (1 enum, 2 valori)

### SalesOrderTag (+2)
| Value | Label IT proposta | Label EN proposta | Variant proposta | Fonte semantica |
|-------|---|---|---|---|
| `advance_pending` | Acconto in attesa | Advance pending | `paused` | business-logic § Sales Order → Computed tags |
| `requires_direct_invoicing` | Da fatturare direttamente | Direct invoicing required | `alert` | business-logic § Sales Order → Computed tags |

## 🚨 Drift su rimozioni (REPORT ONLY)
Nessuna.

Procedo con le patch? (sì/no, oppure rivedi singole proposte)
```
