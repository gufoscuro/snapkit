import type { ComponentKey } from '$generated/components-registry';
import { match } from 'path-to-regexp';

export interface PageConfig {
  title: string
  route: string; // Now supports patterns like /orders/:uuid or /orders/:uuid/delivery/:delivery_uuid
  layout: SnippetDefinition
  snippets: Record<string, SnippetDefinition>
}

export interface SnippetDefinition {
  componentKey: ComponentKey
  enabled: boolean
}

const PAGES: PageConfig[] = [
  {
    title: 'Orders',
    route: '/orders',
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
        componentKey: 'orders.pagefilters.default.PageFilters',
      },
      table: {
        enabled: true,
        componentKey: 'orders.pagetable.default.PageTable',
      },
    },
  },
  {
    title: 'Order Detail',
    route: '/orders/:uuid',
    layout: {
      componentKey: 'layouts.Detail',
      enabled: true,
    },
    snippets: {},
  },
  {
    title: 'Products List',
    route: '/products',
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
        componentKey: 'orders.pagefilters.PageFiltersWithSearch',
      },
      table: {
        enabled: true,
        componentKey: 'orders.pagetable.PageTableCustom',
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

// Async function (DB-ready interface)
export async function getPageByRoute(route: string): Promise<PageDetails | null> {
  // Simulate async DB call
  await new Promise(resolve => setTimeout(resolve, 10))

  // Try to match against each page pattern
  for (const page of PAGES) {
    const matcher = match(page.route, { decode: decodeURIComponent })
    const result = matcher(route)

    if (result) {
      return {
        config: page,
        params: result.params as Record<string, string>
      }
    }
  }

  return null
}