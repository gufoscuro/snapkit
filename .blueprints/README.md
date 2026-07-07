# Snapkit Blueprint Content Structure

This directory contains the implementation rules and guidelines for Snapkit, organized by domain for optimal semantic search.

## Directory Structure

```
snapkit-content/
├── mcp-servers/          # MCP server documentation and usage
│   └── overview.md       # All available MCP servers and their tools
├── components/           # Component development guidelines
│   ├── development-guidelines.md  # Component creation, organization, testing rules
│   ├── date-handling.md           # Date serialization rules (avoid UTC day-shift); shared $lib/utils/date helper
│   ├── patterns.md                # Common component patterns (selectors, etc.)
│   ├── state-sharing.md           # Sibling component state sharing architecture
│   ├── forms.md                   # Form system with context API and validation
│   ├── detail-record-form.md      # Create/update record form guide (useDetailRecord)
│   ├── resource-table.md          # ResourceTable component and renderers
│   ├── editable-table-field.md    # EditableTableField (table-based array editor)
│   ├── editable-list-field.md     # EditableListField (card-based array editor)
│   ├── table-filters.md           # Table filters (enum, tags, date) for listing pages
│   ├── quotation-items-list-editor.md  # Quotation/sales order line items editor
│   ├── import-menu.md             # Generic ImportMenu for bulk-importing records
│   ├── payment-composition.md     # Payment composition editor, signature & document integration
│   └── legal-entity-policies.md   # Accessing and extending legal entity behavioral policies
├── pages/                # Page architecture and CRUD patterns
│   ├── crud-workflow.md           # End-to-end CRUD workflow (list + form + filters)
│   └── fixed-pages.md            # Fixed pages (settings, admin) vs configurable pages
├── domain-logic/         # Frontend-specific special cases per feature/view
│   ├── invoices.md       # Invoice form/import/validation frontend quirks (the WHY behind special cases)
│   ├── quotations.md     # Quotation form/state/validation frontend quirks (import source)
│   ├── sales-orders.md   # Sales order frontend quirks, incl. quotation-import flow
│   └── actionables.md    # "Da spedire" / "Da incassare" list-view quirks (payment recording & status, baked filters)
├── testing/              # Testing strategy and patterns
│   └── strategy.md       # Test projects, mocking, what/how to test
├── api/                  # API integration guidelines
│   └── integration-guidelines.md  # API types, requests, error handling
├── routing/              # Navigation and routing patterns
│   └── navigation.md     # Route builder usage and best practices
└── infrastructure/       # Build, deploy, and runtime architecture
    └── deployment.md     # CI/CD pipeline, build/runtime contract, Forge's role
```

## File Descriptions

### MCP Servers

- **overview.md**: Complete reference for all MCP servers (svelte, shadcn-svelte, arke, etc.) including their tools and when to use them

### Components

