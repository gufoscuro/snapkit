# Admin Chat — Backend Contract

What the frontend needs from the backend to ship the **admin assistant**: the
chat docked in the legal entity configuration editor, which lets an operator
inspect and reshape a tenant's configuration in natural language.

The frontend already has the chat shell, the docked UI, the system prompt, and
the orchestration layer that executes tools client-side. This document lists what
we need from you, in priority order.

> **Context:** today the admin chatbot calls `POST /legal-entities/{le}/config/chat`,
> a Laravel endpoint that owns the prompt, the conversation, and the mutations.
> We are replacing it with a client-orchestrated assistant. The request below
> reflects that inversion: **we own the prompt and the tool loop, you own the data
> and the authorization.**

---

## 1. Priorities

| # | Ask | Blocking | Why |
| --- | --- | --- | --- |
| 1 | Authenticated, prompt-less LLM endpoint | **Yes** — for production | Our current proxy has no auth; only a `dev` flag hides it |
| 2 | Confirm `/config/schema` includes `policies` | No — small | The endpoint exists; its OpenAPI only documents `resources` |
| 3 | Optimistic concurrency on the config PUT | No — but data-loss risk | The current PUT is last-write-wins |
| 4 | Validation + operations for `dashboard` (pages & menus) | No — correctness | `resources`/`policies` are validated; `dashboard` appears not to be |

**Not blocking us:** basic write capability. `PUT /legal-entities/{id}/config`
already accepts the whole config object, already validates `resources` and
`policies` server-side, and we already use it from the editor. So we can ship read
+ write tools with **no backend change at all**. Everything below is about doing it
*safely* (auth, concurrency) and closing the `dashboard` gap — not about enabling it.

---

## 2. Authenticated LLM endpoint

### The problem

We proxy Gemini ourselves at `POST /api/chat/gemini` (SvelteKit, not Laravel).
It has **no authentication**: the only thing protecting it in production is a
build flag that makes it return 404. That flag is currently the access control.
We cannot enable the chat in production until an authenticated path exists —
otherwise anyone who finds the URL can drive the model on our API key.

### What we need

A **pure passthrough**: authenticated, no prompt, no conversation state, no tool
opinions. We send a messages payload, you return the model's response. The system
prompt stays ours — it's composed per-context server-side in our own app
(`src/lib/chat/server/chat-contexts/`), and we already have that machinery.

```
POST /api/legal-entities/{legalEntity}/ai/messages
Authorization: Bearer <the user's existing token>
```

**Request** — the Anthropic-style shape our orchestrator already speaks:

| Field | Type | Req | Meaning |
| --- | --- | --- | --- |
| `messages` | array | ✔ | Conversation turns: `{ role: 'user' \| 'assistant', content }` |
| `system` | string | ✔ | The system prompt. **Pass through verbatim** — do not append, wrap, or replace it |
| `tools` | array | — | Tool definitions (`{ name, description, input_schema }`). Passed to the model; **you never execute them** — tool calls come back to us and we run them client-side |
| `model` | string | — | Optional override; you pick a sane default |
| `max_tokens` / `temperature` | number | — | Optional generation params |

**Response** — the model's reply, including any tool-use blocks, so our loop can
execute them and send results back as the next turn.

**Requirements:**

- **Auth**: the caller's normal session/bearer token. 401 when absent or invalid.
- **Authorization**: admin-only. A non-admin authenticated user must get 403 — this
  endpoint is not for the general in-app assistant.
- **No prompt injection on your side.** If you wrap or prepend to `system`, our
  per-context skills silently stop working.
- **Errors**: pass the provider's status through where sensible (429, 503). We
  surface them in the chat.

> Provider choice is yours. We currently use Gemini via `@google/genai` and
> translate to/from the Anthropic message shape in
> `src/lib/chat/server/chat-providers/gemini-translate.ts` — that translation can
> live on your side instead, as long as the contract above holds.

---

## 3. Config schema endpoint — exists, one thing to confirm

```
GET /api/legal-entities/{legalEntity}/config/schema      ✅ already shipped
```

