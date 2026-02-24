# Detail Record Form

A **detail record form** is a feature component that handles both the **create** and **update** of a single entity (e.g. a Customer, Order, Supplier). It uses `useDetailRecord` for lifecycle management and `FormUtil` for form state.

## Step-by-step workflow

### 1. Identify the entity type

Use the **Moddo API MCP** to find the entity's TypeScript type and its create/update API schemas.

```
mcp__moddo-api__get-api-documentation({ group: "Customers" })
```

Key things to extract:
- The TypeScript type (e.g. `Customer` from `$lib/types/api-types`)
- **Create (POST)** required fields → used in `validateCreate`
- **Update (PUT)** required fields + `version` → used in `validateUpdate`
- The API base URL pattern (e.g. `/legal-entities/{legalEntity}/customers`)

---

### 2. Identify the resource config key

Ask the user to confirm the key used under `entityConfig.resources` for this entity.
Typically it matches the API resource path: `'customers'`, `'orders'`, etc.

Use the **Moddo Legal Entity Config MCP** to verify:
```
mcp__moddo-legal-entity-config__get-legal-entity-config-schema()
```

---

### 3. Create the contract file

The contract defines what the component **provides** to sibling components (e.g. the loaded record for a sidebar) and what it **consumes**.

**File:** `src/lib/components/features/<domain>/<EntityName>Details/default/<EntityName>Details.contract.ts`

```typescript
import { Type } from '@sinclair/typebox'
import type { ComponentContract } from '$lib/contexts/page-state'

// Mirror the relevant fields from the entity type using TypeBox schemas.
// Include all fields that sibling components (sidebars, related tables) might need.
const EntityDataSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  status: Type.Union([Type.Literal('active'), Type.Literal('inactive')]),
  // ... add all relevant fields
  version: Type.Number(),
})

export const EntityDetailsContract = {
  $id: 'EntityDetails',
  provides: {
    entity: EntityDataSchema,  // key used with useProvides/useConsumes
  },
  consumes: {},
} as const satisfies ComponentContract
```

---

### 4. Create the component

**File:** `src/lib/components/features/<domain>/<EntityName>Details/default/<EntityName>Details.svelte`

#### 4a. Full component scaffold

```svelte
<!--
  @component EntityDetails
  @description Fetches and displays entity details. Provides entity data to page state
  so other snippets on the same page (e.g. EntitySidebar) can consume it without a second request.
  @keywords entity, details, form
  @api GET /api/legal-entities/{legalEntity}/entities/{entity} (Moddo API)
-->
<script lang="ts" module>
  export { EntityDetailsContract as contract } from './EntityDetails.contract.js'
</script>

<script lang="ts">
  import RequestPlaceholder from '$components/core/common/RequestPlaceholder.svelte'
  import BusyButton from '$components/core/form/BusyButton.svelte'
  import { FormFieldClass } from '$components/core/form/form.js'
  import FormUtil from '$components/core/form/FormUtil.svelte'
  import TextField from '$components/core/form/TextField.svelte'
  import SelectField from '$components/core/form/SelectField.svelte'
  import { v } from '$components/core/form/validation'
  import { useProvides } from '$lib/contexts/page-state'
  import { useDetailRecord } from '$lib/hooks/use-detail-record.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { Entity } from '$lib/types/api-types'
  import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
  import type { SnippetProps } from '$utils/runtime'
  import { EntityDetailsContract } from './EntityDetails.contract.js'

  let { pageDetails, legalEntity, entityConfig }: SnippetProps = $props()

  // Resource config: drives field visibility and dynamic required validation
  const resourceConfig = $derived(entityConfig?.resources?.['entities'])  // ← confirm key with user
  const uuid = $derived(pageDetails.params.uuid)
  const legalEntityId = $derived(legalEntity?.id)

  const entityHandle = useProvides(EntityDetailsContract, 'entity')
  const breadcrumbTitle = useBreadcrumbTitle()

  // ── useDetailRecord ──────────────────────────────────────────────────────────
  // Manages fetch / create / update lifecycle.
  // IMPORTANT: do NOT destructure reactive properties (record, promise, isCreate).
  // Use $derived to preserve reactivity. Functions are safe to destructure.
  const detail = useDetailRecord<Entity>({
    getUuid: () => uuid,
    fetchUrl:  (id) => `/legal-entities/${legalEntityId}/entities/${id}`,
    createUrl: ()   => `/legal-entities/${legalEntityId}/entities`,
    updateUrl: (id) => `/legal-entities/${legalEntityId}/entities/${id}`,
    detailPageId: 'entity-details',          // ← page $id from tenant config
    onFetched: (data) => {
      entityHandle.set(data)
      breadcrumbTitle.set(data.name)
    },
    cleanup: () => {
      entityHandle.unset()
      breadcrumbTitle.clear()
    },
    extraSubmitData: { custom_fields: {} },  // ← include if entity supports custom fields
  })

  const record  = $derived(detail.record)
  const promise = $derived(detail.promise)
  const { handleSubmit, handleSuccess, handleFailure } = detail
  // ─────────────────────────────────────────────────────────────────────────────

  // Default values cover the create case; spread record for the update case
  const initialValues = $derived.by(() => ({
    // Add all entity fields with sensible defaults
    name: '',
    status: 'active' as const,
    ...(record ?? {}),
  }))

  // Validation: create and update schemas are often different.
  // Create: validate all fields required by the POST schema.
  // Update: only validate format/business rules (dynamic required handled by resourceConfig).
  const validateCreate = v
    .schema<Partial<Entity>>({
      name:   [v.required()],
      status: [v.required()],
      // ... add all POST-required fields
    })
    .build()

  const validateUpdate = v
    .schema<Partial<Entity>>({
      // Only format/business rules — required fields come from resourceConfig
      email: [v.email()],
    })
    .build()

  const validate = $derived(!!record ? validateUpdate : validateCreate)
</script>

<RequestPlaceholder {promise}>
  {#snippet content()}
    <FormUtil
      {initialValues}
      {validate}
      {resourceConfig}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onFailure={handleFailure}
      class="flex flex-col gap-4">
      {#snippet withContext(formAPI)}
        <!-- Add form fields here -->
        <TextField name="name" label={m.name()} class={FormFieldClass.MaxWidth} focus={!record} />

        <div class="fixed right-0 bottom-0 flex h-14 w-full items-center justify-end px-4">
          <BusyButton type="submit">{m.save_changes()}</BusyButton>
        </div>
      {/snippet}
    </FormUtil>
  {/snippet}
</RequestPlaceholder>
```

