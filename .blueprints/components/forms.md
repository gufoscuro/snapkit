# Form System

Snapkit uses a context-based form system built on Svelte 5 runes. This architecture eliminates prop drilling and enables seamless communication between form containers and field components.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  FormUtil                                               │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Form State (createFormState)                     │  │
│  │  - values, errors, touched                        │  │
│  │  - isValid, isDirty, inflight                     │  │
│  └───────────────────────────────────────────────────┘  │
│                         │                               │
│                   setFormContext()                      │
│                         │                               │
│                         ▼                               │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Context API (FormAPI)                            │  │
│  │  - values, errors, isValid, isDirty               │  │
│  │  - updateField(), validateField(), reset()        │  │
│  └───────────────────────────────────────────────────┘  │
│                         │                               │
│         ┌───────────────┼───────────────┐               │
│         ▼               ▼               ▼               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│  │ TextField   │ │ Selector    │ │ CustomField │        │
│  │ (autowired) │ │ (autowired) │ │ (autowired) │        │
│  └─────────────┘ └─────────────┘ └─────────────┘        │
└─────────────────────────────────────────────────────────┘
```

## Core Files

| File                                         | Purpose                              |
| -------------------------------------------- | ------------------------------------ |
| `$components/core/form/FormUtil.svelte`      | Form container component             |
| `$components/core/form/form-state.svelte.ts` | Reactive state management with runes |
| `$components/core/form/form-context.ts`      | Context API (get/set)                |
| `$components/core/form/validation.ts`        | Validation builder                   |

## FormUtil Component

`FormUtil` is the form container that:

- Creates and manages form state
- Exposes the FormAPI via Svelte context
- Handles form submission, success, and failure callbacks

### Props

```typescript
type Props = {
  initialValues: T;                    // Initial form values
  validate?: ValidateFn<T>;            // Validation function
  onSubmit: (values: T) => Promise<unknown>;  // Submit handler
  onSuccess?: (payload: SuccessPayload) => void;
  onFailure?: (payload: FailurePayload) => void;
  locked?: boolean;                    // Disable form interactions
  novalidate?: boolean;                // Disable native validation (default: true)
  class?: string;
};
```

### Usage

```svelte
<script lang="ts">
  import FormUtil from '$components/core/form/FormUtil.svelte'
  import { v } from '$components/core/form/validation'

  type MyFormValues = {
    name: string
    email: string
    quantity: number
  }

  const initialValues: MyFormValues = {
    name: '',
    email: '',
    quantity: 1,
  }

  const validate = v
    .schema<MyFormValues>({
      name: [v.required({ field: 'Name' })],
      email: [v.required(), v.email()],
      quantity: [v.min(1)],
    })
    .build()

  async function handleSubmit(values: MyFormValues) {
    await apiRequest({ method: 'POST', url: '/api/items', body: values })
  }
</script>

<FormUtil {initialValues} {validate} onSubmit={handleSubmit}>
  <!-- Field components go here - they access context automatically -->
  <MyFormFields />
</FormUtil>
```

## Context API

### FormAPI Interface

```typescript
type FormAPI<T> = {
  // Read-only state
  readonly values: T;
  readonly errors: Partial<Record<keyof T, string>>;
  readonly touched: Partial<Record<keyof T, boolean>>;
  readonly isValid: boolean;
  readonly isDirty: boolean;
  readonly inflight: boolean;
  readonly locked: boolean;
  readonly errorMessage: string | null;

  // Methods
  updateField: <K extends keyof T>(name: K, value: T[K]) => void;
  validateField: <K extends keyof T>(name: K) => void;
  touchField: <K extends keyof T>(name: K) => void;
  reset: () => void;
  submit: (option?: string | null) => void;
};
```

### Accessing Context

```typescript
import { getFormContext, getFormContextOptional } from '$components/core/form/form-context';

// Required context - throws if not inside FormUtil
const form = getFormContext<MyFormValues>();

