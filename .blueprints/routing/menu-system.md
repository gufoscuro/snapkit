# Menu System

This document describes Snapkit's dynamic menu system, which provides flexible navigation configuration with support for simple links and grouped submenus.

## Overview

The menu system is built on top of Snapkit's dynamic routing system (see [navigation.md](./navigation.md)) and uses the same `pageId`-based approach for generating URLs. This ensures that menus automatically update when routes change, eliminating the need for hardcoded URLs.

**Key Features:**

- ✅ Type-safe menu configuration using `pageId` from page registry
- ✅ Support for nested submenus with two rendering styles
- ✅ Integration with the shadcn-svelte Sidebar component
- ✅ Icons and metadata support
- ✅ Automatic URL generation via `createRoute()`
- ✅ Backward compatibility with legacy `href`-based menus

## Menu Item Types

### Simple Link

A simple menu item that navigates directly to a page.

```typescript
{
  type: 'link',
  label: 'Dashboard',
  pageId: 'dashboard',
  icon: 'House',             // Optional Lucide icon name (PascalCase)
  visible: true,             // Optional, defaults to true
  disabled: false            // Optional, defaults to false
}
```

**With Parameters:**

```typescript
{
  type: 'link',
  label: 'Order Details',
  pageId: 'order-detail',
  params: { uuid: 'abc123' },     // Path parameters
  query: { tab: 'shipping' }      // Query string parameters
}
```

### Submenu

A menu item with nested children, rendered in the LeftSidebar according to its `submenuStyle`.

```typescript
{
  type: 'submenu',
  label: 'sales',
  icon: 'ShoppingCart',
  submenuStyle: 'simple',     // 'simple' | 'collapsible'
  children: [
    { type: 'link', label: 'quotations',       pageId: 'quotations',       icon: 'FileText' },
    { type: 'link', label: 'sales_orders',     pageId: 'sales-orders',     icon: 'ClipboardList' },
    { type: 'link', label: 'warehouse_orders', pageId: 'warehouse-orders', icon: 'PackageOpen' }
  ]
}
```

**Clickable Trigger (Submenu with pageId):**

A `pageId` is supported on the submenu wrapper itself but is currently only honoured by the menu resolver — the LeftSidebar render does not navigate on the trigger. Treat it as forward-compatibility metadata.

```typescript
{
  type: 'submenu',
  label: 'orders',
  pageId: 'order-list',
  submenuStyle: 'collapsible',
  children: [
    { type: 'link', label: 'Pending', pageId: 'order-list', query: { status: 'pending' } },
    { type: 'link', label: 'Shipped', pageId: 'order-list', query: { status: 'shipped' } }
  ]
}
```

## Submenu Styles

The `submenuStyle` property controls how a submenu is rendered in the LeftSidebar.

### 1. Simple Style (`'simple'`)

**Best for:** splitting the sidebar into named sections of flat, iconated links.

The parent label becomes a `Sidebar.GroupLabel` and the children render as flat `Sidebar.MenuItem`s — each with its own icon. There is **no** collapsible behaviour: the section is always expanded.

```typescript
{
  type: 'submenu',
  label: 'general',
  icon: 'Layers',                // Currently not rendered (the group has only a label)
  submenuStyle: 'simple',
  children: [
    { type: 'link', label: 'Home',      pageId: 'home',      icon: 'House' },
    { type: 'link', label: 'customers', pageId: 'customers', icon: 'Users' },
    { type: 'link', label: 'suppliers', pageId: 'suppliers', icon: 'Contact' },
    { type: 'link', label: 'items',     pageId: 'items',     icon: 'Package' }
  ]
}
```

**Renders as:**

```
GENERAL
  🏠  Home
  👥  Customers
  📇  Suppliers
  📦  Items
```

A `simple` submenu always opens its own `<Sidebar.Group>`. If it's preceded by other top-level items (links or `collapsible` submenus), those items are flushed first into a separate inline group. The first inline group inherits the `mainMenu.name` as its `GroupLabel`; subsequent inline groups have no label to avoid repetition.

If the submenu has no visible link children, the group is omitted entirely.

