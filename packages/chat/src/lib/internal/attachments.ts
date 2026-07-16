import type { AttachmentLimits, AttachmentRef } from '../types'

export const DEFAULT_ATTACHMENT_LIMITS: AttachmentLimits = {
	maxFiles: 4,
	maxImageSize: 5 * 1024 * 1024,
	maxTextSize: 200 * 1024
}

const TEXT_EXTENSIONS = new Set([
	'md',
	'txt',
	'html',
	'xml',
	'js',
	'jsx',
	'mjs',
	'cjs',
	'ts',
	'tsx',
	'svelte',
	'vue',
	'css',
	'scss',
	'sass',
	'less',
	'py',
	'go',
	'rs',
	'java',
	'kt',
	'swift',
	'rb',
	'php',
	'c',
	'cpp',
	'cc',
	'h',
	'hpp',
	'cs',
	'json',
	'jsonc',
	'yaml',
	'yml',
	'toml',
	'ini',
	'csv',
	'sql',
	'sh',
	'bash',
	'zsh',
	'fish'
])

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp'])

const IMAGE_MIME_BY_EXT: Record<string, string> = {
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	png: 'image/png',
	gif: 'image/gif',
	webp: 'image/webp'
}

/** Filenames that look like credentials/secrets, blocked even if the extension passes. */
const SENSITIVE_PATTERNS: RegExp[] = [
	/(^|\.)env(\..*)?$/i,
	/\.pem$/i,
	/\.key$/i,
	/\.crt$/i,
	/\.cer$/i,
	/^id_rsa(\.|$)/i,
	/^id_ed25519(\.|$)/i,
	/^id_ecdsa(\.|$)/i,
	/\.p12$/i,
	/\.pfx$/i
]

export type AttachmentKind = 'text' | 'image'

export type AttachmentValidationResult =
	| { ok: true; kind: AttachmentKind; mimeType: string }
	| { ok: false; error: string }

function getExtension(filename: string): string {
	const idx = filename.lastIndexOf('.')
	if (idx === -1 || idx === filename.length - 1) return ''
	return filename.slice(idx + 1).toLowerCase()
}

export function isSensitiveFilename(filename: string): boolean {
	return SENSITIVE_PATTERNS.some((pattern) => pattern.test(filename))
}

export function classifyAttachment(file: File, limits: AttachmentLimits): AttachmentValidationResult {
	if (isSensitiveFilename(file.name)) {
		return { ok: false, error: `"${file.name}" looks sensitive (credentials/key) and was blocked.` }
	}

	const ext = getExtension(file.name)

	if (IMAGE_EXTENSIONS.has(ext)) {
		if (file.size > limits.maxImageSize) {
			return {
				ok: false,
				error: `"${file.name}" exceeds the ${formatBytes(limits.maxImageSize)} image limit.`
			}
		}
		return { ok: true, kind: 'image', mimeType: IMAGE_MIME_BY_EXT[ext] }
	}

	if (TEXT_EXTENSIONS.has(ext)) {
		if (file.size > limits.maxTextSize) {
			return {
				ok: false,
				error: `"${file.name}" exceeds the ${formatBytes(limits.maxTextSize)} text limit.`
			}
		}
		return { ok: true, kind: 'text', mimeType: file.type || 'text/plain' }
	}

	return { ok: false, error: `"${file.name}" has an unsupported file type.` }
}

export function readAsText(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'))
		reader.onload = () => {
			const result = reader.result
			if (typeof result === 'string') resolve(result)
			else reject(new Error('Unexpected non-text reader result'))
		}
		reader.readAsText(file)
	})
}

export function readAsBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'))
		reader.onload = () => {
			const result = reader.result
			if (typeof result !== 'string') {
				reject(new Error('Unexpected non-string reader result'))
				return
			}
			const commaIdx = result.indexOf(',')
			resolve(commaIdx === -1 ? result : result.slice(commaIdx + 1))
		}
		reader.readAsDataURL(file)
	})
}

export async function loadAttachment(
	file: File,
	limits: AttachmentLimits
): Promise<{ ok: true; ref: AttachmentRef } | { ok: false; error: string }> {
	const verdict = classifyAttachment(file, limits)
	if (!verdict.ok) return verdict
	try {
		if (verdict.kind === 'text') {
			const content = await readAsText(file)
			return {
				ok: true,
				ref: {
					kind: 'text',
					name: file.name,
					mimeType: verdict.mimeType,
					size: file.size,
					content
				}
			}
		}
		const base64 = await readAsBase64(file)
		return {
			ok: true,
			ref: {
				kind: 'image',
				name: file.name,
				mimeType: verdict.mimeType,
				size: file.size,
				base64
			}
		}
	} catch (err) {
		return { ok: false, error: err instanceof Error ? err.message : String(err) }
	}
}

export function resolveLimits(overrides: Partial<AttachmentLimits> | undefined): AttachmentLimits {
	return {
		maxFiles: overrides?.maxFiles ?? DEFAULT_ATTACHMENT_LIMITS.maxFiles,
		maxImageSize: overrides?.maxImageSize ?? DEFAULT_ATTACHMENT_LIMITS.maxImageSize,
		maxTextSize: overrides?.maxTextSize ?? DEFAULT_ATTACHMENT_LIMITS.maxTextSize
	}
}

export function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes}B`
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
	return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

const XML_ESCAPES: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&apos;'
}

function escapeXmlAttr(value: string): string {
	return value.replace(/[&<>"']/g, (ch) => XML_ESCAPES[ch])
}

export function formatTextAttachment(att: Extract<AttachmentRef, { kind: 'text' }>): string {
	return `<attachment name="${escapeXmlAttr(att.name)}" mime="${escapeXmlAttr(att.mimeType)}">\n${att.content}\n</attachment>`
}
