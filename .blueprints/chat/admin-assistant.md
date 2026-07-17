# Admin Assistant (chat in the legal entity editor)

The assistant docked in the third pane of the admin editor. Unlike the global
in-app assistant, it doesn't help an end user get work done — it helps an
operator shape the **configuration** that defines how the app behaves for a
tenant.

> **Status:** the shell is shipped (dock + claimed prompt + ambient context).
> The tools are **not** — the assistant can currently explain the config but not
> touch it. This file is the plan for closing that gap.

---

## 1. What exists today

| Piece | Where | Notes |
| --- | --- | --- |
| Docked chat | `DashboardEditor.svelte`, third `Resizable.Pane` | Claims `chatUi.claimDock('admin-dashboard-editor')`; `ChatMount` hides the floating surface while held |
| Prompt ("skill") | `src/lib/chat/server/chat-contexts/admin-assistant/` | Registered in `chat-contexts/registry.ts`; claimed per-page via `usePageChat({ serverContextId })` |
| Ambient context | `DashboardEditor/admin-chat.ts` | `LEGAL_ENTITY`, `CONFIG_SUMMARY`, `SELECTION` — re-evaluated on every send |
| Persistence | `updateLegalEntityConfig()` in `$lib/utils/admin-config.ts` | `PUT /legal-entities/{id}/config` — takes the **whole** config object |

The `serverContextId` claim is a native `@diaphora/chat` feature
(`PageContextRegistration.serverContextId`), not something bespoke: the composer
resolves the active claim on every send and falls back to `global-assistant`.

### Why the context is a summary, not the config

A legal entity config runs to tens of KB of JSON. Re-sending it every round
would crowd out the conversation itself and blow the token budget on data the
model mostly doesn't need. `formatConfigSummary` sends the **index** — ids,
routes, counts — and the dive-deep tools (below) fetch the one node that matters.

---

## 2. Tool design rules

### Rule 1 — Never take `tenant` / `legal_entity` as tool params

The `moddo-legal-entity-config` MCP addresses tenants by vanity and entities by
name (`tenant: "moddo"`, `legal_entity: "Moddo S.r.l."`) because it runs
**outside** the app and has no session. Our in-app tools do: the entity is
already in the page's props.

Mirroring those params into local tools would be a straight downgrade — it lets
the model hallucinate an entity name, and turns a wrong guess into a **write to
the wrong tenant**. Local tools take the entity from context. This is the single
most important departure from a 1:1 MCP mapping.

### Rule 2 — Address nodes by path, reusing the editor's own vocabulary

`$lib/utils/config-tree.ts` already has `getAtPath` / `updateAtPath` / `getKind`
over a `Path` (`['resources', 'customers', 'fields', 'email']`), and the tree UI
selects with exactly that. Tools should speak the same `Path`, so a tool call and
a click are the same operation — and `SELECTION` in the prompt is already phrased
that way.

### Rule 3 — Write through the editor's state, not around it

Mutations go: read `liveConfig` → `updateAtPath` → same save path the forms use.
The operator watches the tree update as the model works. A tool that PUTs behind
the editor's back would leave the UI showing stale data — the exact failure the
old chatbot had (it mutated server-side, then the page had to `refreshAdminConfig()`
and re-fetch everything).

### Rule 4 — Read tools are cheap, write tools confirm

Reads (`get_config_node`, `search_config`) run freely. Writes should state what
they're about to do and land a `show_toast`. For anything destructive
(`remove_custom_field`, removing a page) prefer the builtin `request_user_choice`
over a silent apply: a wrong config edit silently breaks a tenant's dashboard,
and there is no undo.

---

## 3. Phases

### Phase 1 — Dive-deep reads (no backend)

| Tool | Input | Returns |
| --- | --- | --- |
| `get_config_node` | `{ path: string[] }` | The subtree at that path + its `NodeKind`. Errors if the path yields no kind. |
| `search_config` | `{ query: string }` | Matching nodes as `{ path, kind, label }` — searches page ids/titles/routes, menu labels, resource + field names, custom field keys/labels. |
| `get_config_schema` | `{}` | Which resources are configurable, their required/optional fields, allowed custom-field types, allowed policy values. |

