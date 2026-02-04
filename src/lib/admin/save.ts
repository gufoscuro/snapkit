import { toast } from 'svelte-sonner'
import { adminStore } from './store.svelte'

export async function saveAdminConfig(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch('/api/admin/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: adminStore.toJSON(),
    })

    if (response.ok) {
      adminStore.markClean()
      return { success: true, message: 'Configuration saved successfully' }
    } else {
      const error = await response.json()
      return { success: false, message: error.message || 'Save failed' }
    }
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
