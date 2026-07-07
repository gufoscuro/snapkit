---
description: A fine lavoro, documenta nei .blueprints ciò che è stato costruito/modificato — pattern implementativi riutilizzabili e/o casi speciali frontend (domain-logic). Estrae dal diff, verifica i "perché" contro tipi/API, marca gli ignoti con ⚠️ e li risolve con l'utente.
---

# /document-blueprints [scope]

Da invocare **quando hai finito un pezzo di lavoro** (nuova feature o modifiche a una esistente) per aggiornare i `.blueprints/`. Un solo comando, due passate: **pattern implementativi** (il *come* riutilizzabile) e **logiche particolari** (il *perché* dei casi speciali frontend).

## Argomento `scope` (opzionale)

- _(vuoto)_ → valuta **entrambe** le passate su tutto ciò che è cambiato.
- `patterns` → solo pattern riutilizzabili (`components/`, `pages/`, `api/`, `routing/`, `testing/`).
- `logic` → solo casi speciali frontend (`domain-logic/`).
- `<nome-feature>` (es. `invoices`, `transport-documents`) → limita lo scope a quella feature, entrambe le passate.

## Distinzione fondamentale (non confonderle)

| | **Pattern implementativi** | **Logiche particolari (domain-logic)** |
|---|---|---|
| Cartella | `components/`, `pages/`, `api/`, `routing/`, `testing/` | `domain-logic/<feature>.md` |
| Cosa | il *come* riutilizzabile ("come si fa una X") | il *perché* dietro condizioni che sembrano arbitrarie |
| Formato | rule → example → why, con codice | **What → Why → Where** |
| Scope | tutta l'app | **solo frontend** (niente regole di backend) |

---

## Workflow

### Fase 0 — Scope discovery (nessuna scrittura)

1. Determina **cosa è cambiato**, in quest'ordine:
   - se `scope` è un nome-feature, limita a quella;
   - altrimenti guarda il working tree e i commit recenti: `git status --short` e `git diff --stat` (e, se serve, `git diff` mirato) rispetto al branch base.
   - se il diff è ambiguo o vuoto, **chiedi all'utente** quale feature/file documentare — non tirare a indovinare.
2. Identifica la/e **feature toccate** (es. la view fattura → `invoices`) e i file rilevanti (form detail, `*-actions.ts`, badge, editor, filtri, sidebar, util).

### Fase 1 — Leggi i blueprint esistenti (MANDATORY, da CLAUDE.md)

Prima di scrivere qualunque cosa, cerca i contenuti esistenti. **Due metodi, scegli quello giusto:**
- **`search_blueprint` (MCP, semantico)** → per la **discovery**: "cosa esiste già su questo tema?" quando non sai quale file. Ranking per rilevanza, chunk per heading. È il metodo primario per non duplicare. Es. `search_blueprint("<feature> form special cases")`, `search_blueprint("<pattern> guidelines")`.
- **Lettura diretta del file** → quando **sai già** quale file ti serve (il `domain-logic/<feature>.md` della feature, il `README.md`), o quando ti serve il contenuto **completo e attuale**.
- ⚠️ **Cautela chiave:** `search_blueprint` riflette l'**ultimo rebuild degli embedding**, quindi contenuti appena modificati (o non ancora rebuildati) possono essere assenti o stantii. Per file che potresti aver toccato di recente, **leggi il file** — non fidarti della sola ricerca semantica.

