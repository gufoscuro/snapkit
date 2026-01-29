import { menus, pages, tenants } from '$generated/admin-config'
import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'
import { getAllComponentKeys, COMPONENT_REGISTRY } from '$generated/components-registry'
import type { BlockConfig } from '$lib/admin/types'

export const load: LayoutServerLoad = async ({ locals }) => {
  const { user } = locals

  if (!user) {
    throw redirect(302, '/login')
  }

  const isAdmin = user.super_admin || user.roles?.includes('admin')

  if (!isAdmin) {
    throw redirect(302, '/')
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
      pages,
      menus,
      tenants,
      blocks,
    },
  }
}
