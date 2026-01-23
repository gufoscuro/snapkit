import { pages as adminPages, tenants as adminTenants } from '$generated/admin-config';
import type { ComponentKey } from '$generated/components-registry';
import type { BindingConfig } from '$lib/contexts/page-state';
import { type TObject, Type } from '@sinclair/typebox';
import { match } from 'path-to-regexp';

export interface PageConfig {
  /** Unique identifier for this page, used for route generation */
  $id: string
  /** Optional TypeBox schema defining the route parameters */
  $params?: TObject
  title: string
  route: string; // Now supports patterns like /orders/:uuid or /orders/:uuid/delivery/:delivery_uuid
  layout: SnippetDefinition
  snippets: Record<string, SnippetDefinition>
  subpages?: PageConfig[]
}

export interface SnippetDefinition {
  componentKey: ComponentKey
  enabled: boolean
  /** Optional bindings to map logical names to namespaces. If not specified, defaults are used. */
  bindings?: BindingConfig
}

export const PAGES: PageConfig[] = [
  ...(adminPages as PageConfig[]),

  // Hardcoded pages for demo purposes
  {
    $id: 'order-list',
    title: 'supply_orders',
    route: '/purchase/orders',
    layout: {
      componentKey: 'layouts.List',
      enabled: true,
    },
    snippets: {
      appHeader: {
        componentKey: 'globals.AppHeader',
        enabled: true,
      },
      title: {
        enabled: true,
        componentKey: 'globals.PageTitle',
      },
      table: {
        enabled: true,
        componentKey: 'supply.supplyorderstable.default.SupplyOrdersTable'
      },
    },
    subpages: [
      {
        $id: 'order-detail',
        $params: Type.Object({ uuid: Type.String() }),
        title: 'purchase_order_detail',
        route: '/purchase/orders/upsert/:uuid',
        layout: {
          componentKey: 'layouts.Detail',
          enabled: true,
        },
        snippets: {
          appHeader: {
            componentKey: 'globals.AppHeaderWithBack',
            enabled: true,
          },
          detail: {
            enabled: true,
            componentKey: 'supply.upsertsupplyorder.default.UpsertSupplyOrder',
          },
        },
      },
    ],
  },
  {
    $id: 'sales-order-list',
    title: 'sales_orders',
    route: '/sales/orders',
    layout: {
      componentKey: 'layouts.List',
      enabled: true,
    },
    snippets: {
      appHeader: {
        componentKey: 'globals.AppHeader',
        enabled: true,
      },
      title: {
        enabled: true,
        componentKey: 'globals.PageTitle',
      },
      table: {
        enabled: true,
        componentKey: 'sales.salesorderstable.default.SalesOrdersTable'
      },
    },
    subpages: [
      {
        $id: 'sales-order-detail',
        $params: Type.Object({ uuid: Type.String() }),
        title: 'sales_order_detail',
        route: '/sales/orders/upsert/:uuid',
        layout: {
          componentKey: 'layouts.Detail',
          enabled: true,
        },
        snippets: {},
      },
    ],
  },
  {
    $id: 'product-list',
    title: 'products_list',
    route: '/products',
    layout: {
      componentKey: 'layouts.List',
      enabled: true,
    },
    snippets: {
      appHeader: {
        componentKey: 'globals.AppHeader',
        enabled: true,
      },
      title: {
        enabled: true,
        componentKey: 'globals.PageTitle',
      },
    },
  },
  {
    $id: 'production',
    title: 'production',
    route: '/production',
    layout: {
      componentKey: 'layouts.List',
      enabled: true,
    },
    snippets: {
      appHeader: {
        componentKey: 'globals.AppHeader',
        enabled: true,
      },
      title: {
        enabled: true,
        componentKey: 'globals.PageTitle',
      },
      table: {
        enabled: true,
        componentKey: 'production.ProductionCalendar',
      },
    },
  },
  {
    $id: 'poc-state-sharing',
    title: 'poc_state_sharing',
    route: '/poc/state-sharing',
    layout: {
      componentKey: 'layouts.List',
      enabled: true,
    },
    snippets: {
      title: {
        enabled: true,
        componentKey: 'globals.PageTitle',
      },
      filters: {
        enabled: true,
        componentKey: '_poc.demofilter.DemoFilter',
        // Using default bindings: provides.filters -> 'filters'
      },
      table: {
        enabled: true,
        componentKey: '_poc.demotable.DemoTable',
        // Using default bindings: consumes.filters -> 'filters', provides.selection -> 'selection'
      },
    },
  }
  // ... more pages
]



// Result type that includes matched parameters
export interface PageDetails {
  config: PageConfig;
  params: Record<string, string>;
}

/**
 * Get tenant ID from vanity (subdomain)
 */
export function getTenantIdByVanity(vanity: string | null): string | null {
  if (!vanity) return null
  const tenant = adminTenants.find(t => t.vanity === vanity)
  return tenant?.id ?? null
}

/** PageConfig with optional tenantId for admin-configured pages */
interface TenantPageConfig extends PageConfig {
  tenantId?: string
}

/**
 * Get pages filtered by tenant
 */
function getPagesByTenant(tenantId: string | null): PageConfig[] {
  // Admin-configured pages filtered by tenant
  const tenantPages = tenantId
    ? (adminPages as TenantPageConfig[]).filter(p => p.tenantId === tenantId)
    : []

  // Hardcoded pages (no tenant, available to all) - for backward compatibility
  const hardcodedPages = (PAGES as TenantPageConfig[]).filter(p => !p.tenantId)

  return [...tenantPages, ...hardcodedPages]
}

// Async function (DB-ready interface)
export async function getPageByRoute(route: string, tenantId?: string | null): Promise<PageDetails | null> {
  // Simulate async DB call
  await new Promise(resolve => setTimeout(resolve, 10))

  const pages = tenantId ? getPagesByTenant(tenantId) : PAGES

  // Recursive function to search through pages and subpages
  function searchPages(pagesToSearch: PageConfig[]): PageDetails | null {
    for (const page of pagesToSearch) {
      const matcher = match(page.route, { decode: decodeURIComponent })
      const result = matcher(route)

      if (result) {
        return {
          config: page,
          params: result.params as Record<string, string>
        }
      }

      // Search in subpages if they exist
      if (page.subpages && page.subpages.length > 0) {
        const subpageResult = searchPages(page.subpages)
        if (subpageResult) {
          return subpageResult
        }
      }
    }

    return null
  }

  return searchPages(pages)
}