`get_config_schema` matters more than it looks: without it the model can't know
that `type` on `customers` is a **required** field (so visibility can't be
toggled), or that `item_code_generation` only accepts `automatic` / `manual`.

It needs no backend work — **`GET /legal-entities/{id}/config/schema` already
exists** and is authenticated, returning the same shape as the MCP's
`get-legal-entity-config-schema`. Cache it per legal entity: it changes only when
the backend deploys, so re-fetching it per tool call is waste.

### Phase 2 — Writes via the existing full-config PUT (no backend)

Mirror the MCP's *semantics*, minus the addressing params:

| Tool | MCP counterpart |
| --- | --- |
| `set_field_visibility({ resource, field, visible })` | `set-field-visibility` |
| `set_field_required({ resource, field, required })` | `set-field-required` |
| `add_custom_field({ resource, key, label, type, required?, options? })` | `add-custom-field` |
| `remove_custom_field({ resource, key })` | `remove-custom-field` |
| `set_policy({ policy, value })` | `set-policy` |
| `add_page({ id, title, route, parent_id? })` | `add-page` / `add-subpage` merged |

**The PUT already validates `resources` and `policies` server-side** — optional-only
toggling, no hidden+required, no key collisions with native fields, no duplicate
keys within a resource, `options` required for `select`, known policy keys and
values. It answers **422**.

So local validation is for *UX*, not safety: fail fast with a message the model can
act on, instead of round-tripping to a 422. Mirror those rules, and always surface
the server's 422 verbatim if one comes back anyway.

The real gap is **`dashboard`**: pages and menus carry **no server-side rules**.
These the tools must own outright:
- page `id` and `route` unique across the whole tree, subpages included
- a menu item's `pageId` points at a page that actually exists
- removing a page orphans no menu item pointing at it

> `add_page` merges the MCP's page/subpage split: `parent_id` omitted → top-level.
> One tool, one decision for the model.

### Phase 3 — Backend hardening (needs backend)

See [`docs/ADMIN_CHAT_API.md`](../../docs/ADMIN_CHAT_API.md). Two asks, neither of
which blocks Phase 2:

- **Concurrency.** The full-config PUT is last-write-wins. `config.version` exists
  but nothing checks it: two operators editing the same entity silently clobber
  each other, and the loser gets no signal. A version precondition turns that into
  a 409.
- **`dashboard` validation + the missing menu/page operations** (see §4).

Note what is *not* on this list: per-intent granular endpoints. They looked
necessary until we read the API — the PUT already validates `resources` and
`policies`, so the granular surface would mostly duplicate work already done.

### Phase 4 — Production (needs backend)

The chat is dev-only (`chatEnabled = dev`). `/api/chat/gemini` has **no auth** —
the `dev` gate returning 404 *is* its access control, and `hooks.server.ts` has
its `authHandle` commented out. Do not flip `chatEnabled` before the endpoint
authenticates; doing so publishes an unauthenticated Gemini proxy that anyone
can use to burn `GEMINI_API_KEY`.

---

## 4. Gaps in the MCP surface

Taking `moddo-legal-entity-config` as the spec means the assistant can **create
but not correct**:

| Area | Exists | Missing |
| --- | --- | --- |
| Menus | *nothing* | add / update / remove / reorder items — menus are half the dashboard config |
| Pages | `add-page`, `add-subpage` | update, remove, reorder |
| Custom fields | `add`, `remove` | update (rename label, change options) |
| Standard fields | `set-visibility`, `set-required` | — |
| Policies | `set-policy` | only `item_code_generation` is defined |

Phase 2 can cover several of these anyway (we hold the whole object and can
mutate any of it) — but Phase 3's endpoints must not inherit the same holes.

## 5. Known risks

- **No undo.** Nothing snapshots the config before an edit. Consider keeping the
  pre-edit object in memory and offering a `revert_last_change` tool before
  shipping writes.
- **Last-write-wins** across sessions until Phase 3.
- **The tree is half-built.** `MenusSection`, `ResourcesSection`, `PoliciesSection`
  are stubs (unused props, no rendering). Tools that mutate those areas will have
  no visual feedback in the editor until the sections are implemented — the
  operator would see a change only in the Raw root view.
