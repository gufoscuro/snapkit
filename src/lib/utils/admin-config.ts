import { invalidate, invalidateAll } from '$app/navigation'
import { invalidateGlobalsCache } from '$lib/stores/globals-cache'
import type { LegalEntityConfigResponse } from '$lib/stores/tenant-config/types'
import { apiRequest } from '$lib/utils/request'

/**
 * Returns the default scaffold configuration for a legal entity dashboard.
 * Used to initialize or reset a legal entity's config via PUT.
 */
export function scaffoldDashboardStructure(): LegalEntityConfigResponse {
  return {
    version: 0,
    resources: {},
    dashboard: {
      pages: [
        {
          $id: 'home',
          title: 'Homepage',
          route: '/',
          layout: {
            componentKey: 'layouts.LeftSidebar',
            enabled: true,
          },
          snippets: {
            sidebar: {
              componentKey: 'globals.sidebars.IndexSidebar',
              enabled: true,
            },
          },
        },
        {
          $id: 'customers',
          title: 'customers',
          route: '/contacts/customers',
          layout: {
            componentKey: 'layouts.LeftSidebar',
            enabled: true,
          },
          snippets: {
            sidebar: {
              componentKey: 'globals.sidebars.IndexSidebar',
              enabled: true,
            },
            filters: {
              componentKey: 'common.filters.CustomersFilters',
              enabled: true,
            },
            content: {
              componentKey: 'customers.customerstable.default.CustomersTable',
              enabled: true,
              props: {
                highlight: true,
              },
            },
          },
          subpages: [
            {
              $id: 'customer-details',
              title: 'customers_details',
              route: '/contacts/customers/upsert{/:uuid}',
              layout: {
                componentKey: 'layouts.LeftSidebar',
                enabled: true,
              },
              snippets: {
                sidebar: {
                  componentKey: 'globals.sidebars.CustomerSidebar',
                  enabled: true,
                },
                content: {
                  componentKey: 'customers.customerdetails.default.CustomerDetails',
                  enabled: true,
                },
              },
              subpages: [
                {
                  $id: 'customer-addresses',
                  title: 'customer_addresses',
                  route: '/contacts/customers/upsert/:uuid/addresses',
                  layout: {
                    componentKey: 'layouts.LeftSidebar',
                    enabled: true,
                  },
                  snippets: {
                    sidebar: {
                      componentKey: 'globals.sidebars.CustomerSidebar',
                      enabled: true,
                    },
                    filters: {
                      componentKey: 'common.filters.CustomerAddressesFilters',
                      enabled: true,
                    },
                    content: {
                      componentKey: 'customers.customeraddressestable.default.CustomerAddressesTable',
                      enabled: true,
                    },
                  },
                  subpages: [
                    {
                      $id: 'customer-address-details',
                      title: 'customer_address_details',
                      route: '/contacts/customers/upsert/:uuid/addresses/upsert{/:aid}',
                      layout: {
                        componentKey: 'layouts.LeftSidebar',
                        enabled: true,
                      },
                      snippets: {
                        sidebar: {
                          componentKey: 'globals.sidebars.SimpleSidebar',
                          enabled: true,
                        },
                        content: {
                          componentKey: 'customers.customeraddressdetails.default.CustomerAddressDetails',
                          enabled: true,
                        },
                      },
                    },
                  ],
                },
                {
                  $id: 'customer-contacts',
                  title: 'customer_contacts',
                  route: '/contacts/customers/upsert/:uuid/contacts',
                  layout: {
                    componentKey: 'layouts.LeftSidebar',
                    enabled: true,
                  },
                  snippets: {
                    sidebar: {
                      componentKey: 'globals.sidebars.CustomerSidebar',
                      enabled: true,
                    },
                    filters: {
                      componentKey: 'common.filters.CustomerContactsFilters',
                      enabled: true,
                    },
                    content: {
                      componentKey: 'customers.customercontactstable.default.CustomerContactsTable',
                      enabled: true,
                    },
                  },
                  subpages: [
                    {
                      $id: 'customer-contact-details',
                      title: 'customer_contact_details',
                      route: '/contacts/customers/upsert/:uuid/contact/upsert{/:cid}',
                      layout: {
                        componentKey: 'layouts.LeftSidebar',
                        enabled: true,
                      },
                      snippets: {
                        sidebar: {
                          componentKey: 'globals.sidebars.SimpleSidebar',
                          enabled: true,
                        },
                        content: {
                          componentKey: 'customers.customercontactdetails.default.CustomerContactDetails',
                          enabled: true,
                        },
                      },
                    },
                  ],
                },
                {
                  $id: 'customer-documents',
                  title: 'customers_documents',
                  route: '/contacts/customers/upsert/:uuid/documents',
                  layout: {
                    componentKey: 'layouts.LeftSidebar',
                    enabled: true,
                  },
                  snippets: {
                    sidebar: {
                      componentKey: 'globals.sidebars.CustomerSidebar',
                      enabled: true,
                    },
                    content: {
                      componentKey: 'customers.customerdocumentstable.default.CustomerDocumentsTable',
                      enabled: true,
                    },
                  },
                },
              ],
            },
          ],
        },
        {
          $id: 'suppliers',
          title: 'suppliers',
          route: '/contacts/suppliers',
          layout: {
            componentKey: 'layouts.LeftSidebar',
            enabled: true,
          },
          snippets: {
            sidebar: {
              componentKey: 'globals.sidebars.IndexSidebar',
              enabled: true,
            },
            filters: {
              componentKey: 'common.filters.SuppliersFilters',
              enabled: true,
            },
            content: {
              componentKey: 'suppliers.supplierstable.default.SuppliersTable',
              enabled: true,
            },
          },
          subpages: [
            {
              $id: 'supplier-details',
              title: 'supplier_details',
              route: '/contacts/suppliers/upsert{/:uuid}',
              layout: {
                componentKey: 'layouts.LeftSidebar',
                enabled: true,
              },
              snippets: {
                sidebar: {
                  componentKey: 'globals.sidebars.SupplierSidebar',
                  enabled: true,
                },
                content: {
                  componentKey: 'suppliers.supplierdetails.default.SupplierDetails',
                  enabled: true,
                },
              },
              subpages: [
                {
                  $id: 'supplier-addresses',
                  title: 'addresses',
                  route: '/contacts/suppliers/upsert/:uuid/addresses',
                  layout: {
                    componentKey: 'layouts.LeftSidebar',
                    enabled: true,
                  },
                  snippets: {
                    sidebar: {
                      componentKey: 'globals.sidebars.SupplierSidebar',
                      enabled: true,
                    },
                    filters: {
                      componentKey: 'common.filters.SupplierAddressesFilters',
                      enabled: true,
                    },
                    content: {
                      componentKey: 'suppliers.supplieraddressestable.default.SupplierAddressesTable',
                      enabled: true,
                    },
                  },
                  subpages: [
                    {
                      $id: 'supplier-address-details',
                      title: 'addresses',
                      route: '/contacts/suppliers/upsert/:uuid/addresses/upsert{/:aid}',
                      layout: {
                        componentKey: 'layouts.LeftSidebar',
                        enabled: true,
                      },
                      snippets: {
                        sidebar: {
                          componentKey: 'globals.sidebars.SimpleSidebar',
                          enabled: true,
                        },
                        content: {
                          componentKey: 'suppliers.supplieraddressdetails.default.SupplierAddressDetails',
                          enabled: true,
                        },
                      },
                    },
                  ],
                },
                {
                  $id: 'supplier-contacts',
                  title: 'contacts',
                  route: '/contacts/suppliers/upsert/:uuid/contacts',
                  layout: {
                    componentKey: 'layouts.LeftSidebar',
                    enabled: true,
                  },
                  snippets: {
                    sidebar: {
                      componentKey: 'globals.sidebars.SupplierSidebar',
                      enabled: true,
                    },
                    filters: {
                      componentKey: 'common.filters.SupplierContactsFilters',
                      enabled: true,
                    },
                    content: {
                      componentKey: 'suppliers.suppliercontactstable.default.SupplierContactsTable',
                      enabled: true,
                    },
                  },
                  subpages: [
                    {
                      $id: 'supplier-contact-details',
                      title: 'contacts',
                      route: '/contacts/suppliers/upsert/:uuid/contact/upsert{/:cid}',
                      layout: {
                        componentKey: 'layouts.LeftSidebar',
                        enabled: true,
                      },
                      snippets: {
                        sidebar: {
                          componentKey: 'globals.sidebars.SimpleSidebar',
                          enabled: true,
                        },
                        content: {
                          componentKey: 'suppliers.suppliercontactdetails.default.SupplierContactDetails',
                          enabled: true,
                        },
                      },
                    },
                  ],
                },
                {
                  $id: 'supplier-documents',
                  title: 'documents',
                  route: '/contacts/suppliers/upsert/:uuid/documents',
                  layout: {
                    componentKey: 'layouts.LeftSidebar',
                    enabled: true,
                  },
                  snippets: {
                    sidebar: {
                      componentKey: 'globals.sidebars.SupplierSidebar',
                      enabled: true,
                    },
                    content: {
                      componentKey: 'suppliers.supplierdocumentstable.default.SupplierDocumentsTable',
                      enabled: true,
                    },
                  },
                },
              ],
            },
          ],
        },
        {
          $id: 'items',
          title: 'items',
          route: '/items',
          layout: {
            componentKey: 'layouts.LeftSidebar',
            enabled: true,
          },
          snippets: {
            sidebar: {
              componentKey: 'globals.sidebars.IndexSidebar',
              enabled: true,
            },
            filters: {
              componentKey: 'common.filters.ItemsFilters',
              enabled: true,
            },
            content: {
              componentKey: 'items.itemstable.default.ItemsTable',
              enabled: true,
            },
          },
          subpages: [
            {
              $id: 'item-details',
              title: 'items',
              route: '/items/upsert{/:uuid}',
              layout: {
                componentKey: 'layouts.LeftSidebar',
                enabled: true,
              },
              snippets: {
                sidebar: {
                  componentKey: 'globals.sidebars.ItemSidebar',
                  enabled: true,
                },
                content: {
                  componentKey: 'items.itemdetails.default.ItemDetails',
                  enabled: true,
                },
              },
              subpages: [
                {
                  $id: 'item-documents',
                  title: 'documents',
                  route: '/items/upsert/:uuid/documents',
                  layout: {
                    componentKey: 'layouts.LeftSidebar',
                    enabled: true,
                  },
                  snippets: {
                    sidebar: {
                      componentKey: 'globals.sidebars.ItemSidebar',
                      enabled: true,
                    },
                    content: {
                      componentKey: 'items.itemdocumentstable.default.ItemDocumentsTable',
                      enabled: true,
                    },
                  },
                },
              ],
            },
          ],
        },
        {
          $id: 'quotations',
          title: 'quotations',
          route: '/sales/quotations',
          layout: {
            componentKey: 'layouts.LeftSidebar',
            enabled: true,
          },
          snippets: {
            sidebar: {
              componentKey: 'globals.sidebars.IndexSidebar',
              enabled: true,
            },
            filters: {
              componentKey: 'common.filters.QuotationsFilters',
              enabled: true,
            },
            content: {
              componentKey: 'quotations.quotationstable.default.QuotationsTable',
              enabled: true,
            },
          },
          subpages: [
            {
              $id: 'quotation-details',
              title: 'quotation',
              route: '/sales/quotations/upsert{/:uuid}',
              layout: {
                componentKey: 'layouts.LeftSidebar',
                enabled: true,
              },
              snippets: {
                sidebar: {
                  componentKey: 'globals.sidebars.SimpleSidebar',
                  enabled: true,
                },
                content: {
                  componentKey: 'quotations.quotationdetails.default.QuotationDetails',
                  enabled: true,
                },
              },
            },
          ],
        },
      ],
      menus: {
        main: {
          id: 'main',
          name: 'sections',
          items: [
            {
              label: 'Home',
              pageId: 'home',
              icon: 'House',
              type: 'link',
            },
            {
              label: 'customers',
              pageId: 'customers',
              icon: 'Users',
              type: 'link',
            },
            {
              label: 'suppliers',
              pageId: 'suppliers',
              icon: 'Contact',
              type: 'link',
            },
            {
              label: 'items',
              pageId: 'items',
              icon: 'Package',
              type: 'link',
            },
            {
              label: 'quotations',
              pageId: 'quotations',
              icon: 'FileText',
              type: 'link',
            },
          ],
        },
      },
    },
    created_by: null,
    created_at: null,
  }
}

/**
 * Invalidates the globals cache and re-runs all load functions.
 * Call this after any admin operation that modifies the entity config.
 */
export async function refreshAdminConfig() {
  invalidateGlobalsCache()
  await invalidate('admin:index')
  await invalidateAll()
}

/**
 * PUTs the scaffold dashboard config to the API for the given legal entity,
 * then refreshes all admin data.
 */
export async function pushScaffoldConfig(legalEntityId: string) {
  const config = scaffoldDashboardStructure()

  await apiRequest({
    url: `/legal-entities/${legalEntityId}/config`,
    method: 'PUT',
    data: config,
  })

  await refreshAdminConfig()
}