// Optional context - returns null if not inside FormUtil
const form = getFormContextOptional<MyFormValues>();
```

## Creating Field Components

Field components should **autowire** to the form context. This means they automatically bind to form state without requiring explicit props for value/onChange.

### Pattern for Field Components

```svelte
<script lang="ts">
  import { getFormContextOptional } from '$components/core/form/form-context'
  import FormFieldMessages from '$components/features/form/FormFieldMessages.svelte'
  import Label from '$components/ui/label/label.svelte'
  import Input from '$components/ui/input/input.svelte'

  type Props = {
    name: string // Field name (required for context binding)
    label?: string
    showLabel?: boolean
    showErrorMessage?: boolean
    placeholder?: string
    // ... other field-specific props
  }

  let { name, label = '', showLabel = true, showErrorMessage = true, placeholder = '' }: Props = $props()

  // Autowire to form context (optional = works standalone too)
  const form = getFormContextOptional()

  // Derive value and error from context
  const value = $derived((form?.values[name] as string) ?? '')
  const error = $derived((form?.errors[name] as string) ?? undefined)

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement
    form?.updateField(name, target.value)
  }

  function handleBlur() {
    form?.touchField(name)
  }
</script>

<div>
  <Label for={name} class={showLabel ? '' : 'sr-only'}>{label}</Label>
  <FormFieldMessages id={name} {error} {showErrorMessage}>
    <Input
      id={name}
      {name}
      {value}
      oninput={handleInput}
      onblur={handleBlur}
      {placeholder}
      class={error ? 'border-destructive' : ''} />
  </FormFieldMessages>
</div>
```

### Key Principles

1. **Use `getFormContextOptional()`** - Allows the component to work both inside and outside a form
2. **`name` prop is required** - Used to bind to the correct field in form state
3. **Derive values reactively** - Use `$derived` to read from context
4. **Call `updateField()` on change** - Updates form state
5. **Call `touchField()` on blur** - Tracks user interaction
6. **Handle errors via FormFieldMessages** - Consistent error display

### Example: Selector Component

```svelte
<script lang="ts">
  import { getFormContextOptional } from '$components/core/form/form-context'
  import FormGenericSingleSelector from '$components/features/form/FormGenericSingleSelector.svelte'

  type Props = {
    name: string
    label?: string
  }

  let { name, label = 'Material' }: Props = $props()

  const form = getFormContextOptional()

  // Get selected value from form context
  const selectedValue = $derived.by(() => {
    const id = form?.values[name] as string
    if (!id) return undefined
    // Map ID to ExtendedOption format
    return { value: id, label: '...' }
  })

  async function fetchMaterials(query) {
    return await apiRequest({ url: '/materials', queryParams: query })
  }
</script>

<FormGenericSingleSelector {name} {label} {selectedValue} fetchFunction={fetchMaterials} />
```

## Validation Builder

The validation builder provides a declarative API for defining form validation rules.

### Basic Usage

```typescript
import { v } from '$components/core/form/validation';

