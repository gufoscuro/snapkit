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
          description: 'The homepage of the application, usually hosting a dashboard with metrics and next actions.',
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
          $id: 'to-ship',
          title: 'to_ship',
          description: 'List of sales order lines awaiting shipment (delivery schedule)',
          route: '/shipping/to-ship',
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
              componentKey: 'common.filters.DeliveryScheduleFilters',
              enabled: true,
            },
            content: {
              componentKey: 'delivery-schedule.deliveryscheduletable.default.DeliveryScheduleTable',
              enabled: true,
            },
          },
        },
        {
          $id: 'payments',
          title: 'to_collect',
          description: 'List of invoice due dates to be collected',
          route: '/invoicing/payments',
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
              componentKey: 'common.filters.PaymentsFilters',
              enabled: true,
            },
            content: {
              componentKey: 'payments.paymentstable.default.PaymentsTable',
              enabled: true,
            },
          },
        },
        {
          $id: 'customers',
          title: 'customers',
          description: 'List of all customers',
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
              description: 'A form, with a detailed view of a single customer, with related information and actions',
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
                  description: 'List of all addresses (shipping, billing, etc.) associated with a single customer',
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
                      description: 'A form to view and edit the details of a single customer address',
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
                  description: 'List of all contact people associated with a single customer',
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
                      description: 'A form to view and edit the details of a single customer contact person',
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
                  description: 'List of all documents (quotations, orders, invoices, etc.) related to a single customer',
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
                {
                  $id: 'customer-commercial-terms',
                  title: 'customer_commercial_terms',
                  description: 'A form to manage the commercial terms (pricing, discounts, payment conditions) of a single customer',
                  route: '/contacts/customers/upsert/:uuid/commercial-terms',
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
                      componentKey: 'customers.customercommercialterms.default.CustomerCommercialTerms',
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
          description: 'List of all suppliers',
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
              description: 'A form, with a detailed view of a single supplier, with related information and actions',
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
                  description: 'List of all addresses (shipping, billing, etc.) associated with a single supplier',
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
                      description: 'A form to view and edit the details of a single supplier address',
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
                  description: 'List of all contact people associated with a single supplier',
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
                      description: 'A form to view and edit the details of a single supplier contact person',
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
                  description: 'List of all documents (orders, invoices, etc.) related to a single supplier',
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
                {
                  $id: 'supplier-commercial-terms',
                  title: 'supplier_commercial_terms',
                  description: 'A form to manage the commercial terms (pricing, discounts, payment conditions) of a single supplier',
                  route: '/contacts/suppliers/upsert/:uuid/commercial-terms',
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
                      componentKey: 'suppliers.suppliercommercialterms.default.SupplierCommercialTerms',
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
          description: 'List of all items (products and services)',
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
              description: 'A form, with a detailed view of a single item, with related information and actions',
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
                  description: 'List of all documents (quotations, orders, invoices, etc.) where a single item appears',
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
          description: 'List of all quotations',
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
              description: 'A form, with a detailed view of a single quotation, with its line items and actions',
              route: '/sales/quotations/upsert{/:uuid}',
              layout: {
                componentKey: 'layouts.LeftSidebar',
                enabled: true,
              },
              snippets: {
                sidebar: {
                  componentKey: 'globals.sidebars.QuotationSidebar',
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
        {
          $id: 'sales-orders',
          title: 'sales_orders',
          description: 'List of all sales orders',
          route: '/sales/sales-orders',
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
              componentKey: 'common.filters.SalesOrdersFilters',
              enabled: true,
            },
            content: {
              componentKey: 'sales-orders.salesorderstable.default.SalesOrdersTable',
              enabled: true,
            },
          },
          subpages: [
            {
              $id: 'sales-order-details',
              title: 'sales_order',
              description: 'A form, with a detailed view of a single sales order, with its line items and actions',
              route: '/sales/sales-orders/upsert{/:uuid}',
              layout: {
                componentKey: 'layouts.LeftSidebar',
                enabled: true,
              },
              snippets: {
                sidebar: {
                  componentKey: 'globals.sidebars.SalesOrderSidebar',
                  enabled: true,
                },
                content: {
                  componentKey: 'sales-orders.salesorderdetails.default.SalesOrderDetails',
                  enabled: true,
                },
              },
              subpages: [
                {
                  $id: 'sales-order-delivery-schedule',
                  title: 'deliveries',
                  description: 'Line-by-line delivery/shipment recap for a single sales order (delivered vs remaining)',
                  route: '/sales/sales-orders/upsert/:uuid/delivery-schedule',
                  layout: {
                    componentKey: 'layouts.LeftSidebar',
                    enabled: true,
                  },
                  snippets: {
                    sidebar: {
                      componentKey: 'globals.sidebars.SalesOrderSidebar',
                      enabled: true,
                    },
                    content: {
                      componentKey: 'sales-orders.salesorderdeliveryscheduletable.default.SalesOrderDeliveryScheduleTable',
                      enabled: true,
                    },
                  },
                },
              ],
            },
          ],
        },
        {
          $id: 'warehouse-orders',
          title: 'warehouse_orders',
          description: 'List of all warehouse orders',
          route: '/warehouse/warehouse-orders',
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
              componentKey: 'common.filters.WarehouseOrdersFilters',
              enabled: true,
            },
            content: {
              componentKey: 'warehouse-orders.warehouseorderstable.default.WarehouseOrdersTable',
              enabled: true,
            },
          },
          subpages: [
            {
              $id: 'warehouse-order-details',
              title: 'warehouse_order',
              description: 'A form, with a detailed view of a single warehouse order, with its line items and actions',
              route: '/warehouse/warehouse-orders/upsert{/:uuid}',
              layout: {
                componentKey: 'layouts.LeftSidebar',
                enabled: true,
              },
              snippets: {
                sidebar: {
                  componentKey: 'globals.sidebars.WarehouseOrderSidebar',
                  enabled: true,
                },
                content: {
                  componentKey: 'warehouse-orders.warehouseorderdetails.default.WarehouseOrderDetails',
                  enabled: true,
                },
              },
            },
          ],
        },
        {
          $id: 'to-invoice',
          title: 'to_invoice',
          description: 'List of all documents ready to be invoiced',
          route: '/invoicing/to-invoice',
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
              componentKey: 'common.filters.InvoiceableDocumentsFilters',
              enabled: true,
            },
            content: {
              componentKey: 'invoiceable-documents.invoiceabledocumentstable.default.InvoiceableDocumentsTable',
              enabled: true,
            },
          },
        },
        {
          $id: 'invoices',
          title: 'invoices',
          description: 'List of all invoices',
          route: '/invoicing/invoices',
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
              componentKey: 'common.filters.InvoicesFilters',
              enabled: true,
            },
            content: {
              componentKey: 'invoices.invoicestable.default.InvoicesTable',
              enabled: true,
            },
          },
          subpages: [
            {
              $id: 'invoice-details',
              title: 'invoice',
              description: 'A form, with a detailed view of a single invoice, with its line items and actions',
              route: '/invoicing/invoices/upsert{/:uuid}',
              layout: {
                componentKey: 'layouts.LeftSidebar',
                enabled: true,
              },
              snippets: {
                sidebar: {
                  componentKey: 'globals.sidebars.InvoiceSidebar',
                  enabled: true,
                },
                content: {
                  componentKey: 'invoices.invoicesdetails.default.InvoicesDetails',
                  enabled: true,
                },
              },
            },
          ],
        },
        {
          $id: 'transport-documents',
          title: 'transport_documents',
          description: 'List of all transport documents',
          route: '/sales/transport-documents',
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
              componentKey: 'common.filters.TransportDocumentsFilters',
              enabled: true,
            },
            content: {
              componentKey: 'transport-documents.transportdocumentstable.default.TransportDocumentsTable',
              enabled: true,
            },
          },
          subpages: [
            {
              $id: 'transport-document-details',
              title: 'transport_document',
              description: 'A form, with a detailed view of a single transport document, with its line items and actions',
              route: '/sales/transport-documents/upsert{/:uuid}',
              layout: {
                componentKey: 'layouts.LeftSidebar',
                enabled: true,
              },
              snippets: {
                sidebar: {
                  componentKey: 'globals.sidebars.TransportDocumentSidebar',
                  enabled: true,
                },
                content: {
                  componentKey: 'transport-documents.transportdocumentdetails.default.TransportDocumentDetails',
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
              // First group intentionally has no label — actionables ("things to do").
              label: '',
              icon: 'Layers',
              type: 'submenu',
              submenuStyle: 'simple',
              children: [
                {
                  label: 'Home',
                  pageId: 'home',
                  icon: 'House',
                  type: 'link',
                },
                {
                  label: 'to_ship',
                  pageId: 'to-ship',
                  icon: 'Truck',
                  type: 'link',
                },
                {
                  label: 'to_collect',
                  pageId: 'payments',
                  icon: 'MoneybagMoveBack',
                  type: 'link',
                },
                {
                  label: 'to_invoice',
                  pageId: 'to-invoice',
                  icon: 'FileClock',
                  type: 'link',
                },
              ],
            },
            {
              label: 'master_data',
              icon: 'Users',
              type: 'submenu',
              submenuStyle: 'simple',
              children: [
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
              ],
            },
            {
              label: 'sales',
              icon: 'ShoppingCart',
              type: 'submenu',
              submenuStyle: 'simple',
              children: [
                {
                  label: 'quotations',
                  pageId: 'quotations',
                  icon: 'FileText',
                  type: 'link',
                },
                {
                  label: 'sales_orders',
                  pageId: 'sales-orders',
                  icon: 'ClipboardList',
                  type: 'link',
                },
                {
                  label: 'warehouse_orders',
                  pageId: 'warehouse-orders',
                  icon: 'PackageOpen',
                  type: 'link',
                },
                {
                  label: 'transport_documents',
                  pageId: 'transport-documents',
                  icon: 'Truck',
                  type: 'link',
                },
              ],
            },
            {
              label: 'invoicing',
              icon: 'Receipt',
              type: 'submenu',
              submenuStyle: 'simple',
              children: [
                {
                  label: 'invoices',
                  pageId: 'invoices',
                  icon: 'Receipt',
                  type: 'link',
                },
              ],
            },
          ],
        },
      },
    },
    policies: {},
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
