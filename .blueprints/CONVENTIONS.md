# Convenzioni dei blueprint — Snapkit

Regole specifiche di Snapkit per scrivere i blueprint. Il prompt `document-blueprints` del server `blueprints-mcp` le include automaticamente; questo file non viene indicizzato dalla ricerca.

## Struttura delle cartelle

| | **Pattern implementativi** | **Logiche particolari (domain-logic)** |
|---|---|---|
| Cartella | `components/`, `pages/`, `api/`, `routing/`, `testing/` | `domain-logic/<feature>.md` |
| Formato | rule → example → why, con codice | **What → Why → Where** |
| Scope | tutta l'app | **solo frontend** (niente regole di backend) |

- Nuovo dominio di pattern → crea la cartella e aggiungi la entry in `README.md`.
- Un file `domain-logic/` per feature (es. `invoices`, `quotations`, `sales-orders`), con intro su scope e file principali come negli altri.
- L'indice è `.blueprints/README.md`: albero della struttura, descrizione di ogni file ed **esempi di ricerca semantica** (le domande che devono portare al nuovo contenuto).

## Regole specifiche

- **domain-logic = solo frontend.** Se il *why* è una regola di backend, documenta solo la **conseguenza di presentazione** e rimanda alla business-doc dell'MCP `moddo-api` (`list-business-docs` → `get-business-doc`).
- Logica condivisa già documentata in `components/` (es. l'editor line-items in `components/quotation-items-list-editor.md`) → **linkala**, non ricopiarla.
- Cosa cercare nei casi speciali, in più a quanto previsto dal prompt: locking di import/compatibilità (`compatKey`/`lockWhen`), prefill, snapshot, `{#key}` remount.

## Dove verificare i "perché"

1. Tipi TS in `src/lib/types/api-types.ts`.
2. Schema live via MCP `moddo-api` (`list-api-groups` → `get-api-documentation`). Esempio: un caso "snapshot array o object" si è risolto scoprendo che l'OpenAPI dichiara `array` come forma canonica, evitando di rimuovere la guardia sbagliata.
3. Configurazione tenant via MCP `moddo-legal-entity-config`.

## Esempi da imitare

- [README.md](README.md) — struttura, descrizioni, esempi di ricerca
- [domain-logic/invoices.md](domain-logic/invoices.md) — file domain-logic (What/Why/Where)
- [components/date-handling.md](components/date-handling.md) — spec-blueprint per un fix (rule + util + test + migration)
- [components/quotation-items-list-editor.md](components/quotation-items-list-editor.md) — pattern implementativo condiviso (da linkare, non duplicare)
