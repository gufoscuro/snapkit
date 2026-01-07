import { match } from 'path-to-regexp';

export interface PageConfig {
  page_key: string;
  title: string;
  route: string; // Now supports patterns like /orders/:uuid or /orders/:uuid/delivery/:delivery_uuid
  layout_template: 'list' | 'dashboard' | 'detail';
  slots: SlotDefinition[];
}

export interface SlotDefinition {
  slot_key: string;
  required: boolean;
}

const PAGES: PageConfig[] = [
  {
    page_key: 'orders',
    title: 'Orders',
    route: '/orders',
    layout_template: 'list',
    slots: [
      {
        slot_key: 'filters',
        required: true
      },
      {
        slot_key: 'table',
        required: true
      }
    ]
  },
  {
    page_key: 'order-detail',
    title: 'Order Detail',
    route: '/orders/:uuid',
    layout_template: 'detail',
    slots: [
      {
        slot_key: 'header',
        required: true
      },
      {
        slot_key: 'content',
        required: true
      }
    ]
  },
  {
    page_key: 'order-delivery',
    title: 'Order Delivery',
    route: '/orders/:uuid/delivery/:delivery_uuid',
    layout_template: 'detail',
    slots: [
      {
        slot_key: 'header',
        required: true
      },
      {
        slot_key: 'tracking',
        required: true
      }
    ]
  }
  // ... more pages
];

// Result type that includes matched parameters
export interface PageMatch {
  config: PageConfig;
  params: Record<string, string>;
}

// Async function (DB-ready interface)
export async function getPageByRoute(route: string): Promise<PageMatch | null> {
  // Simulate async DB call
  await new Promise(resolve => setTimeout(resolve, 10));

  // Try to match against each page pattern
  for (const page of PAGES) {
    const matcher = match(page.route, { decode: decodeURIComponent });
    const result = matcher(route);

    if (result) {
      return {
        config: page,
        params: result.params as Record<string, string>
      };
    }
  }

  return null;
}