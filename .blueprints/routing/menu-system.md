# Menu System

This document describes Snapkit's dynamic menu system, which provides flexible navigation configuration with support for simple links and nested submenus.

## Overview

The menu system is built on top of Snapkit's dynamic routing system (see [navigation.md](./navigation.md)) and uses the same `pageId`-based approach for generating URLs. This ensures that menus automatically update when routes change, eliminating the need for hardcoded URLs.

**Key Features:**

- ✅ Type-safe menu configuration using `pageId` from page registry
- ✅ Support for nested submenus with multiple rendering styles
- ✅ Integration with shadcn-svelte Navigation Menu component
- ✅ Icons, descriptions, and metadata support
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
  icon: 'home',              // Optional Lucide icon name
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

A menu item with nested children, rendered using shadcn-svelte Navigation Menu.

```typescript
{
  type: 'submenu',
  label: 'Orders',
  icon: 'package',
  submenuStyle: 'list',      // 'list' | 'simple' | 'icon' | 'grid'
  children: [
    {
      type: 'link',
      label: 'All Orders',
      pageId: 'order-list',
      description: 'View and manage all orders'  // Used in 'list' style
    },
    {
      type: 'link',
      label: 'Create Order',
      pageId: 'order-create',
      description: 'Create a new sales order'
    }
  ]
}
```

**Clickable Trigger (Submenu with pageId):**

```typescript
{
  type: 'submenu',
  label: 'Orders',
  pageId: 'order-list',      // Makes the trigger itself clickable
  submenuStyle: 'simple',
  children: [
    { type: 'link', label: 'Pending', pageId: 'order-list', query: { status: 'pending' } },
    { type: 'link', label: 'Shipped', pageId: 'order-list', query: { status: 'shipped' } }
  ]
}
```

## Submenu Styles

The `submenuStyle` property controls how submenu children are rendered:

### 1. List Style (`'list'`)

**Best for:** Feature sections with descriptions

Shows title + description for each item. Ideal for explaining what each section does.

```typescript
{
  type: 'submenu',
  label: 'Sales',
  submenuStyle: 'list',
  children: [
    {
      type: 'link',
      label: 'Customers',
      pageId: 'customer-list',
      description: 'Manage your customer database'
    },
    {
      type: 'link',
      label: 'Quotes',
      pageId: 'quote-list',
      description: 'View and create sales quotes'
    }
  ]
}
```

**Renders as:**

```
┌─────────────────────────────┐
│ Customers                   │
│ Manage your customer database│
├─────────────────────────────┤
│ Quotes                      │
│ View and create sales quotes│
└─────────────────────────────┘
```

### 2. Simple Style (`'simple'`)

**Best for:** Compact menus with short lists

Minimal style with just link text. Most compact option.

```typescript
{
  type: 'submenu',
  label: 'Settings',
  submenuStyle: 'simple',
  children: [
    { type: 'link', label: 'Profile', pageId: 'settings-profile' },
    { type: 'link', label: 'Preferences', pageId: 'settings-preferences' },
    { type: 'link', label: 'Security', pageId: 'settings-security' }
  ]
}
```

**Renders as:**

```
┌──────────────┐
│ Profile      │
│ Preferences  │
│ Security     │
└──────────────┘
```

### 3. Icon Style (`'icon'`)

**Best for:** Visual workflow states or categories

Shows icon + label for each item. Great for status-based navigation.

```typescript
{
  type: 'submenu',
  label: 'Workflow',
  submenuStyle: 'icon',
  children: [
    { type: 'link', label: 'Backlog', pageId: 'workflow-backlog', icon: 'circle-help' },
    { type: 'link', label: 'In Progress', pageId: 'workflow-progress', icon: 'circle' },
    { type: 'link', label: 'Done', pageId: 'workflow-done', icon: 'circle-check' }
  ]
}
```

**Renders as:**

```
┌──────────────────┐
│ ◔ Backlog        │
│ ○ In Progress    │
│ ◉ Done           │
└──────────────────┘
```

### 4. Grid Style (`'grid'`)

**Best for:** Many items (6+) that need organization

Displays items in a multi-column grid. Best for component showcases or large catalogs.