Quindi:
1. `search_blueprint` sui temi coinvolti per **non duplicare** e allinearti al tono.
2. Leggi direttamente `.blueprints/README.md` e i file di dominio già presenti per la feature (contenuto attuale, non l'indice semantico).
3. **Regola anti-duplicazione**: se una logica condivisa è già documentata in un blueprint `components/` (es. l'editor line-items in `components/quotation-items-list-editor.md`), **linkala**, non ricopiarla. Idem tra file `domain-logic/` fratelli (cross-reference invece di duplicare).

### Fase 2 — Passata A: pattern implementativi (se scope ≠ `logic`)

Per ogni **pattern riutilizzabile** introdotto o modificato:
1. Decidi: nuovo file di dominio o update di uno esistente? (nuovo dominio → crea la cartella e aggiungi entry al README).
2. Scrivi in formato **rule → example → why** (convenzione dei file esistenti, vedi `components/*.md`). Codice minimo ed essenziale.
3. Riferisci **file + simbolo/funzione**, non numeri di riga.

### Fase 3 — Passata B: casi speciali frontend (se scope ≠ `patterns`)

Obiettivo: catturare la conoscenza che **sparisce dal codice** — condizioni che sembrano arbitrarie senza il *perché*.

1. **Estrai i casi speciali** dai file della feature. Cosa cercare:
   - bottoni/azioni/voci menu mostrati/nascosti/disabilitati per stato, tag, ruolo;
   - campi condizionali, readonly, required, disabled;
   - mapping badge/status calcolati da più campi;
   - locking di import/compatibilità (`compatKey`/`lockWhen`), prefill, snapshot;
   - quirk di date/timezone, default, `{#key}` remount, effetti/race workaround;
   - differenze create-vs-edit, remap form-shape ↔ API-shape;
   - **qualunque commento che spiega un perché**.
   - Per feature grandi, usa **subagent `Explore` in parallelo** (uno per feature) con un prompt di estrazione che chiede, per ogni caso: **Title / What / Why (se nel codice, altrimenti "WHY UNKNOWN") / Where (file + simbolo)**.
2. **Scrivi `domain-logic/<feature>.md`** in formato **What → Why → Where**:
   - **solo frontend**. Se il *why* è una regola di backend, documenta solo la **conseguenza di presentazione** e rimanda alla business-doc dell'MCP `moddo-api` (`list-business-docs` → `get-business-doc`).
   - **niente numeri di riga** (driftano) — sempre file + simbolo.
   - intro con scope + file principali, come negli altri `domain-logic/*.md`.

### Fase 4 — Risolvi i ⚠️ (why ignoti)

Per ogni caso il cui *why* **non è nel codice**, inserisci un callout:

```
> ⚠️ **WHY needs author input:** <cosa fa il codice> — <la domanda precisa>.
```

Poi, **prima di chiudere**, prova a risolverli in quest'ordine:
1. **Verifica sui fatti** (spesso basta): tipo TS in `src/lib/types/api-types.ts`, schema live via MCP `moddo-api` (`list-api-groups` → `get-api-documentation`), commenti vicini. _In questa sessione un caso "snapshot array o object" si è risolto scoprendo che l'OpenAPI dichiara `array` come forma canonica — evitando di rimuovere la guardia sbagliata._
2. **Chiedi all'utente**, un caso alla volta, con il codice preciso davanti (path cliccabile), spiegando le letture possibili così può ricordare.
3. **Aggiorna il callout** con l'esito: *why* confermato, oppure "bug latente noto"/"tech debt" con rimando al blueprint di fix. Se emerge un fix vero e proprio, scrivi uno **spec-blueprint** (rule + util + test + migration checklist) che un'altra chat possa eseguire — vedi `components/date-handling.md` come esempio.

Non lasciare `⚠️ WHY needs author input` residui a fine comando, a meno che l'utente non voglia rimandare.

### Fase 5 — Wiring del README

1. Aggiorna `.blueprints/README.md`: albero struttura + descrizione del file + **esempi di ricerca semantica** (le domande che devono instradare al nuovo contenuto — sono ciò che alimenta `search_blueprint`).
2. Cross-reference: collega i nuovi file ai `domain-logic/` fratelli e ai `components/` pertinenti.

### Fase 6 — Rebuild embedding (promemoria all'utente)

`search_blueprint` **non vede** il nuovo contenuto finché non si rigenerano gli embedding. È **manuale, non puoi farlo tu**:
> Ricorda di lanciare `npm run build:embeddings` (o lo script equivalente) e committare `.md` + `embeddings.json`, altrimenti la ricerca non troverà i nuovi blueprint.

Non committare se non richiesto esplicitamente.

## Regole hard

- **domain-logic = solo frontend.** Mai documentare regole di backend lì; rimanda alle business-doc dell'MCP `moddo-api`.
- **Niente numeri di riga** nei blueprint — sempre file + simbolo (driftano).
- **Non duplicare.** Logica condivisa già in un blueprint `components/` → linkala. File `domain-logic/` fratelli → cross-reference.
- **Mai inventare un "why".** Se non è nel codice: `⚠️`, poi verifica sui fatti o chiedi.
- **Verifica prima di asserire** che un file/simbolo/flag citato esista ancora (i blueprint invecchiano).
- **Formato coerente**: pattern → rule/example/why; domain-logic → What/Why/Where.
- Marca esplicitamente feature/flag disabilitati e TODO non ancora cablati al backend (non farli sembrare completi).

## Reference

- [.blueprints/README.md](.blueprints/README.md) — struttura, descrizioni, esempi di ricerca (da tenere aggiornato)
- [.blueprints/domain-logic/invoices.md](.blueprints/domain-logic/invoices.md) — esempio di file domain-logic (formato What/Why/Where)
- [.blueprints/components/date-handling.md](.blueprints/components/date-handling.md) — esempio di spec-blueprint per un fix (rule + util + test + migration)
- [.blueprints/components/quotation-items-list-editor.md](.blueprints/components/quotation-items-list-editor.md) — esempio di pattern implementativo condiviso (da linkare, non duplicare)

## Esempio output Fase 0 (formato atteso)

```
# Document Blueprints — Scope

Feature rilevate dal diff: **invoices** (form detail + azioni + due-date editor)
Passate: pattern ✅ · domain-logic ✅

Piano:
- components/: nessun pattern nuovo (l'editor è già in quotation-items-list-editor.md → linko)
- domain-logic/invoices.md: NUOVO — ~14 casi speciali estratti
- ⚠️ da risolvere con te: 2 (default MP05, document date immutabile)

Procedo con l'estrazione? 
```