const validate = v.schema<MyFormValues>({
  name: [v.required({ field: 'Name' })],
  email: [v.required(), v.email()],
  quantity: [v.required(), v.min(1, { field: 'Quantity' })],
  website: [v.pattern(/^https?:\/\//, { message: 'Must start with http(s)://' })]
}).build();
```

### Available Validators

| Validator                 | Description                      |
| ------------------------- | -------------------------------- |
| `v.required(opts?)`       | Field must have a value          |
| `v.min(n, opts?)`         | Number must be >= n              |
| `v.max(n, opts?)`         | Number must be <= n              |
| `v.minLength(n, opts?)`   | String must have >= n characters |
| `v.maxLength(n, opts?)`   | String must have <= n characters |
| `v.email(opts?)`          | Must be valid email format       |
| `v.pattern(regex, opts?)` | Must match regex pattern         |
| `v.custom(fn, opts)`      | Custom validation function       |

### Options

All validators accept an optional `options` object:

```typescript
type ValidatorOptions = {
  message?: string;  // Override default error message
  field?: string;    // Field name for localized messages
};
```

### Localized Messages

Use Paraglide messages for the `field` option:

```typescript
import * as m from '$lib/paraglide/messages';

const validate = v.schema<MyFormValues>({
  material: [v.required({ field: m.material() })],  // "Material is required" / "Materiale è obbligatorio"
  quantity: [v.min(1, { field: m.quantity() })]
}).build();
```

### Cross-Field Validation

Use `.refine()` for validation that depends on multiple fields:

```typescript
const validate = v.schema<PasswordForm>({
  password: [v.required(), v.minLength(8)],
  confirmPassword: [v.required()]
}).refine((values) => {
  if (values.password !== values.confirmPassword) {
    return { confirmPassword: 'Passwords must match' };
  }
}).build();
```

### Custom Validators

```typescript
const validate = v.schema<MyFormValues>({
  code: [
    v.required(),
    v.custom(
      (value) => value.startsWith('SKU-'),
      { message: 'Code must start with SKU-' }
    )
  ]
}).build();
```

## Form Scaffolding Example

### Single File (Autowired Components Only)

When all your fields are autowired components (they call `getFormContext()` internally), you can keep everything in one file:

**File:** `src/lib/components/features/orders/OrderForm.svelte`

```svelte
<script lang="ts">
  import FormUtil from '$components/core/form/FormUtil.svelte'
  import { v } from '$components/core/form/validation'
  import { apiRequest } from '$lib/utils/request'
  import * as m from '$lib/paraglide/messages'
  import MaterialSelector from '$components/features/materials/MaterialSelector/default/MaterialSelector.svelte'
  import ProductSelector from '$components/features/products/FormProductSelector.svelte'
  import QuantityField from '$components/features/form/QuantityField.svelte'
  import { Button } from '$components/ui/button'

  type OrderFormValues = {
    material: string
    product: string
    quantity: number
  }

  const initialValues: OrderFormValues = {
    material: '',
    product: '',
    quantity: 1,
  }

  const validate = v
    .schema<OrderFormValues>({
      material: [v.required({ field: m.material() })],
      product: [v.required({ field: m.product() })],
      quantity: [v.required(), v.min(1, { field: m.quantity() })],
    })
    .build()

  async function handleSubmit(values: OrderFormValues) {
    await apiRequest({ method: 'POST', url: '/orders', body: values })
  }
</script>

<FormUtil {initialValues} {validate} onSubmit={handleSubmit} class="space-y-6">
  <!-- All these components call getFormContext() internally -->
  <MaterialSelector name="material" />
  <ProductSelector name="product" />
  <QuantityField name="quantity" />
  <Button type="submit">Save Order</Button>
</FormUtil>
```

### Need a Custom Field? Create an Autowired Component

Instead of accessing `form.values` directly, create a reusable autowired component:

**File:** `src/lib/components/features/form/NotesField.svelte`

```svelte
<script lang="ts">
  import { getFormContextOptional } from '$components/core/form/form-context'
  import { Textarea } from '$components/ui/textarea'
  import Label from '$components/ui/label/label.svelte'

  type Props = {
    name: string
    label?: string
  }

  let { name, label = 'Notes' }: Props = $props()

  const form = getFormContextOptional()
  const value = $derived((form?.values[name] as string) ?? '')
  const error = $derived(form?.errors[name] as string | undefined)
</script>

<div>
  <Label for={name}>{label}</Label>
  <Textarea
    id={name}
    {value}
    oninput={e => form?.updateField(name, e.currentTarget.value)}
    class={error ? 'border-destructive' : ''} />
  {#if error}
    <p class="text-sm text-destructive">{error}</p>
  {/if}
</div>
```

Now you can use it in any form:

```svelte
<FormUtil ...>
  <MaterialSelector name="material" />
  <NotesField name="notes" />
  <!-- Autowired! -->
</FormUtil>
```

**This is the preferred pattern.** Build a library of autowired field components, so forms stay simple and in a single file.

## Reference Implementation

See the POC implementation for a complete working example:

- **Form Container:** `src/lib/components/features/_poc/FormPOC.svelte`
- **Form Fields:** `src/lib/components/features/_poc/FormPOCInner.svelte`

## Best Practices

1. **Always use autowired field components** - Every field should be a component that calls `getFormContext()` internally. This keeps forms simple and in a single file.
2. **Build a field component library** - Create reusable autowired components for common field types (`TextField`, `NumberField`, `NotesField`, etc.)
3. **Always use `name` prop** - Required for context binding
4. **Use `getFormContextOptional()` in field components** - Makes them reusable both inside and outside forms
5. **Use validation builder** - More maintainable than manual validation functions
6. **Localize field names** - Pass Paraglide messages to `field` option for localized errors
7. **Handle loading states** - Check `form.inflight` to disable submit buttons