This is what lets the assistant know that `name` on `customers` is required (so it
can't be hidden), or that `item_code_generation` only accepts two values — without
it the model confidently attempts illegal edits. Good news: it's there and
authenticated.

**The one ask:** its OpenAPI response is documented as `{ resources: string }`,
while the equivalent MCP tool (`get-legal-entity-config-schema`) returns both
`resources` **and** `policies`. Please confirm the HTTP endpoint returns the full
payload below (we suspect the spec is just under-typed rather than the endpoint
being different). If it does, this item is closed with no work:

```json
{
  "resources": {
    "customers": {
      "required_fields": ["type", "name", "language_code", "registration_country_code"],
      "optional_fields": ["last_name", "trade_name", "…"],
      "custom_field_types": ["text", "number", "boolean", "date", "select", "textarea"]
    }
  },
  "policies": {
    "item_code_generation": { "allowed_values": ["automatic", "manual"], "default": "automatic" }
  }
}
```

If it already does, item 2 is closed and needs no work.

---

## 4. Optimistic concurrency on the config PUT

`PUT /legal-entities/{legalEntity}/config` takes the whole config object. The
payload carries a `version` field, but nothing appears to check it: two operators
(or an operator and the assistant) editing the same entity **silently overwrite
each other**, and the loser gets no signal.

**Ask:** reject a PUT whose `version` is not the currently stored one with **409
Conflict**, returning the current version so we can tell the user their view is
stale and offer to reload. Bump `version` on every successful write.

This is cheap and closes a real data-loss hole regardless of the chat work.

---

## 5. The `dashboard` gap (pages & menus)

### 5.1 What's already good

The full-config `PUT` **already validates `resources` and `policies` server-side**:

- only optional configurable fields can be shown/hidden
- a field cannot be both hidden and required
- custom field keys can't collide with a native field name, nor duplicate within a resource
- `options` required when a custom field's type is `select`
- policy keys recognized, values valid

That's exactly the rule set we'd otherwise have had to ask for. **No action needed
here** — we'll pre-validate in the tools for a fast, friendly error, with your
422 as the backstop.

### 5.2 What's missing: `dashboard` isn't validated

In the PUT's request body, `dashboard` is typed `string[] (optional)` and carries
**no business rules**, while `dashboard` is really the rich object holding
`pages` (with nested `subpages`) and `menus`. Two questions:

1. **Is the `string[]` typing accurate, or an artifact of the OpenAPI generation?**
   We PUT a full nested object today (`pushScaffoldConfig`) and it works, so we
   assume the latter — but please confirm, since it's the difference between "the
   spec is wrong" and "we're relying on unvalidated behavior".
2. **Nothing validates page `id` / `route` uniqueness across the tree**, including
   subpages. Duplicate ids silently break routing and the menu links that point at
   them. We'd like this enforced on the PUT — it's the same class of rule you
   already apply to custom field keys.

### 5.3 Operations that don't exist anywhere

These have **no MCP tool and no endpoint**. Their absence is what keeps the
assistant able to create but not correct. Roughly in priority order:

| Area | Needed | Why it matters |
| --- | --- | --- |
| **Menus** | add / update / remove / reorder menu items | **The biggest gap.** Menus are half the dashboard config (`dashboard.menus`, `link` and `submenu` items) and have zero tooling. An assistant that adds a page but can't link it to the menu has done half a job |
| **Pages** | update (title/route/layout/snippets), remove, reorder | `add-page` with no update means a typo in a route is unfixable except by raw JSON |
| **Custom fields** | update (relabel, change `options`, toggle `required`) | Today: remove + re-add, which discards the field's data |
| **Policies** | more than `item_code_generation` | Only one policy is defined; if others are planned, we'd like the schema to advertise them |

If a full CRUD is too much, **update + remove for pages and menu items** is the
minimum that makes the assistant net-positive rather than a one-way ratchet.

---

## 6. What we are NOT asking for

- **Prompt / persona / conversation storage.** Ours. The endpoint in §2 must stay
  stateless and prompt-less.
- **Tool execution.** Tool calls come back to us; we run them against the config
  API and feed the results back into the loop.
- **Granular per-intent config endpoints.** We considered asking for one endpoint
  per operation (`PUT …/fields/{field}/visibility`, etc.) mirroring the MCP tools.
  Given that the full-config PUT already validates `resources` and `policies`,
  that's not worth your time — §4 (concurrency) and §5 (`dashboard`) get us the
  same safety for far less work. Revisit only if audit-per-change becomes a
  requirement.
- **A replacement for `POST /config/chat`.** That endpoint becomes unused by the
  frontend once this lands — flag it if anything else depends on it before you
  retire it.