---

### 5. Create supporting files

**Barrel export** (`index.ts`):
```typescript
export { default as EntityDetails } from './default/EntityDetails.svelte'
```

**Mock data** (`EntityDetails.mock.ts`) — required for admin panel preview:
```typescript
import type { SnippetProps } from '$utils/runtime'

export const mockEntityDetailsProps: SnippetProps = {
  pageDetails: {
    config: {
      $id: 'entity-details',
      title: 'Entity Details',
      route: '/entities/:uuid',
      layout: { componentKey: 'layouts.Detail' as never, enabled: true },
    },
    params: { uuid: 'a1b2c3d4-0000-0000-0000-000000000001' },
  },
  legalEntity: {
    id: 'le-uuid-0001',
    name: 'Moddo S.r.l.',
    // ... other required LegalEntity fields
  } as never,
  entityConfig: null,
}
```

---

### 6. Register and run generation

```bash
npm run generate:components-registry
```

---

## `useDetailRecord` reference

**File:** `src/lib/hooks/use-detail-record.svelte.ts`

```typescript
const detail = useDetailRecord<T extends { id: string }>({
  getUuid:      () => string | undefined,   // undefined = create mode
  fetchUrl:  (uuid) => string,              // GET URL builder
  createUrl:    () => string,               // POST URL builder
  updateUrl: (uuid) => string,              // PUT URL builder
  detailPageId:    string,                  // page $id for post-create navigation
  onFetched?:   (record: T) => void,        // side effects after fetch
  cleanup?:     () => void,                 // side effects on unmount
  extraSubmitData?: Record<string, unknown> // merged into every submit payload
})
```

**Return values:**

| Property | Type | Notes |
|---|---|---|
| `detail.record` | `T \| null` | Reactive via `$state` — use `$derived` to extract |
| `detail.promise` | `Promise \| null` | Reactive — use `$derived` to extract |
| `detail.isCreate` | `boolean` | Reactive — use `$derived` to extract |
| `detail.handleSubmit` | `function` | Safe to destructure |
| `detail.handleSuccess` | `function` | Safe to destructure |
| `detail.handleFailure` | `function` | Safe to destructure |

**⚠️ Reactivity rule — CRITICAL:**

