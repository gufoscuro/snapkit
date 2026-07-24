/**
 * Client-side preparation of a branding logo before uploading it to
 * POST `/api/legal-entities/{legalEntity}/branding/logo`.
 *
 * The backend accepts only raster images (SVG is rejected), max 512 KB, with a
 * width between 600 and 2000 px. Rather than bounce the user off a server-side
 * 422, we validate and normalize here: reject non-raster files up front, then
 * redraw the image on a canvas at a width clamped into the valid range and
 * re-encode it under the size budget.
 *
 * Encoding prefers PNG (keeps logo transparency); if the PNG overshoots the
 * byte budget — typical only for photo-like sources — it falls back to JPEG on
 * a white background at descending quality until it fits.
 */

const MAX_BYTES = 512 * 1024
const MIN_WIDTH = 600
const MAX_WIDTH = 2000
/** Cap large sources here (still within the valid range) to keep files small. */
const PREFERRED_MAX_WIDTH = 1600
const JPEG_QUALITY_STEPS = [0.92, 0.85, 0.75, 0.6] as const

export type LogoPrepError = 'not-raster' | 'decode-failed' | 'too-large'

export type LogoPrepResult =
  | { ok: true; blob: Blob; filename: string; width: number; height: number }
  | { ok: false; reason: LogoPrepError }

function toBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob | null> {
  return new Promise(resolve => canvas.toBlob(resolve, type, quality))
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('decode-failed'))
    }
    img.src = url
  })
}

function targetWidth(naturalWidth: number): number {
  if (naturalWidth > PREFERRED_MAX_WIDTH) return PREFERRED_MAX_WIDTH
  if (naturalWidth < MIN_WIDTH) return MIN_WIDTH
  return Math.min(naturalWidth, MAX_WIDTH)
}

function withExtension(name: string, ext: string): string {
  const base = name.replace(/\.[^./\\]+$/, '') || 'logo'
  return `${base}.${ext}`
}

export async function prepareLogoUpload(file: File): Promise<LogoPrepResult> {
  // SVG and anything non-raster is rejected by the backend, so stop here.
  if (file.type === 'image/svg+xml' || !file.type.startsWith('image/')) {
    return { ok: false, reason: 'not-raster' }
  }

  let img: HTMLImageElement
  try {
    img = await loadImage(file)
  } catch {
    return { ok: false, reason: 'decode-failed' }
  }

  const width = targetWidth(img.naturalWidth)
  const scale = width / img.naturalWidth
  const height = Math.round(img.naturalHeight * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return { ok: false, reason: 'decode-failed' }
  ctx.drawImage(img, 0, 0, width, height)

  // Prefer PNG to preserve transparency.
  const png = await toBlob(canvas, 'image/png')
  if (png && png.size <= MAX_BYTES) {
    return { ok: true, blob: png, filename: withExtension(file.name, 'png'), width, height }
  }

  // PNG too heavy — flatten onto white and try JPEG at descending quality.
  ctx.globalCompositeOperation = 'destination-over'
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)

  let smallest: Blob | null = png
  for (const quality of JPEG_QUALITY_STEPS) {
    const jpeg = await toBlob(canvas, 'image/jpeg', quality)
    if (!jpeg) continue
    if (jpeg.size <= MAX_BYTES) {
      return { ok: true, blob: jpeg, filename: withExtension(file.name, 'jpg'), width, height }
    }
    if (!smallest || jpeg.size < smallest.size) smallest = jpeg
  }

  return { ok: false, reason: 'too-large' }
}
