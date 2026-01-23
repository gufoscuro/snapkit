<!--
  @component TenantSelector
  @description Dropdown selector for switching between tenants in the admin panel using FormGenericSingleSelector pattern
  @keywords admin, tenant, selector, dropdown
  @uses FormGenericSingleSelector
-->
<script lang="ts">
	import { adminTenantsRoute } from '$lib/admin/routes'
	import { adminStore, ADMIN_TENANT_STORAGE_KEY } from '$lib/admin/store.svelte'
	import type { TenantConfig } from '$lib/admin/types'
	import { Button } from '$lib/components/ui/button'
	import FormGenericSingleSelector from '$lib/components/features/form/FormGenericSingleSelector.svelte'
	import type { FilterQuery } from '$lib/utils/filters'
	import type { ExtendedOption } from '$lib/utils/generics'
	import Settings from '@lucide/svelte/icons/settings'

	const tenants = $derived(adminStore.state.tenants)
	const selectedTenant = $derived(adminStore.selectedTenant)

	// Map selected tenant to ExtendedOption format
	const selectedValue = $derived<ExtendedOption | undefined>(
		selectedTenant
			? {
					label: selectedTenant.name,
					value: selectedTenant.id,
					attr: selectedTenant,
			  }
			: undefined
	)

	function optionMappingFunction(tenant: TenantConfig): ExtendedOption {
		return {
			label: `${tenant.name} (${tenant.vanity})`,
			value: tenant.id,
			attr: tenant,
		}
	}

	// Fetch function returns tenants from store (no API call needed)
	async function fetchFunction(query: Partial<FilterQuery>): Promise<TenantConfig[]> {
		// Filter tenants based on search query if provided
		if (query.search && query.search.trim()) {
			const searchLower = query.search.toLowerCase()
			return adminStore.state.tenants.filter(
				(t) => t.name.toLowerCase().includes(searchLower) || t.vanity.toLowerCase().includes(searchLower)
			)
		}
		return adminStore.state.tenants
	}

	function handleChoose(tenant: TenantConfig) {
		adminStore.setSelectedTenantId(tenant.id)
	}

	function handleClear() {
		adminStore.setSelectedTenantId(null)
	}
</script>

<div class="flex items-center gap-1">
	{#if tenants.length === 0}
		<div class="text-muted-foreground text-sm">
			<a href={adminTenantsRoute()} class="hover:underline">Create your first tenant</a>
		</div>
	{:else}
		<FormGenericSingleSelector
			{selectedValue}
			label="Tenant"
			placeholder="Select a tenant..."
			name="tenant"
			showLabel={false}
			showErrorMessage={false}
			width="w-64"
			contentWidth="w-64"
			emptyText="No tenants found"
			allowClear={false}
			{optionMappingFunction}
			{fetchFunction}
			onChoose={handleChoose}
			onClear={handleClear} />
	{/if}
	<a href={adminTenantsRoute()}>
		<Button variant="ghost" size="icon" class="size-9" title="Manage Tenants">
			<Settings class="size-4" />
		</Button>
	</a>
</div>
