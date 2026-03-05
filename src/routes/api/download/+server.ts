import { error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url }) => {
  const downloadUrl = url.searchParams.get('url')
  const filename = url.searchParams.get('filename') ?? 'download'

  if (!downloadUrl) {
    error(400, 'Missing url parameter')
  }

  const response = await fetch(downloadUrl)

  if (!response.ok) {
    error(response.status, 'Failed to fetch file')
  }

  const contentType = response.headers.get('content-type') ?? 'application/octet-stream'

  return new Response(response.body, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
