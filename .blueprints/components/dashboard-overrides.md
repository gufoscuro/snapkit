# Dashboard Overrides

Per-legal-entity customizations of the dashboard config (snippet props, variant components, extra
pages) that survive "push scaffold". Stored in the legal entity config under `dashboard.overrides`,
edited as JSON in the admin panel, re-applied on top of the scaffold on every push.

> **Partly interim.** Storage (`dashboard.overrides`), format (`DashboardOverride`) and the merge
> (`applyOverrides`) are meant to stay. The **authoring UI** — a raw JSON editor for superadmins —
> is a stopgap until the admin config editor exists. See
> [What changes with the admin editor](#what-changes-with-the-admin-editor) and keep it up to date.

## The problem

A legal entity's `dashboard` config (pages + menus) is generated from the scaffold in code
(`scaffoldDashboardStructure()` in `$lib/utils/admin-config.ts`) and written with **"Inizializza
configurazione"** in the admin header (`pushScaffoldConfig`). The push rewrites the whole `dashboard` —
that's how new pages reach existing tenants. Any per-tenant change written directly into `dashboard`
used to be wiped.

Diffing the stored config against the new scaffold can't recover those changes: once written, a
customization is indistinguishable from an old scaffold default (is a different `componentKey` a variant
picked for this tenant, or the previous default that got renamed?). Customizations have to be **explicit
data**, kept apart from the generated pages and re-applied on every push.

## How it works

```
GET config ──► resources, policies, dashboard.overrides   (carried over)
                                   │
scaffoldDashboardStructure().dashboard
                                   ▼
             applyOverrides(scaffold, overrides)  →  { dashboard, unresolved[] }
                                   ▼
PUT config { resources, policies, dashboard: { pages, menus, overrides } }
```

- **Owner is implicit:** overrides live in the config of the legal entity they customize. No tenant key,
  no code deploy to customize a tenant.
- **Why inside `dashboard`:** the config PUT only accepts `dashboard`, `resources` and `policies`
  (`UpdateLegalEntityConfigRequest`); `dashboard` is free JSON, a new top-level key would be dropped by
  the backend validation. If the backend ever adds a dedicated field, move them there.
- **Runtime ignores them:** pages and menus are stored with overrides already applied, so
  `SnippetResolver` and page loading don't know overrides exist.
- **Effective on push only:** saving overrides changes nothing until the configuration is pushed again
  ("Salva e applica" in the panel does both).
- **Unresolved overrides are kept** in `dashboard.overrides` even when skipped, so they apply again if the
  scaffold gets fixed.

## Files

| File | Purpose |
| --- | --- |
| `$lib/config/dashboard-overrides/types.ts` | `DashboardOverride` union, `UnresolvedReason`, `UnresolvedOverride` |
| `$lib/config/dashboard-overrides/apply.ts` | `applyOverrides()` — pure, unit-tested |
| `$lib/config/dashboard-overrides/schema.ts` | TypeBox schemas + `validateOverrides` / `parseOverrides(json)` → errors located by JSON pointer, unit-tested |
| `$lib/config/dashboard-overrides/editor.ts` | CodeMirror completion + inline diagnostics for the JSON editor, unit-tested. Import it directly, not via the barrel (keeps CodeMirror out of `admin-config` importers) |
| `$lib/config/dashboard-overrides/index.ts` | `getStoredOverrides(config)`, `describeOverride()` |
| `$lib/utils/admin-config.ts` | `pushScaffoldConfig` (applies them), `saveDashboardOverrides`, `notifyUnresolvedOverrides` |
| `$lib/stores/tenant-config/types.ts` | `DashboardConfigData.overrides` |
| `features/settings/DashboardOverridesPanel.svelte` | Admin panel: list + status, JSON editor, save / save and apply |

## Override operations

| `op` | Fields | Effect |
| --- | --- | --- |
| `snippet` | `page` ($id, any depth), `slot` (key of `snippets`), `set: { props?, componentKey?, enabled? }` | `props` shallow-merged over the scaffold's; `componentKey` / `enabled` replaced |
| `page.add` | `parent?` ($id), `page: PageConfig` | Appends a top-level page, or a subpage under `parent` |

Every override may carry a `reason` string — **always fill it**: it's shown in the admin panel and is the
only record of why this legal entity differs (overrides have no git history).

Overrides apply **in declaration order**, so a `snippet` override can target a page added by an earlier
`page.add`. Menu operations and layout overrides are not implemented yet. To add an operation: extend the
union in `types.ts`, **mirror it in `schema.ts`**, handle it in `applyOverrides`, test both, list it here.

## Adding an override

1. Open the admin (on the tenant's host, or shadowing it) and select the legal entity.
2. In **Override della dashboard**, click **Modifica** and edit the JSON array (see *Editor support*
   below — in an empty editor, `Ctrl+Space` offers ready-made templates), e.g.:
   ```json
   [
     {
       "op": "snippet",
       "page": "transport-document-details",
       "slot": "content",
       "set": { "props": { "importLineSelection": true } },
       "reason": "Selective DDT import from orders (customer request, Oct 2026)"
     }
   ]
   ```
3. **Salva** stores them (effective at the next push); **Salva e applica** stores them and pushes the
   scaffold, behind the same confirmation as the header action.
4. Check the list: every override must show **Applicabile**.

## Editor support

The JSON editor (`overridesEditorExtensions(scaffold)` from `editor.ts`, passed to `CodeMirrorField`'s
`extensions`) completes from the **current scaffold** and the components registry:

| Where the cursor is | Suggestions |
| --- | --- |
| Empty document / root array | Whole-override templates (`snippet`, `page.add`) with tab stops |
| Key position | Keys valid for that object kind (root override by `op`, `set`, added page, snippet definition, `snippets` slots), minus keys already present |
| `"op"` value | `snippet`, `page.add` |
| `"page"` (snippet op), `"parent"` | Every page `$id` in the scaffold, nested included |
| `"slot"` | Slots of the page already chosen in `"page"`, else every slot |
| `"componentKey"` | Every registry key |
| `"enabled"` | `true` / `false` |

Completion opens on its own after `{`, `,`, `:`, `[` or while typing a word; `Ctrl+Space` forces it.
**Inline diagnostics** run the same `validateOverrides` used on save: a JSON syntax error, or each validation
error underlined at its JSON pointer (the offending property; for a missing required key, the opening brace
of its object). How it works: the object kind is derived from the key path between the cursor and the root
override (`locate` → `kindOf` on the Lezer JSON tree) — when adding an operation, extend `keysFor` /
`valuesFor` / templates there too.

**Validation before saving** (`parseOverrides`): valid JSON array; each item matches one operation exactly —
**unknown keys are rejected** (a misspelled `prop` would otherwise validate and silently do nothing); a
`snippet` override must set at least one field; every `componentKey` (in `set` or in added pages, nested
included) must exist in the components registry.

**Rules:**

- **Never put a tenant customization in the scaffold.** The scaffold is the default for every tenant;
  `props: { … }` added there turns a feature on for everyone at their next push.
- Overrides are per legal entity: a tenant with several legal entities needs them on each one.
- Prefer a snippet prop over a `componentKey` variant (`development-guidelines.md` → *Per-tenant behavior
  toggles*).
- Overrides only change `dashboard`. Field visibility and custom fields (`resources`) and `policies` are
  already preserved by the push and edited separately.

## Unresolved overrides

An override whose target is missing is **skipped and reported, never dropped silently**:

| Reason | Meaning | Typical fix |
| --- | --- | --- |
| `page-not-found` | The target (or parent) page `$id` is gone from the scaffold | Retarget to the new `$id`, or delete the override |
| `slot-not-found` | The page exists but has no such snippet slot | Retarget to the right slot |
| `page-exists` | A `page.add` collides with a page the scaffold now ships | Usually delete the override — the scaffold caught up |

They surface in two places: a warning toast after each push (`notifyUnresolvedOverrides`, listing
`describeOverride()` of each), and the admin panel, which checks every stored override against the
**current scaffold** — it predicts what the next push will do, so a scaffold change that breaks an override
is visible before anyone pushes. **Before renaming or removing a page `$id` in the scaffold**, consider which
legal entities may have overrides targeting it.

## Known limitations

- Changes written into `dashboard.pages` / `menus` by other means (legal-entity-config MCP `add-page`,
  `add-subpage`, a manual PUT) are **not** overrides: the next push still wipes them. Express them as
  overrides instead.
- The panel shows whether an override *can* apply, not whether the stored pages already *have* it (i.e. an
  override saved without "apply" is not flagged as pending).
- Shallow `props` merge: a nested object in `props` replaces the scaffold's, it isn't deep-merged.
- Completion knows nothing about a component's props (`"props": { … }` gets no key suggestions) — that
  needs prop metadata in the components registry. Pages added by `page.add` in the same document aren't
  offered as `"page"` / `"parent"` values.
- No history or review: the JSON editor overwrites the list. `reason` is the only documentation.
- That the backend persists `dashboard.overrides` as-is relies on `dashboard` being stored as free JSON —
  confirmed by the API docs' request shape, to re-check if the backend starts validating `dashboard`.

## What changes with the admin editor

When the admin config editor lands (prototype on branch `feat/admin-upgrades`: `config-tree.ts`,
DashboardEditor tree, `PageForm`, `SnippetSelector`, `components-metadata.ts`), revisit this as follows:

- **Keep:** `dashboard.overrides` storage, the `DashboardOverride` format, `applyOverrides`, `parseOverrides`
  (as the save-time guard) and the push semantics.
- **Replace the JSON editor** (and `editor.ts` with it) with structured editing: the editor shows the *effective* dashboard (scaffold +
  overrides) but **persists the diff as overrides** — editing `pages`/`menus` directly would be wiped by the
  next push.
- **Typed prop controls:** with prop metadata in the components registry, offer controls for a snippet's
  config props (e.g. a toggle for `importLineSelection`) instead of raw JSON.
- **Two admin actions:** "update" (scaffold + overrides, today's push) and a "reset" that also clears the
  overrides.
- **Pending state:** show overrides saved but not yet pushed.
- **Remove the interim notes** here and in `DashboardOverridesPanel`.

## Related

- [`development-guidelines.md`](./development-guidelines.md) — *Per-tenant behavior toggles: snippet config props*
- [`legal-entity-policies.md`](./legal-entity-policies.md) — backend business settings (carried over by the push, not overrides)
- [`import-menu.md`](./import-menu.md) — `importLineSelection`, the first per-tenant snippet prop
