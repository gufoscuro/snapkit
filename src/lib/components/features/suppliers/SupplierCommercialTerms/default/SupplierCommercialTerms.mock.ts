import type { SnippetProps } from '$utils/runtime'

/**
 * Mock props for SupplierCommercialTerms component preview
 */
export const mockSupplierCommercialTermsProps: SnippetProps = {
  pageDetails: {
    config: {
      $id: 'supplier-commercial-terms',
      title: 'Supplier Commercial Terms',
      route: '/contacts/suppliers/upsert/:uuid/commercial-terms',
      layout: { componentKey: 'layouts.Detail' as never, enabled: true },
      snippets: {},
    },
    params: { uuid: '00000000-0000-0000-0000-000000000001' },
  },
  routeDetails: {
    url: new URL('http://localhost:5173/contacts/suppliers/upsert/00000000-0000-0000-0000-000000000001/commercial-terms'),
    search: null,
  },
  entityConfig: null,
  user: null,
  legalEntity: {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Test Legal Entity',
    last_name: '',
    trade_name: '',
    eori_code: '',
    ateco_code: null,
    vat_number: '12345678901',
    tax_id: '12345678901',
    sdi_code: '0000000',
    pec: 'test@pec.it',
    email: 'test@example.com',
    phone: '+39 000 0000000',
    fax: '',
    website: '',
    registration_country_code: 'IT',
    tax_regime: 'RF01',
    rea_office: 'MI',
    rea_number: '123456',
    liquidation_status: 'LN',
    notes: '',
    version: 1,
  },
}
