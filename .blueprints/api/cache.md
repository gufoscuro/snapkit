# API Cache System

## Overview

`apiRequest` from `$lib/utils/request.ts` includes a built-in in-memory cache for GET requests. The cache reduces redundant network calls for data that was recently fetched.

## How It Works

### Cache Storage

- **In-memory `Map`** keyed by the full URL (including query parameters)
- **Max entries:** 10 (LRU eviction — oldest entry removed when full)
- **TTL:** 5 minutes — cached entries older than this are discarded automatically

### Cache on GET Requests

Every successful GET response is stored in the cache. On subsequent GET calls to the same URL (including query params), the cached data is returned immediately without a network request, as long as the entry is within TTL.

```typescript
// First call: network request, result cached
const customers = await apiRequest<Customer[]>({ url: '/crm/customer' });

// Second call within 5 min: returns cached data, no network request
const customers = await apiRequest<Customer[]>({ url: '/crm/customer' });
```

### Forcing a Fresh Request

Pass `invalidateCache: true` to bypass the cache and fetch fresh data:

```typescript
const customers = await apiRequest<Customer[]>({
  url: '/crm/customer',
  invalidateCache: true
});
```

This removes the cached entry for that exact URL before making the request.

## Cache Invalidation on Mutations

When a non-GET request (POST, PUT, PATCH, DELETE) is made, the cache is automatically invalidated using **parent path invalidation**.

### What Gets Invalidated

Given a mutation URL, the system invalidates:

1. **Exact match** — all cached entries with the same base path (ignoring query params)
2. **Parent path** — all cached entries matching the parent path (one level up)

### Examples

| Mutation | Invalidates (base path) | Invalidates (parent path) |
|---|---|---|
| `PUT /crm/customer/123` | `/crm/customer/123` | `/crm/customer` (listing) |
| `DELETE /crm/customer/123/address/5` | `/crm/customer/123/address/5` | `/crm/customer/123/address` (listing) |
| `POST /crm/customer` | `/crm/customer` | `/crm` |
| `PUT /crm/customer/123/address/5` | `/crm/customer/123/address/5` | `/crm/customer/123/address` (listing) |

This means:
- **Editing a record** automatically invalidates the listing of that resource type
- **Deleting a sub-resource** automatically invalidates the sub-resource listing
- Query param variants (e.g. `/crm/customer?page=2&sort=name`) are also invalidated because matching is done on the base path (without query string)

### Upload Requests

`apiUploadRequest` also triggers the same parent path invalidation after a successful upload.

## Key Functions

| Function | Purpose |
|---|---|
| `apiRequest<T>(options)` | Main request function with cache support |
| `apiUploadRequest<T>(options)` | Multipart upload, invalidates cache on success |
| `invalidateCacheByBasePath(url)` | Manually invalidate cache for a URL and its parent path |

## Future Considerations

The current strategy (parent path invalidation) covers the standard REST pattern where a resource URL is `/{namespace}/{resource}/{id}`. If broader invalidation is needed in the future (e.g. editing a customer address should also invalidate the customer listing), the system can be extended to **prefix-based invalidation** — invalidating all cache entries whose base path starts with a given prefix.
