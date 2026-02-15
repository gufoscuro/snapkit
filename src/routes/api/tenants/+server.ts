import type { TenantConfig } from '$lib/admin/types'
import { error, json } from '@sveltejs/kit'
import { mkdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import type { RequestHandler } from './$types'

const DATA_DIR = join(process.cwd(), 'data')
const TENANTS_FILE = join(DATA_DIR, 'tenants.json')

/**
 * GET /api/tenants
 * Fetch all tenants
 * Public endpoint - no authentication required
 */
export const GET: RequestHandler = async () => {
  try {
    const fileContent = await readFile(TENANTS_FILE, 'utf-8')
    const tenants = JSON.parse(fileContent) as TenantConfig[]
    return json(tenants)
  } catch (e) {
    // If file doesn't exist, fallback to empty array
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
      return json([])
    }

    // Other errors
    console.error('Error reading tenants:', e)
    throw error(500, `Failed to read tenants: ${e}`)
  }
}

/**
 * POST /api/tenants
 * Save all tenants
 * Requires admin authentication
 */
export const POST: RequestHandler = async ({ request, locals }) => {
  // Check admin auth
  // const user = locals.user
  // if (!user?.super_admin && !user?.roles?.includes('admin')) {
  //   throw error(403, 'Forbidden')
  // }

  try {
    const tenants = (await request.json()) as TenantConfig[]

    // Validate that it's an array
    if (!Array.isArray(tenants)) {
      throw error(400, 'Expected an array of tenants')
    }

    // Validate each tenant has required fields
    for (const tenant of tenants) {
      if (!tenant.id || !tenant.name || !tenant.vanity) {
        throw error(400, 'Each tenant must have id, name, and vanity fields')
      }
    }

    // Ensure data directory exists
    await mkdir(DATA_DIR, { recursive: true })

    // Write tenants to file
    await writeFile(TENANTS_FILE, JSON.stringify(tenants, null, 2), 'utf-8')

    return json({
      success: true,
      message: `Saved ${tenants.length} tenant(s) successfully`,
    })
  } catch (e) {
    // If it's already an error we threw, re-throw it
    if (e && typeof e === 'object' && 'status' in e) {
      throw e
    }

    // Other unexpected errors
    console.error('Error saving tenants:', e)
    throw error(500, `Failed to save tenants: ${e}`)
  }
}