- **development-guidelines.md**: Rules for creating, organizing, and documenting components. Covers file locations, composition patterns, and the decision flow for new components
- **date-handling.md**: Date serialization rules for forms/payloads. Calendar-day fields (`document_date`, `valid_from/to`, delivery/due dates) must serialize from local components, never `toISOString()` (which day-shifts near midnight in CET/CEST). Specifies the shared `$lib/utils/date.ts` helper (`toLocalISOString`, `todayLocalISO`), its unit tests, and the migration checklist to extract it. **Contains a pending-implementation spec** (the util doesn't exist yet).
- **patterns.md**: Specific patterns: record actions (RecordActionMenu, flag toggles, confirmAction), selector components, enum translations
- **state-sharing.md**: Architecture for sharing state between sibling components using contracts and bindings. Covers PageState, useProvides/useConsumes hooks, and database-driven configuration
- **forms.md**: Form system architecture with FormUtil, context API for field components, validation builder, and scaffolding examples
- **detail-record-form.md**: Step-by-step guide for creating create/update detail form components using `useDetailRecord`. Covers the full workflow: entity type discovery, contract, `useDetailRecord` setup, validation schemas, resource config, page state sharing, and the component checklist
- **resource-table.md**: Generic ResourceTable component for data tables. Covers declarative column configuration, 11 built-in renderers, utilities (createApiFetcher, createArchiveAction), table variants, and best practices
- **editable-table-field.md**: EditableTableField pattern for editing arrays as table rows. Covers auto-empty-row management, row snippet API, form context isolation, styling constants, and existing editors
- **editable-list-field.md**: EditableListField pattern for editing arrays as vertical cards. Alternative to EditableTableField for items with many fields. Covers explicit add/remove, multi-type lists with custom add buttons, responsive card layout, rich text in cards, and styling constants
- **table-filters.md**: Structured filter system for listing pages. Covers FilterConfig definition (enum, tags, date types), FilterDropdown component, standalone vs grouped modes, data flow through the contract system, serialization, and step-by-step guide for adding filters to any listing page
- **quotation-items-list-editor.md**: Production editor for quotation/sales order line items. Covers QuotationLineItem superset type, deliveryDateKey field mapping, addItems() API, notifyFormUpdate pattern for external mutations, validators (quotationItemsRequired/Valid), date timezone handling (toLocalISOString), and the SalesOrderItemsListEditor wrapper that adds quotation import
- **import-menu.md**: Generic core ImportMenu for bulk-importing records from any async source. Covers the typed generic pattern (fetchFunction + optionMappingFunction + onimport), debounced server-side search, optional HoverCard preview snippet, standalone vs submenu modes, compatibility locking (`compatKey` record-anchored + `lockWhen` form-anchored), and the Escape-key workaround for closing (since shadcn-svelte DropdownMenu doesn't forward open prop)
- **payment-composition.md**: Payment composition (Acconto/SAL/Saldo slices) replacing single payment terms. Covers the shared `PaymentComposition` type, `PaymentCompositionEditor`, the `$lib/utils/payment-composition.ts` helpers (`compositionSignature`, `compositionRules`, `compositionFromSnapshot`, `toCompositionPayload`), document integration (snapshot prefill, `{#key}` remount, submit strip), and two-layer import compatibility. Which resources have a composition (commercial terms, quotation, sales order) vs not (transport document, warehouse order, invoice)
- **legal-entity-policies.md**: How to read and extend `entityConfig.policies` (behavioral flags, not per-resource fields). Covers the `getPolicy` helper, typed constants to avoid magic literals, `$derived` integration with validation schemas and field enablement, step-by-step for adding a new policy, and when to promote comparisons into predicate helpers

### Pages

- **crud-workflow.md**: End-to-end guide for building a CRUD (list, filters, detail form, archive). Covers the anatomy of a CRUD, step-by-step instructions, the difference between configurable and fixed pages, and i18n conventions
- **fixed-pages.md**: Complete guide for creating fixed pages (settings, admin) that use file-based routing instead of the configurable page system. Covers layout structure, sidebar with fixed links, list/detail page patterns, `setSnippetBindings()` usage, custom `handleSuccess` for navigation, breadcrumbs, and the header pattern

### Domain Logic

This is a per-feature pattern: one file per view/feature that accumulates non-obvious **frontend** logic — the _why_ behind special cases that look arbitrary in code. Frontend only, no backend business rules. Where behavior is shared across features (e.g. commercial-terms defaults, payment composition, line-item editor internals), the files cross-reference each other and the relevant `components/` blueprint instead of duplicating.

- **invoices.md**: editability gating by state, cumulative-invoice merging, URL-driven prefill flow, payment-term/due-date schedule sync, line-item locking, SDI validation UX, status badges, filter quirks, chat-filter-tool gotchas, payment recording & schedule freeze, and the payments subpage.
- **quotations.md**: the import _source_. Editability gating by `open` state, create-vs-edit validation, sales-transaction-type filtering, customer-driven defaults, composition remount, snapshot dual-shape (array/object), actions/badges, page-state lifecycle.
- **sales-orders.md**: shares most of quotations' surface (cross-referenced, not duplicated); the sales-order-specific focus is the **quotation-import flow** (eligibility, composition-signature compatibility locking, header-from-first-record, importable-quantity clamping), fulfillment badge, and confirmation date.
- **actionables.md**: the aggregate list views surfaced label-less at the top of the sidebar — **Da spedire** (`DeliveryScheduleTable`, `GET /delivery-schedule`) and **Da incassare** (`PaymentsTable`, `GET /invoice-due-dates`). Covers collection progress / payment status / recording (manual payment tracking, superseding the old issued-as-paid proxy), the forward-only + credit-note-excluded + zero-due-dates-valid shapes, EUR-default amount, the nested `invoice` object on due-date rows (with guarded accessors), and the delivery schedule's `outstanding`-baked/line-granular/`payment_pending` quirks. Points at the moddo-api `deferred` business-doc for the backend rationale.

### Testing

- **strategy.md**: Complete testing guide covering Vitest project configuration, file naming conventions, mocking patterns (SvelteKit modules, i18n, fetch, Svelte components), testing reactive code with `flushSync`, component testing with `@testing-library/svelte`, and what to test vs what not to test.

### API

- **integration-guidelines.md**: How to work with backend APIs, including type management, the apiRequest utility, error handling, and discovering endpoints with arke MCP

### Routing

- **navigation.md**: Using the route-builder utility for type-safe navigation, with examples and best practices

### Infrastructure

- **deployment.md**: How the app reaches production. Covers the CI/CD pipeline (GHA → GHCR → Kamal), the build contract code must satisfy (self-contained `npm ci && npm run build`, no build-time env inlining, adapter-node output, build memory limits), the runtime contract (container :3000, `/healthz`, stateless), and Forge's reduced role (only nginx/SSL/firewall). Reference for code changes that could break the deploy pipeline.

## Usage with MCP Server

These files are designed to be:

1. **Chunked** by heading sections during embedding generation
2. **Searched semantically** when Claude Code needs implementation guidance
3. **Updated independently** when rules change in specific domains

## Maintenance

When updating guidelines:

1. Edit the relevant markdown file
2. Run `npm run build:embeddings` to regenerate embeddings
3. Commit both the content and updated embeddings.json

## Semantic Search Examples

- "How do I create a new component?" → `components/development-guidelines.md`
- "How to serialize dates without a timezone shift?" → `components/date-handling.md`
- "Why does document_date default use toISOString / how to fix it?" → `components/date-handling.md`
- "Where is toLocalISOString / todayLocalISO?" → `components/date-handling.md`
- "How to fetch data from API?" → `api/integration-guidelines.md`
- "What MCP server should I use for icons?" → `mcp-servers/overview.md`
- "How to create links?" → `routing/navigation.md`
- "How to add actions to a record?" → `components/patterns.md`
- "How to create a flag toggle action?" → `components/patterns.md`
- "How to use RecordActionMenu?" → `components/patterns.md`
- "How to make a selector component?" → `components/patterns.md`
- "How do components share state?" → `components/state-sharing.md`
- "How to create a form?" → `components/forms.md`
- "How to validate form fields?" → `components/forms.md`
- "How to create a create/edit record form?" → `components/detail-record-form.md`
- "How to use useDetailRecord?" → `components/detail-record-form.md`
- "How to handle create and update in the same component?" → `components/detail-record-form.md`
- "How to create a data table?" → `components/resource-table.md`
- "How to use ResourceTable?" → `components/resource-table.md`
- "What renderers are available for tables?" → `components/resource-table.md`
- "How to write tests?" → `testing/strategy.md`
- "How to mock SvelteKit modules in tests?" → `testing/strategy.md`
- "What test file naming convention?" → `testing/strategy.md`
- "How to test a Svelte component?" → `testing/strategy.md`
- "Do I need to write tests for a new component?" → `components/development-guidelines.md` (Section 4: Testing)
- "How to add filters to a listing page?" → `components/table-filters.md`
- "How to create a filter dropdown?" → `components/table-filters.md`
- "How to add enum/tags/date filters?" → `components/table-filters.md`
- "How does FilterConfig work?" → `components/table-filters.md`
- "How to add standalone date filters?" → `components/table-filters.md`
- "How to edit quotation/sales order line items?" → `components/quotation-items-list-editor.md`
- "How does the QuotationItemsListEditor work?" → `components/quotation-items-list-editor.md`
- "How to handle delivery_date vs confirmed_delivery_date?" → `components/quotation-items-list-editor.md`
- "How to add a new line items editor for another document type?" → `components/quotation-items-list-editor.md`
- "How to import items from quotations into sales orders?" → `components/quotation-items-list-editor.md`
- "How to bulk import records?" → `components/import-menu.md`
- "How to use ImportMenu?" → `components/import-menu.md`
- "How to make a generic searchable multi-select dropdown?" → `components/import-menu.md`
- "How to add a hover preview to dropdown items?" → `components/import-menu.md`
- "How to disable incompatible rows in an import picker?" → `components/import-menu.md`
- "How to edit a payment composition (acconto/SAL/saldo)?" → `components/payment-composition.md`
- "How to use PaymentCompositionEditor?" → `components/payment-composition.md`
- "How to compute a composition signature?" → `components/payment-composition.md`
- "How to migrate a document from payment_term_id to composition?" → `components/payment-composition.md`
- "How to prefill composition from payment_composition_snapshot?" → `components/payment-composition.md`
- "How to read a legal entity policy?" → `components/legal-entity-policies.md`
- "How to use getPolicy?" → `components/legal-entity-policies.md`
- "How to add a new legal entity policy?" → `components/legal-entity-policies.md`
- "How to handle item_code_generation?" → `components/legal-entity-policies.md`
- "What is the difference between policies and custom fields?" → `components/legal-entity-policies.md`
- "How to build a CRUD?" → `pages/crud-workflow.md`
- "What is the anatomy of a CRUD?" → `pages/crud-workflow.md`
- "How to create a settings page?" → `pages/fixed-pages.md`
- "How to create a fixed page?" → `pages/fixed-pages.md`
- "What is the difference between configurable and fixed pages?" → `pages/fixed-pages.md`
- "How to set up snippet bindings manually?" → `pages/fixed-pages.md`
- "How to handle navigation in fixed pages?" → `pages/fixed-pages.md`
- "How to create a sidebar with fixed links?" → `pages/fixed-pages.md`
- "What are the special cases on the invoice form?" → `domain-logic/invoices.md`
- "Why is the invoice document date not editable?" → `domain-logic/invoices.md`
- "How does a cumulative invoice work on the frontend?" → `domain-logic/invoices.md`
- "When is the due-date schedule managed by the server?" → `domain-logic/invoices.md`
- "Why does the invoice prefill strip URL params?" → `domain-logic/invoices.md`
- "Why is the invoice form read-only / when can I edit an invoice?" → `domain-logic/invoices.md`
- "Why does the validate action not refetch the invoice?" → `domain-logic/invoices.md`
- "What are the special cases on the quotation form?" → `domain-logic/quotations.md`
- "When can I edit a quotation / why is it read-only?" → `domain-logic/quotations.md`
- "Why do quotation snapshots come as array or object?" → `domain-logic/quotations.md`
- "What are the special cases on the sales order form?" → `domain-logic/sales-orders.md`
- "How does importing quotations into a sales order work?" → `domain-logic/sales-orders.md`
- "Why are some quotations locked in the sales order import picker?" → `domain-logic/sales-orders.md`
- "Why does the sales order use confirmed_delivery_date?" → `domain-logic/sales-orders.md`
- "How does recording a payment / marking a scadenza as paid work?" → `domain-logic/actionables.md`
- "Why don't old invoices show in the to-collect / payments list?" → `domain-logic/actionables.md`
- "What are the special cases on the delivery schedule / to-ship view?" → `domain-logic/actionables.md`
- "Why is outstanding=true baked into the delivery schedule?" → `domain-logic/actionables.md`
- "How does the per-order delivery/shipment recap work (delivered vs remaining)?" → `domain-logic/actionables.md`
- "Why does a sales-order subpage need to provide salesOrder to the sidebar?" → `domain-logic/actionables.md`
- "How to add a subpage + sidebar link under a sales order?" → `domain-logic/actionables.md`
- "How would the delivery calendar / weekly buckets / 'Da pianificare' work?" → `domain-logic/actionables.md`
- "How do I record / delete an invoice payment or mark a scadenza paid?" → `domain-logic/actionables.md`
- "When is the invoice schedule frozen / why can't I edit due dates or the payment term?" → `domain-logic/invoices.md`
- "How does the invoice payments subpage (grouped by scadenza) work?" → `domain-logic/invoices.md`
- "What is the invoice payment_status badge (unpaid / partially_paid / paid)?" → `domain-logic/invoices.md`
- "How to build a read-only aggregate list that links to the source entity?" → `components/resource-table.md`
- "How to bake a static query param into a ResourceTable fetcher?" → `components/resource-table.md`
- "How to refresh a ResourceTable after an out-of-table dialog saves?" → `components/resource-table.md`
- "Why do form fields overflow a narrow dialog / how to fix field width in a modal?" → `components/forms.md`
- "How to render a sidebar group without a label?" → `routing/menu-system.md`
- "Where do the actionables (Da spedire / Da incassare / Da fatturare) live in the menu?" → `routing/menu-system.md`
