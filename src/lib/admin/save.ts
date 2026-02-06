import { adminStore } from '$lib/admin/stores/admin-store.svelte';
import { toast } from 'svelte-sonner';
import type { TenantConfigData } from '$lib/stores/tenant-config/types';
import type { TenantConfig } from '$lib/admin/types';
import { flatToNested } from '$lib/admin/page-hierarchy-utils';

/**
 * Save tenant configuration to the API
 * @param tenantId - Optional tenant ID to save. If not provided, uses the currently selected tenant.
 */
export async function saveAdminConfig(tenantId?: string): Promise<{ success: boolean; message: string }> {
  try {
    // Determine which tenant to save
    let targetTenant: TenantConfig | null

    if (tenantId) {
      // Find tenant by ID if specified
      targetTenant = adminStore.state.tenants.find(t => t.id === tenantId) ?? null
      if (!targetTenant) {
        return { success: false, message: `Tenant with ID ${tenantId} not found` }
      }
    } else {
      // Use currently selected tenant if no ID specified
      targetTenant = adminStore.selectedTenant
      if (!targetTenant) {
        return { success: false, message: 'No tenant selected' }
      }
    }

    // Filter pages and menus for the target tenant from state
    const tenantPages = adminStore.state.pages.filter(p => p.tenantId === targetTenant.id)
    const tenantMenus = adminStore.state.menus.filter(m => m.tenantId === targetTenant.id)

    // Convert flat pages to nested structure before saving
    const nestedPages = flatToNested(tenantPages)

    // Compute mainMenu by flattening all menu items
    const mainMenu = tenantMenus.flatMap(m => m.items)

    // Assemble full TenantConfigData
    const configData: TenantConfigData = {
      id: targetTenant.id,
      name: targetTenant.name,
      vanity: targetTenant.vanity,
      pages: nestedPages,
      menus: tenantMenus,
      mainMenu
    }

    // POST to new API
    const response = await fetch(`/api/tenant-config/${targetTenant.vanity}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(configData)
    })

    if (!response.ok) {
      const error = await response.json()
      return { success: false, message: error.message || 'Save failed' }
    }

    // Also save the updated tenants list to ensure it's persisted
    const tenantsResponse = await fetch('/api/tenants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminStore.state.tenants)
    })

    if (!tenantsResponse.ok) {
      console.error('Failed to save tenants list')
      // Don't fail the whole operation, just log the error
    }

    adminStore.markClean()
    adminStore.onConfigPublished() // Invalidate tenant config cache
    return { success: true, message: `Configuration saved successfully for ${targetTenant.name}` }
  } catch (e) {
    return { success: false, message: `Save failed: ${e}` }
  }
}

/**
 * Auto-save configuration with optional toast notification
 * @param showToast - Whether to show success/error toast (default: true)
 * @param successMessage - Custom success message (default: 'Saved successfully')
 */
export async function autoSave(showToast = true, successMessage = 'Saved successfully'): Promise<boolean> {
  const result = await saveAdminConfig()

  if (showToast) {
    if (result.success) {
      toast.success(successMessage)
    } else {
      toast.error(result.message)
    }
  }

  return result.success
}