#### Label-less group (for the actionables section)

Set `label: ''` (empty string) on a `simple` submenu to render the group **without** a `GroupLabel` — just the flat iconated links, no section header. The render guards the label with `{#if segment.label}` in `LeftSidebarMenu.svelte`, so an empty (falsy) label emits no header row. `getI18nLabel('')` would return `''` anyway, but the guard avoids an empty header taking vertical space.

```typescript
{
  type: 'submenu',
  label: '',                    // no GroupLabel — renders as a bare list at the top
  icon: 'Layers',
  submenuStyle: 'simple',
  children: [
    { type: 'link', label: 'Home',        pageId: 'home',       icon: 'House' },
    { type: 'link', label: 'to_ship',     pageId: 'to-ship',    icon: 'Truck' },
    { type: 'link', label: 'to_collect',  pageId: 'payments',   icon: 'CreditCard' },
    { type: 'link', label: 'to_invoice',  pageId: 'to-invoice', icon: 'FileClock' }
  ]
}
```

**Why:** this is how the scaffold's first group (`scaffoldDashboardStructure()` in `src/lib/utils/admin-config.ts`) renders the **actionables** — the cross-cutting "things to do" (Da spedire / Da incassare / Da fatturare) sit label-less at the very top, above the labelled `master_data` / `sales` / `invoicing` sections. Prefer this over a labelled group when the items are the primary landing actions and a header would be noise.

### 2. Collapsible Style (`'collapsible'`)

**Best for:** keeping a long list of related links collapsed by default to save vertical space.

The parent renders as a clickable `Sidebar.MenuButton` with a chevron. Children are revealed inside a `Sidebar.MenuSub` and persist their open/closed state in `localStorage` (key: `left-sidebar-menu-open`). Children render with their icon next to the label.

```typescript
{
  type: 'submenu',
  label: 'sales',
  icon: 'ShoppingCart',
  submenuStyle: 'collapsible',
  children: [
    { type: 'link', label: 'quotations',       pageId: 'quotations',       icon: 'FileText' },
    { type: 'link', label: 'sales_orders',     pageId: 'sales-orders',     icon: 'ClipboardList' },
    { type: 'link', label: 'warehouse_orders', pageId: 'warehouse-orders', icon: 'PackageOpen' }
  ]
}
```

**Renders as (collapsed):**

```
🛒  Sales                          ›
```

**Renders as (expanded):**

```
🛒  Sales                          ⌄
    📄  Quotations
    📋  Sales Orders
    📦  Warehouse Orders
```

The trigger expands automatically when the active route matches one of the children (via `isGroupActive`).

## Configuration Structure

Menus are configured under `dashboard.menus.main` of the legal entity config response (`LegalEntityConfigResponse`):

```typescript
interface DashboardConfigData {
  pages: PageConfig[]
  menus: {
    main: MenuConfigData
    [key: string]: MenuConfigData
  }
}

interface MenuConfigData {
  id: string
  name: string          // Used as GroupLabel for the first inline segment
  items: MenuItem[]
}
```

The config is fetched and stored in `tenantConfigStore` by the layout load function. Access menu items via:

```typescript
import { tenantConfigStore } from '$lib/stores/tenant-config'

const menuItems = $derived(tenantConfigStore.currentTenant?.menus.main.items ?? [])
```

### Example: Complete Menu Configuration

The JSON served by `GET /api/legal-entities/{id}/config` (field `dashboard.menus.main.items`):

```typescript
const menuConfig: MenuConfigData = {
  id: 'main',
  name: 'sections',
  items: [
    {
      type: 'submenu',
      label: 'general',
      icon: 'Layers',
      submenuStyle: 'simple',
      children: [
        { type: 'link', label: 'Home',      pageId: 'home',      icon: 'House' },
        { type: 'link', label: 'customers', pageId: 'customers', icon: 'Users' },
        { type: 'link', label: 'suppliers', pageId: 'suppliers', icon: 'Contact' },
        { type: 'link', label: 'items',     pageId: 'items',     icon: 'Package' }
      ]
    },
    {
      type: 'submenu',
      label: 'sales',
      icon: 'ShoppingCart',
      submenuStyle: 'simple',
      children: [
        { type: 'link', label: 'quotations',       pageId: 'quotations',       icon: 'FileText' },
        { type: 'link', label: 'sales_orders',     pageId: 'sales-orders',     icon: 'ClipboardList' },
        { type: 'link', label: 'warehouse_orders', pageId: 'warehouse-orders', icon: 'PackageOpen' }
      ]
    }
  ]
}
```

