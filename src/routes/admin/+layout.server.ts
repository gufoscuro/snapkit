import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'
import { pages, menus, tenants } from '$generated/admin-config'

export const load: LayoutServerLoad = async ({ locals }) => {
  const { user } = locals

  if (!user) {
    throw redirect(302, '/login')
  }

  const isAdmin = user.super_admin || user.roles?.includes('admin')

  if (!isAdmin) {
    throw redirect(302, '/')
  }

  return {
    user,
    adminConfig: {
      pages,
      menus,
      tenants,
    },
  }
}