```typescript
{
  type: 'submenu',
  label: 'Materials',
  submenuStyle: 'grid',
  children: [
    { type: 'link', label: 'Raw Materials', pageId: 'materials-raw' },
    { type: 'link', label: 'Components', pageId: 'materials-components' },
    { type: 'link', label: 'Finished Goods', pageId: 'materials-finished' },
    { type: 'link', label: 'Packaging', pageId: 'materials-packaging' },
    { type: 'link', label: 'Consumables', pageId: 'materials-consumables' },
    { type: 'link', label: 'Tools', pageId: 'materials-tools' }
  ]
}
```

**Renders as:**

```
┌──────────────┬──────────────┬──────────────┐
│ Raw Materials│ Components   │ Finished Goods│
├──────────────┼──────────────┼──────────────┤
│ Packaging    │ Consumables  │ Tools         │
└──────────────┴──────────────┴──────────────┘
```

## Configuration Structure

Menus are configured in `TenantConfigData`:

```typescript
interface TenantConfigData {
  id: string
  name: string
  vanity: string
  pages: PageConfig[]
  menus: MenuConfigData[]
  mainMenu: MenuItem[]  // Main navigation menu
}
```

### Example: Complete Menu Configuration

```typescript
const tenantConfig: TenantConfigData = {
  id: 'manufacturing-tenant',
  name: 'Manufacturing Co',
  vanity: 'manufacturing',
  pages: [/* ... */],
  menus: [],
  mainMenu: [
    // Simple link
    {
      type: 'link',
      label: 'Dashboard',
      pageId: 'dashboard',
      icon: 'home'
    },

    // Submenu with list style
    {
      type: 'submenu',
      label: 'Sales',
      icon: 'shopping-cart',
      submenuStyle: 'list',
      children: [
        {
          type: 'link',
          label: 'All Orders',
          pageId: 'order-list',
          description: 'View and manage sales orders'
        },
        {
          type: 'link',
          label: 'Customers',
          pageId: 'customer-list',
          description: 'Manage customer database'
        },
        {
          type: 'link',
          label: 'Create Order',
          pageId: 'order-create',
          description: 'Create a new sales order'
        }
      ]
    },

    // Submenu with grid style
    {
      type: 'submenu',
      label: 'Inventory',
      icon: 'package',
      submenuStyle: 'grid',
      children: [
        { type: 'link', label: 'Raw Materials', pageId: 'inventory-raw' },
        { type: 'link', label: 'Components', pageId: 'inventory-components' },
        { type: 'link', label: 'Finished Products', pageId: 'inventory-finished' },
        { type: 'link', label: 'Packaging', pageId: 'inventory-packaging' }
      ]
    },

    // Simple link with parameters
    {
      type: 'link',
      label: 'Reports',
      pageId: 'reports-dashboard',
      icon: 'bar-chart'
    }
  ]
}
```

## How Menu Resolution Works

The menu system uses `createRoute()` under the hood to generate URLs from `pageId`:

1. **Menu Configuration** → Contains `MenuItem[]` with `pageId` references
2. **Menu Resolver** (`resolveMenuItems()`) → Converts `MenuItem` to `ResolvedMenuItem` with computed `href`
3. **Component Rendering** → Uses `href` for navigation

```typescript
// Configuration
const menuItem = {
  type: 'link',
  label: 'Order Details',
  pageId: 'order-detail',
  params: { uuid: '123' },
  query: { tab: 'shipping' }
}

// Resolution (automatic)
const resolved = resolveMenuItem(menuItem)
// → {
//     type: 'link',
//     label: 'Order Details',
//     href: '/orders/123?tab=shipping',  // Computed via createRoute()
//     visible: true,
//     disabled: false
//   }

// Rendering (automatic in AppHeader)
<a href={resolved.href}>{resolved.label}</a>
```

## Using Menu Items in Components

The `AppHeader` component automatically resolves and renders menu items:

```svelte
<script>
  import type { SnippetProps } from '$utils/runtime'

  const { tenantInterfaceDetails }: SnippetProps = $props()
  // tenantInterfaceDetails.mainMenu is automatically resolved
</script>
```

The component handles:

- ✅ URL generation via `createRoute()`
- ✅ Submenu rendering with Navigation Menu
- ✅ Visibility filtering
- ✅ Icon rendering (placeholder for Lucide integration)
- ✅ Disabled state styling

## Icons

Icons use Lucide icon names. Common examples:

| Icon Name       | Visual | Use Case           |
| --------------- | ------ | ------------------ |
| `home`          | 🏠     | Dashboard, Home    |
| `package`       | 📦     | Orders, Inventory  |
| `users`         | 👥     | Customers, Team    |
| `settings`      | ⚙️     | Configuration      |
| `bar-chart`     | 📊     | Reports, Analytics |
| `shopping-cart` | 🛒     | Sales, Commerce    |
| `truck`         | 🚚     | Shipping, Delivery |
| `circle-help`   | ◔      | Backlog, Help      |
| `circle`        | ○      | In Progress        |
| `circle-check`  | ◉      | Completed          |

See [Lucide Icons](https://lucide.dev/) for full list.

## Best Practices

### 1. Use Descriptive Labels

```typescript
// ❌ Bad
{ type: 'link', label: 'List', pageId: 'order-list' }

// ✅ Good
{ type: 'link', label: 'All Orders', pageId: 'order-list' }
```

### 2. Add Descriptions for List-Style Submenus

```typescript
// ❌ Bad
{
  type: 'submenu',
  submenuStyle: 'list',
  children: [
    { type: 'link', label: 'Orders', pageId: 'order-list' }
  ]
}

// ✅ Good
{
  type: 'submenu',
  submenuStyle: 'list',
  children: [
    {
      type: 'link',
      label: 'Orders',
      pageId: 'order-list',
      description: 'View and manage all sales orders'
    }
  ]
}
```

### 3. Choose Appropriate Submenu Style

- **2-4 items**: Use `simple`
- **With descriptions**: Use `list`
- **Visual categories**: Use `icon`
- **6+ items**: Use `grid`

### 4. Keep Menu Hierarchy Shallow

```typescript
// ❌ Bad - Too deep
{
  type: 'submenu',
  children: [
    {
      type: 'submenu',  // Nested submenu - harder to navigate
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

### 5. Use Icons Consistently

```typescript
// ✅ Good - Icons used consistently
mainMenu: [
  { type: 'link', label: 'Dashboard', pageId: 'dashboard', icon: 'home' },
  { type: 'link', label: 'Orders', pageId: 'order-list', icon: 'package' },
  { type: 'link', label: 'Customers', pageId: 'customer-list', icon: 'users' }
]

// ❌ Bad - Inconsistent icon usage
mainMenu: [
  { type: 'link', label: 'Dashboard', pageId: 'dashboard', icon: 'home' },
  { type: 'link', label: 'Orders', pageId: 'order-list' },  // Missing icon
  { type: 'link', label: 'Customers', pageId: 'customer-list', icon: 'users' }
]
```

## Migration from Legacy Format

The system supports backward compatibility with the old `NavItem` format (with `href`), but you should migrate to the new `MenuItem` format:

### Legacy Format (Deprecated)

```typescript
mainMenu: [
  {
    label: 'Dashboard',
    href: '/dashboard',  // ❌ Hardcoded URL
    visible: true
  }
]
```

### New Format (Recommended)

```typescript
mainMenu: [
  {
    type: 'link',        // ✅ Explicit type
    label: 'Dashboard',
    pageId: 'dashboard', // ✅ Uses page registry
    visible: true
  }
]
```

**Why migrate?**

- ✅ **Type-safe**: PageId validated against page registry
- ✅ **Maintainable**: URLs update automatically when routes change
- ✅ **Flexible**: Support for parameters, query strings, and submenus
- ✅ **Consistent**: Same routing system used throughout the app

## Related Documentation

- [Navigation and Routing](./navigation.md) - Core routing system
- [Route Builder](../../src/lib/utils/ROUTE-BUILDER.md) - `createRoute()` API
- [Component Development Guidelines](../components/development-guidelines.md) - Creating menu-aware components

## Troubleshooting

### Menu items not appearing

**Cause:** `visible: false` or missing `pageId` in page registry

**Solution:**

1. Check that `visible` is not set to `false`
2. Verify that `pageId` exists in page registry
3. Check browser console for warnings about broken links

### "Cannot read properties of undefined" error

**Cause:** Menu configuration in old format or malformed

**Solution:**

1. Check that all menu items have `type` field
2. Verify `children` array exists for submenu items
3. Check browser console for migration warnings

### URLs not updating when routes change

**Cause:** Still using legacy `href` format

**Solution:** Migrate to new `MenuItem` format with `pageId`

### Submenu not rendering correctly

**Cause:** Missing or invalid `submenuStyle`

**Solution:** Add `submenuStyle: 'list' | 'simple' | 'icon' | 'grid'` to submenu items
