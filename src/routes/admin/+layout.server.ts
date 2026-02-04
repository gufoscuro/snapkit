import { COMPONENT_REGISTRY, getAllComponentKeys } from '$generated/components-registry'
import type { BlockConfig, BuilderPageConfig, MenuConfig, TenantConfig } from '$lib/admin/types'
import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals, fetch }) => {
  const { user } = locals

  if (!user) {
    throw redirect(302, '/login')
  }

  const isAdmin = user.super_admin || user.roles?.includes('admin')

  if (!isAdmin) {
    throw redirect(302, '/')
  }

  // Fetch tenants from API
  let tenants: TenantConfig[] = []
  try {
    const response = await fetch('/api/tenants')
    if (response.ok) {
      tenants = await response.json()
    }
  } catch (e) {
    console.error('Failed to fetch tenants:', e)
  }

  // Fetch pages and menus from all tenant configs
  // TODO: Optimize for scale - currently loads ALL tenants' configs on admin panel load.
  // Consider: 1) Load only selected tenant's config, 2) Lazy loading on tenant switch,
  // 3) Pagination/metadata endpoint for large tenant counts
  const allPages: BuilderPageConfig[] = []
  const allMenus: MenuConfig[] = []

  for (const tenant of tenants) {
    try {
      const configResponse = await fetch(`/api/tenant-config/${tenant.vanity}`)
      if (configResponse.ok) {
        const tenantConfig = await configResponse.json()
        allPages.push(...tenantConfig.pages)
        allMenus.push(...tenantConfig.menus)
      }
    } catch (e) {
      console.error(`Failed to fetch config for tenant ${tenant.vanity}:`, e)
    }
  }

  // Generate blocks from component registry
  // Mock data is now loaded client-side in the iframe preview, no need to load here
  const componentKeys = getAllComponentKeys()
  const blocks: BlockConfig[] = componentKeys.map((key) => {
    const entry = COMPONENT_REGISTRY[key]
    const domain = key.split('.')[0]

    return {
      id: `block-${key}`,
      name: key.split('.').pop() || key,
      description: entry.description,
      folder: domain.charAt(0).toUpperCase() + domain.slice(1),
      snippet: {
        componentKey: key,
        enabled: true,
        props: {},
      },
      previewProps: {}, // Not used anymore with iframe preview
      tags: key.split('.'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  })

  return {
    user,
    adminConfig: {
      pages: allPages,
      menus: allMenus,
      tenants,
      blocks,
    },
  }
}
