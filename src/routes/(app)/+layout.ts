import type { DataWrapper, UserResource } from '$lib/types/api-types'
import { apiRequest } from '$utils/request'
import { error } from '@sveltejs/kit'
import type { LayoutLoad } from './$types'

async function fetchGlobals() {
  const [, userdata] = await Promise.all([
    apiRequest({
      url: '/tenant',
    }),
    apiRequest<DataWrapper<UserResource>>({
      url: '/user',
    }),
  ])

  return {
    user: userdata.data,
  }
}

export const load: LayoutLoad = async () => {
  try {
    const globals = await fetchGlobals()

    return globals
  } catch {
    throw error(404, 'Tenant not found')
  }
}