### Mixing styles

Top-level items can mix `link`, `collapsible` submenus and `simple` submenus. The render groups them as follows:

- Each `simple` submenu opens its own `<Sidebar.Group>` with the submenu's label as `GroupLabel`.
- Adjacent `link` items and `collapsible` submenus are bundled into a single inline group. The first such group inherits `menus.main.name` as its `GroupLabel`; further inline groups (if separated by `simple` submenus) render without a label.

## How Menu Resolution Works

The menu system uses `createRoute()` under the hood to generate URLs from `pageId`:

1. **Menu Configuration** → Contains `MenuItem[]` with `pageId` references
2. **Menu Resolver** (`resolveMenuItems()`) → Converts `MenuItem` to `ResolvedMenuItem` with computed `href`
3. **Component Rendering** → `LeftSidebarMenu` consumes the raw `MenuItem[]` directly and uses an internal `getHref()` helper

```typescript
const menuItem = {
  type: 'link',
  label: 'Order Details',
  pageId: 'order-detail',
  params: { uuid: '123' },
  query: { tab: 'shipping' }
}

const resolved = resolveMenuItem(menuItem)
// → {
//     type: 'link',
//     label: 'Order Details',
//     href: '/orders/123?tab=shipping',
//     visible: true,
//     disabled: false
//   }
```

## Using Menu Items in Components

Menu components read items directly from `tenantConfigStore`, populated by the layout load function before any page renders:

```svelte
<script lang="ts">
  import { tenantConfigStore } from '$lib/stores/tenant-config'
  import type { MenuItem } from '$lib/stores/tenant-config/types'

  const menuItems = $derived<MenuItem[]>(
    tenantConfigStore.currentTenant?.menus.main.items ?? []
  )
</script>
```

The `LeftSidebarMenu` component handles:

- ✅ URL generation via `getHref()` (wraps `createRoute()`)
- ✅ Segment computation: splits top-level items into `simple` groups and inline groups
- ✅ Collapsible submenus with persisted open/closed state in `localStorage`
- ✅ Active state detection via `page.url.pathname`
- ✅ Icon rendering for top-level links, simple-group children and collapsible children
- ✅ Visibility filtering (skips items with `visible: false` and groups whose children are all hidden)

## Icons

Icons use the **PascalCase** Lucide icon names registered in `LeftSidebarMenu`'s `SUPPORTED_ICONS` map. Add new entries to that map (with an individual import) before referencing them from config — referencing an unknown name renders no icon.

| Icon Name       | Use Case                |
| --------------- | ----------------------- |
| `House`         | Dashboard, Home         |
| `Package`       | Items, Inventory        |
| `PackageOpen`   | Warehouse Orders        |
| `Users`         | Customers, Team         |
| `Contact`       | Suppliers, Address book |
| `ShoppingCart`  | Sales, Commerce         |
| `Truck`         | Shipping, Delivery      |
| `Receipt`       | Invoices                |
| `CreditCard`    | Payments                |
| `BarChart`      | Reports, Analytics      |
| `Calendar`      | Scheduling              |
| `Folder`        | Documents, Files        |
| `Tag`           | Labels, Categories      |
| `ClipboardList` | Sales Orders, Lists     |
| `Building`      | Branches, Companies     |
| `Mail`          | Communications          |
| `Globe`         | Languages, Regions      |
| `Layers`        | Generic groups          |
| `FileText`      | Documents, Quotations   |
| `Settings`      | Configuration           |
| `Warehouse`     | Warehouse               |

