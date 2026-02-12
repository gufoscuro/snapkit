import type { SupplierSummary } from '$lib/types/api-types'

/**
 * Mock data for SuppliersTable component preview
 */
export const mockSupplierData: SupplierSummary[] = [
	{
		id: '550e8400-e29b-41d4-a716-446655440001',
		name: 'Acme Manufacturing Co.',
		categories: ['Electronics', 'Industrial', 'Hardware', 'Components'],
		emails: [
			{ name: 'Main', email: 'contact@acme-mfg.com' },
			{ name: 'Sales', email: 'sales@acme-mfg.com' }
		],
		phones: [
			{ name: 'Office', phone: '+1 555-0100' },
			{ name: 'Sales', phone: '+1 555-0101' }
		],
		vat_no: 'US123456789',
		default_currency: 'USD',
		mode: 'ordinary'
	},
	{
		id: '550e8400-e29b-41d4-a716-446655440002',
		name: 'Global Textiles Ltd.',
		categories: ['Textiles', 'Fashion'],
		emails: [{ name: 'Main', email: 'info@globaltextiles.com' }],
		phones: [{ name: 'Main', phone: '+44 20 7946 0958' }],
		vat_no: 'GB987654321',
		default_currency: 'GBP',
		mode: 'ordinary'
	},
	{
		id: '550e8400-e29b-41d4-a716-446655440003',
		name: 'Tech Components GmbH',
		categories: ['Electronics', 'Semiconductors', 'IoT'],
		emails: [
			{ name: 'General', email: 'kontakt@techcomp.de' },
			{ name: 'Support', email: 'support@techcomp.de' }
		],
		phones: [{ name: 'Office', phone: '+49 30 12345678' }],
		vat_no: 'DE234567890',
		default_currency: 'EUR',
		mode: 'ordinary'
	},
	{
		id: '550e8400-e29b-41d4-a716-446655440004',
		name: 'Green Energy Solutions',
		categories: ['Renewable', 'Solar', 'Wind'],
		emails: [{ name: 'Contact', email: 'hello@greenenergy.com' }],
		phones: [{ name: 'Sales', phone: '+1 555-0200' }],
		vat_no: 'US345678901',
		default_currency: 'USD',
		mode: 'ordinary'
	},
	{
		id: '550e8400-e29b-41d4-a716-446655440005',
		name: 'Pacific Foods Inc.',
		categories: ['Food', 'Beverages'],
		emails: [{ name: 'Orders', email: 'orders@pacificfoods.com' }],
		phones: [{ name: 'Main', phone: '+1 555-0300' }],
		vat_no: 'US456789012',
		default_currency: 'USD',
		mode: 'ordinary'
	}
]
