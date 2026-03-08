# API Integration Guidelines

## API Types Management

**IMPORTANT:** Do NOT define API response types locally within components. All API types must be centralized in `src/lib/types/api-types.ts`.

**Rules:**

1. **Never define API types inline** in components (e.g., `type OrderSummary = {...}`)
2. **Always add new API types** to `src/lib/types/api-types.ts`
3. **Import and reuse** types from the centralized location

**Example:**

```typescript
// ❌ WRONG - Don't define types locally in components
// src/lib/components/features/supply/SupplyOrdersTable.svelte
type OrderSummary = {
  id?: string
  name: string
  status: 'draft' | 'sent' | 'accepted'
  // ...
}

// ✅ CORRECT - Define in api-types.ts and import
// src/lib/types/api-types.ts
export type OrderSummary = {
  id?: string
  name: string
  status: 'draft' | 'sent' | 'accepted'
  // ...
}

// src/lib/components/features/supply/SupplyOrdersTable.svelte
import type { OrderSummary } from '$lib/types/api-types'
```

**Why:** This ensures type consistency across the application, enables reusability, and makes it easier to update types when the API changes.

## Using the API Client

**CRITICAL:** Always use `api` from `$lib/utils/request.ts` instead of raw `fetch()`.

For **new code**, use the typed `api` client. The legacy `apiRequest` / `safeApiRequest` functions are still exported for backward compatibility but should not be used in new implementations.

### Basic Usage

```typescript
import { api } from '$lib/utils/request';
import { createQueryRequestObject } from '$lib/utils/filters';
import type { OrderSummary, CreateOrderBody } from '$lib/types/api-types';

// GET request — typed response
const orders = await api.get<OrderSummary[]>('/sales/order');

// GET with query parameters
const orders = await api.get<OrderSummary[]>('/sales/order', {
  queryParams: createQueryRequestObject(query)
});

// POST request — typed response and body
const created = await api.post<OrderSummary, CreateOrderBody>('/sales/order', {
  data: { name: 'New order', customer_id: '123' }
});

// PUT / PATCH — same pattern
await api.put<OrderSummary, UpdateOrderBody>('/sales/order/123', { data: changes });
await api.patch<OrderSummary, Partial<UpdateOrderBody>>('/sales/order/123', { data: partial });

// DELETE
await api.delete('/sales/order/123');

// File upload
const result = await api.upload<UploadResponse>('/sales/order/123/attachment', {
  body: formData
});
```

### Safe Requests (no throw)

Use `api.safe.*` when you want `{ data, error }` instead of exceptions:

```typescript
const { data: orders, error } = await api.safe.get<OrderSummary[]>('/sales/order');
if (error) {
  // handle error — error is typed as ApiError | null
}
```

### Custom Prefixed Client

Use `createApiClient(prefix)` when multiple calls share the same base path:

```typescript
import { createApiClient } from '$lib/utils/request';

const salesApi = createApiClient('/sales');
const orders = await salesApi.get<OrderSummary[]>('/order');
const order = await salesApi.get<OrderSummary>('/order/123');
```

### Error Handling

Always handle loading and error states when fetching data:

```typescript
let loading = $state(true);
let error = $state<string | null>(null);
let data = $state<OrderSummary[]>([]);

async function loadOrders() {
  loading = true;
  error = null;

  try {
    data = await api.get<OrderSummary[]>('/sales/order');
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load orders';
  } finally {
    loading = false;
  }
}
```

### Legacy Functions (deprecated for new code)

`apiRequest<T>` and `safeApiRequest<T>` are still exported and work as before. Existing code does not need to be migrated immediately, but all **new** implementations should use `api`.

## Discovering API Endpoints

Use the **arke MCP** to discover available API endpoints:

```typescript
// Use arke MCP tool: search_api
// Query: "list orders"
// Returns: Available endpoints with TypeScript types
```

**Workflow:**

1. **Search for endpoints**: Use natural language queries like "list customers", "create order", "update product"
2. **Review response types**: Examine the returned TypeScript types
3. **Add types to api-types.ts**: Centralize the types
4. **Implement the request**: Use `apiRequest` utility
5. **Handle states**: Implement loading, error, and success states

## Query Parameters and Filters

Use `createQueryRequestObject` from `$lib/utils/filters` to build query parameters:

```typescript
import { createQueryRequestObject } from '$lib/utils/filters';

const query = {
  status: 'pending',
  customer: customerId,
  dateFrom: startDate,
  dateTo: endDate
};

const orders = await apiRequest<OrderSummary[]>({
  url: 'sales/order',
  queryParams: createQueryRequestObject(query)
});
```

## Caching

`apiRequest` includes a built-in in-memory cache for GET requests with automatic invalidation on mutations. See **[Cache System](./cache.md)** for full documentation.

**Key points:**
- GET responses are cached for 5 minutes (max 10 entries)
- Non-GET requests automatically invalidate the cache for the resource and its parent listing
- Use `invalidateCache: true` to force a fresh GET request

## Best Practices

1. **Always use TypeScript types** from `api-types.ts`
2. **Never use raw fetch()** — use `api` from `$lib/utils/request` instead
3. **Use `api.*` for new code** — not the legacy `apiRequest` / `safeApiRequest`
4. **Handle all async states** — loading, error, success
5. **Use Moddo MCP** to discover endpoints before implementing
6. **Centralize types** — never define API types inline
7. **Use query builders** — leverage `createQueryRequestObject` for filters
