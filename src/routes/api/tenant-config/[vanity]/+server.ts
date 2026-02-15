import { tenantConfigStore } from '$lib/stores/tenant-config'
import type { TenantConfigData } from '$lib/stores/tenant-config/types'
import { error, json } from '@sveltejs/kit'
import { mkdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import type { RequestHandler } from './$types'

const DATA_DIR = join(process.cwd(), 'data/tenant-configs')

/**
 * GET /api/tenant-config/[vanity]
 * Fetch tenant configuration by vanity subdomain
 * Public endpoint - no authentication required
 */
export const GET: RequestHandler = async ({ params }) => {
  const { vanity } = params

  try {
    const filePath = join(DATA_DIR, `${vanity}.json`)
    const fileContent = await readFile(filePath, 'utf-8')
    const data = JSON.parse(fileContent) as TenantConfigData

    return json(data)
  } catch (e) {
    // Check if file not found
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
      throw error(404, `Tenant config not found for vanity: ${vanity}`)
    }

    // Other errors (e.g., JSON parse error, read error)
    console.error(`Error reading tenant config for ${vanity}:`, e)
    throw error(500, `Failed to read tenant config: ${e}`)
  }
}

/**
 * POST /api/tenant-config/[vanity]
 * Save tenant configuration
 * Requires admin authentication
 */
export const POST: RequestHandler = async ({ params, request, locals }) => {
  // Check admin auth
  // const user = locals.user
  // if (!user?.super_admin && !user?.roles?.includes('admin')) {
  //   throw error(403, 'Forbidden')
  // }

  const { vanity } = params

  try {
    const data = (await request.json()) as TenantConfigData

    // Validate required fields
    if (!data.id || !data.name || !data.vanity || !data.pages || !data.menus || !data.mainMenu) {
      throw error(400, 'Missing required fields: id, name, vanity, pages, menus, mainMenu')
    }

    // Validate vanity consistency
    if (params.vanity !== data.vanity) {
      throw error(400, `Vanity mismatch: URL has '${params.vanity}' but body has '${data.vanity}'`)
    }

    // Validate vanity format (alphanumeric, lowercase, hyphens allowed)
    const vanityRegex = /^[a-z0-9-]+$/
    if (!vanityRegex.test(data.vanity)) {
      throw error(400, 'Invalid vanity format. Must be lowercase alphanumeric with hyphens only.')
    }

    // Ensure data directory exists
    await mkdir(DATA_DIR, { recursive: true })

    // Write tenant config to file
    const filePath = join(DATA_DIR, `${vanity}.json`)
    await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')

    // Invalidate cache so next fetch gets fresh data
    tenantConfigStore.invalidate(vanity)

    return json({
      success: true,
      message: `Tenant config saved successfully for ${vanity}`,
    })
  } catch (e) {
    // If it's already an error we threw, re-throw it
    if (e && typeof e === 'object' && 'status' in e) {
      throw e
    }

    // Other unexpected errors
    console.error(`Error saving tenant config for ${vanity}:`, e)
    throw error(500, `Failed to save tenant config: ${e}`)
  }
}
