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
