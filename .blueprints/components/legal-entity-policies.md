# Legal Entity Policies

**Policies** are behavioral flags attached to a legal entity (e.g. "item codes are generated automatically vs. manually"). They are delivered as part of the `LegalEntityConfigResponse` alongside `resources` (custom fields) and `dashboard` (pages/menus), but they are **global to the legal entity** — not scoped to a specific resource.

Policies are separate from:
- **Custom fields** (`entityConfig.resources[key].custom_fields`) — per-resource data shape additions.
- **Field visibility/required** (`entityConfig.resources[key].fields`) — per-resource UI overrides.

Use policies when the backend/config dictates a **behavior** that changes how a form, flow, or component should work (not which fields exist).

---

## Source of truth

All policy types, defaults, and the access helper live in `src/lib/stores/tenant-config/policies.ts` and are re-exported from the barrel `$lib/stores/tenant-config`.

The schema of available policies can be discovered via the **Moddo Legal Entity Config MCP**:

```
mcp__moddo-legal-entity-config__get-legal-entity-config-schema()
```

The `policies` key in the returned schema lists each policy, its `allowed_values`, and its `default`.

---

## Accessing a policy in a component

Always use the typed helper `getPolicy` and compare against a typed constant — **never inline string literals**.

```typescript
import { getPolicy, ItemCodeGeneration } from '$lib/stores/tenant-config'

const isManualCode = $derived(
  getPolicy(entityConfig, 'item_code_generation') === ItemCodeGeneration.Manual,
)
```

`getPolicy(entityConfig, key)`:
- Returns the configured value if set on the legal entity.
- Falls back to the central default from `POLICY_DEFAULTS`.
- Is fully typed — the second argument is autocompleted from `keyof LegalEntityPolicies`, and the return type matches the policy's union.
- Accepts `entityConfig` as `null | undefined` (safe to use while the config is loading).

---

## Using a policy in validation

When a policy affects validation (e.g. manual mode makes a field required), wrap the schema in `$derived` so it re-evaluates if the policy changes:

```typescript
const validateCreate = $derived(
  v
    .schema<Partial<Item>>({
      item_category: [v.required()],
      item_status: [v.required()],
      name: [v.required()],
      ...(isManualCode ? { code: [v.required()] } : {}),
    })
    .build(),
)

const validateUpdate = v.schema<Partial<Item>>({}).build()

const validate = $derived(!record ? validateCreate : validateUpdate)
```

---

## Using a policy for field enablement

Combine with update-mode guards where relevant (e.g. a code is editable on create when manual, but always frozen on update):

```svelte
<TextField
  name="code"
  label={m.code()}
  class={FormFieldClass.MaxWidth}
  disabled={!isManualCode || !!record} />
```

---

## Extending with a new policy

When the backend adds a new policy:

1. **Add the key + value union** to `LegalEntityPolicies` in `src/lib/stores/tenant-config/policies.ts`.
2. **Add the default** to `POLICY_DEFAULTS` (mirror the schema's `default`).
3. **Add a typed constant object** if the value is enum-like:
   ```typescript
   export const MyPolicy = {
     OptionA: 'option_a',
     OptionB: 'option_b',
   } as const
   export type MyPolicyMode = (typeof MyPolicy)[keyof typeof MyPolicy]
   ```
4. **Re-export** the new constant and type from `src/lib/stores/tenant-config/index.ts`.

No component changes are needed for components that don't consume the new policy.

---

## When to promote to a predicate helper

`getPolicy(...) === Constant.Value` is the default call site. Only promote to a named predicate (e.g. `isItemCodeManual(entityConfig)`) when **the same comparison is used in ≥ 2 components**. Co-locate the predicate in `policies.ts`.

Rationale: predicates add boilerplate per policy. Defer them until duplication is real, otherwise the file grows faster than the value it provides.

---

## Shape of `entityConfig.policies`

```typescript
// $lib/stores/tenant-config/types.ts
export type LegalEntityConfigResponse = {
  version: number | null
  resources: Record<string, LegalEntityResourceConfig>
  dashboard: DashboardConfigData
  policies: Partial<LegalEntityPolicies>
  created_by: string | null
  created_at: string | null
}
```

`Partial<>` because the backend can omit unset policies — `getPolicy` handles the fallback to `POLICY_DEFAULTS`.

---

## Checklist before shipping a policy-aware component

- [ ] Imported `getPolicy` + the typed constant from `$lib/stores/tenant-config`
- [ ] No raw string literals in comparisons (e.g. `=== 'manual'`)
- [ ] `$derived` used for any state that depends on the policy
- [ ] Validation schemas wrapped in `$derived` if the policy changes required fields
- [ ] Update-mode guards considered (e.g. `!!record`) where relevant
- [ ] New policy added to `LegalEntityPolicies` + `POLICY_DEFAULTS` if introducing one
