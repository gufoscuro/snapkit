# Route Builder

Utility per generare URL in modo programmatico a partire dal page registry, evitando URL hardcodati nei componenti.

## Uso Base

```typescript
import { createRoute } from '$lib/utils/route-builder'

// Route senza parametri
createRoute({ $id: 'order-list' })
// → '/orders'

// Route con path params
createRoute({ $id: 'order-detail', params: { uuid: '550e8400-e29b-41d4-a716-446655440000' } })
// → '/orders/550e8400-e29b-41d4-a716-446655440000'

// Route con query params
createRoute({ $id: 'order-list', query: { status: 'pending', page: 1 } })
// → '/orders?status=pending&page=1'

// Combinazione path + query params
createRoute({
  $id: 'order-detail',
  params: { uuid: '123' },
  query: { tab: 'details' }
})
// → '/orders/123?tab=details'
```

## In Componenti Svelte

```svelte
<script>
  import { createRoute } from '$lib/utils/route-builder'

  const orderId = '550e8400-e29b-41d4-a716-446655440000'
</script>

<a href={createRoute({ $id: 'order-detail', params: { uuid: orderId } })}>
  Vai al dettaglio
</a>
```

## API

### `createRoute(options)`

Genera un URL da un page `$id` e parametri.

| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `$id` | `string` | Identificatore univoco della pagina (definito nel page registry) |
| `params` | `Record<string, string \| number>` | Parametri del path (es. `:uuid`) |
| `query` | `Record<string, string \| number \| boolean \| undefined>` | Query string params |

**Throws:** `Error` se `$id` non esiste nel registry.

### `getAllPageIds()`

Restituisce tutti gli `$id` definiti nel page registry. Utile per validazione o autocomplete.

```typescript
import { getAllPageIds } from '$lib/utils/route-builder'

getAllPageIds()
// → ['order-list', 'order-detail', 'sales-order-list', ...]
```

## Definire Nuove Pagine

Nel file `page-registry.ts`, ogni pagina deve avere un `$id` univoco:

```typescript
{
  $id: 'order-detail',           // Identificatore univoco
  $params: Type.Object({         // Schema TypeBox (opzionale, per validazione dev)
    uuid: Type.String()
  }),
  title: 'Order Detail',
  route: '/orders/:uuid',        // Pattern con parametri
  layout: { ... },
  snippets: { ... },
}
```

## Validazione

In **development mode**, se definisci `$params` con uno schema TypeBox, `createRoute` valida i parametri passati e logga un warning in console se non sono conformi:

```typescript
// Con $params: Type.Object({ uuid: Type.String() })
createRoute({ $id: 'order-detail', params: { uuid: 123 } })
// Console warning: [createRoute] Invalid params for "order-detail": [...]
```

In **production**, la validazione viene saltata per performance.

## Performance

Le route compilate vengono cachate in una `Map` interna. La prima chiamata a `createRoute` per un dato `$id` compila il pattern; le chiamate successive riutilizzano la funzione compilata.