```typescript
// ❌ WRONG: destructuring $state-backed getters captures value once (null forever)
const { record, promise } = useDetailRecord(...)

// ✅ CORRECT: $derived re-reads the getter on every change
const detail  = useDetailRecord(...)
const record  = $derived(detail.record)
const promise = $derived(detail.promise)

// ✅ Functions are safe to destructure (not reactive)
const { handleSubmit, handleSuccess, handleFailure } = detail
```

**Behavior:**
- **Create mode** (`uuid = undefined`): skips fetch, `record = null`, `promise = null`, form renders immediately
- **Update mode** (`uuid` present): fetches via GET, shows `RequestPlaceholder` spinner during load
- **Submit (create)**: POST → on success, navigates to `createRoute({ $id: detailPageId, params: { uuid: result.id } })`
- **Submit (update)**: PUT → on success, updates `record` with API response
- Both modes: `toast.success(m.changes_saved())` on success, `toast.error(m.common_error())` on failure

---

## Validation patterns

### Create vs update schemas

APIs typically differ between POST (many required fields) and PUT (most optional, `version` required). Use a `$derived` to switch:

```typescript
const validateCreate = v
  .schema<Partial<Entity>>({
    // Mirror the POST required fields from the API schema
    name:    [v.required()],
    type:    [v.required()],
    status:  [v.required()],
    email:   [v.email()],
  })
  .build()

const validateUpdate = v
  .schema<Partial<Entity>>({
    // Only format/business rules — dynamic required comes from resourceConfig
    email: [v.email()],
  })
  .build()

const validate = $derived(!!record ? validateUpdate : validateCreate)
```

### Dynamic required fields from config

Pass `resourceConfig` to `FormUtil`. It will automatically add `v.required()` for any field marked `required: true` in `entityConfig.resources['key'].fields`. Base validation errors take priority over config errors.

```typescript
const resourceConfig = $derived(entityConfig?.resources?.['your-resource-key'])

// Then pass to FormUtil:
<FormUtil {resourceConfig} ...>
```

### How to check the API schema

```
mcp__moddo-api__get-api-documentation({ group: "EntityName" })
```

Look for the POST endpoint (create) and PUT endpoint (update). The required fields in the POST body become `validateCreate` entries; optional PUT fields rely on `resourceConfig`.

---

## Field visibility

Fields can be hidden via two mechanisms, both handled automatically:

**1. Local logic** (conditional on form values):
```svelte
<TextField name="last_name" hidden={formAPI?.values?.type !== 'individual'} />
```

**2. Config-driven** (from `entityConfig.resources`):
Fields with `visible: false` in the resource config are hidden automatically when `resourceConfig` is passed to `FormUtil`. No extra props needed.

---

## Page state: sharing the record with siblings

If sibling components (e.g. a sidebar) need access to the loaded record:

**1. Define schema in the contract** (see step 3 above).

**2. Use `useProvides` in the component:**
```typescript
const entityHandle = useProvides(EntityDetailsContract, 'entity')
```

**3. Set/unset via `onFetched` and `cleanup`:**
```typescript
useDetailRecord({
  ...
  onFetched: (data) => entityHandle.set(data),
  cleanup:   ()     => entityHandle.unset(),
})
```

**4. Consume in the sibling component:**
```typescript
// SiblingComponent.svelte
const entityHandle = useConsumes(SiblingContract, 'entity')
const entity = $derived(entityHandle.get())
```

---

## Checklist

Before considering the component complete:

- [ ] Entity type identified via Moddo API MCP
- [ ] Resource config key confirmed with user
- [ ] Contract file created (`<Entity>Details.contract.ts`)
- [ ] `useDetailRecord` configured with correct URLs and `detailPageId`
- [ ] `record` and `promise` extracted with `$derived` (not destructured directly)
- [ ] `initialValues` covers all entity fields with sensible defaults
- [ ] `validateCreate` matches POST required fields from API schema
- [ ] `validateUpdate` contains only format/business rules
- [ ] `resourceConfig` passed to `FormUtil`
- [ ] `useProvides` + contract in place (if siblings need the record)
- [ ] `breadcrumbTitle.set(data.name)` in `onFetched` (for detail pages)
- [ ] All labels use `m.*()` i18n keys — add missing keys to both `en.json` and `it.json`
- [ ] Mock data file created (`<Entity>Details.mock.ts`)
- [ ] Barrel export file created (`index.ts`)
- [ ] `npm run generate:components-registry` executed
- [ ] Validated with `svelte-autofixer` (zero issues)
