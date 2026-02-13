import { apiRequest } from '$utils/request'
import { error } from '@sveltejs/kit'
import type { LayoutLoad } from './$types'

export const load: LayoutLoad = async event => {
  try {
    console.log('load function', event)
    await apiRequest({
      url: '/tenant',
    })
  } catch (exception) {
    console.log('Tenant not found, throwing 404', exception)
    throw error(404, 'Tenant not found')
  }
}