See [Lucide Icons](https://lucide.dev/) for the full library.

## Best Practices

### 1. Use Descriptive Labels

```typescript
// ❌ Bad
{ type: 'link', label: 'List', pageId: 'order-list' }

// ✅ Good
{ type: 'link', label: 'sales_orders', pageId: 'sales-orders' }
```

Labels are passed through `getI18nLabel()` — prefer paraglide message keys (e.g. `'sales_orders'`) over literal strings so menu copy follows the active locale.

### 2. Choose the Right Submenu Style

- **Always-visible group of related links**: use `'simple'` — turns into a flat sidebar section.
- **Long list you want collapsed by default**: use `'collapsible'` — saves vertical space, persists open state.

### 3. Keep Menu Hierarchy Shallow

```typescript
// ❌ Bad - Too deep, the LeftSidebar render only handles one level of nesting
{
  type: 'submenu',
  children: [
    {
      type: 'submenu',
      children: [...]
    }
  ]
}

// ✅ Good - Flat structure
{
  type: 'submenu',
  children: [
    { type: 'link', ... },
    { type: 'link', ... }
  ]
}
```

### 4. Use Icons Consistently

```typescript
// ✅ Good - Icons used consistently
items: [
  { type: 'link', label: 'Home',      pageId: 'home',      icon: 'House' },
  { type: 'link', label: 'customers', pageId: 'customers', icon: 'Users' },
  { type: 'link', label: 'suppliers', pageId: 'suppliers', icon: 'Contact' }
]

// ❌ Bad - Inconsistent icon usage
items: [
  { type: 'link', label: 'Home',      pageId: 'home',      icon: 'House' },
  { type: 'link', label: 'customers', pageId: 'customers' },
  { type: 'link', label: 'suppliers', pageId: 'suppliers', icon: 'Contact' }
]
```

## Migration from Legacy Format

The system supports backward compatibility with the old `NavItem` format (with `href`), but you should migrate to the new `MenuItem` format:

### Legacy Format (Deprecated)

```typescript
items: [
  {
    label: 'Dashboard',
    href: '/dashboard',  // ❌ Hardcoded URL
    visible: true
  }
]
```

### New Format (Recommended)

```typescript
items: [
  {
    type: 'link',
    label: 'Dashboard',
    pageId: 'dashboard',
    visible: true
  }
]
```

**Why migrate?**

- ✅ **Type-safe**: `pageId` validated against the page registry
- ✅ **Maintainable**: URLs update automatically when routes change
- ✅ **Flexible**: parameters, query strings, submenus
- ✅ **Consistent**: same routing system as the rest of the app

## Related Documentation

- [Navigation and Routing](./navigation.md) - Core routing system
- [Route Builder](../../src/lib/utils/ROUTE-BUILDER.md) - `createRoute()` API
- [Component Development Guidelines](../components/development-guidelines.md) - Creating menu-aware components

## Troubleshooting

### Menu items not appearing

**Cause:** `visible: false`, missing `pageId` in page registry, or a `simple` submenu with all children hidden (group is omitted entirely in that case).

**Solution:**

1. Check that `visible` is not set to `false` on the item or all of its children.
2. Verify that `pageId` exists in the page registry.
3. Check the browser console for warnings about broken links.

### "Cannot read properties of undefined" error

**Cause:** Menu configuration in old format or malformed.

**Solution:**

1. Check that all menu items have a `type` field.
2. Verify `children` array exists for submenu items.
3. Check the browser console for migration warnings.

### URLs not updating when routes change

**Cause:** Still using legacy `href` format.

**Solution:** Migrate to the new `MenuItem` format with `pageId`.

### Submenu not rendering correctly

**Cause:** Invalid `submenuStyle` value.

**Solution:** Use one of `'simple' | 'collapsible'`. Older values (`'list'`, `'icon'`, `'grid'`) are no longer supported.

### Submenu icon not showing

**Cause:** Icon name not registered in `SUPPORTED_ICONS` in `LeftSidebarMenu.svelte`, or wrong casing.

**Solution:** Use PascalCase names (e.g. `'House'`, `'PackageOpen'`). To use a new Lucide icon, add an explicit import and a `SUPPORTED_ICONS` entry in `LeftSidebarMenu.svelte` — bundling the entire Lucide library is intentionally avoided.
