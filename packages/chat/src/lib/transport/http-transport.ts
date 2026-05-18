import type { MessagesApiPayload, MessagesApiResponse, Transport } from '../types'

export type HttpTransportConfig = {
	url: string
	headers?: Record<string, string>
	fetch?: typeof globalThis.fetch
}

export function httpTransport(config: HttpTransportConfig): Transport {
	const fetchImpl = config.fetch ?? globalThis.fetch

	return {
		async send(payload: MessagesApiPayload): Promise<MessagesApiResponse> {
			const response = await fetchImpl(config.url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					...config.headers
				},
				body: JSON.stringify(payload)
			})

			if (!response.ok) {
				const body = await response.text().catch(() => '')
				throw new Error(`Chat transport failed: ${response.status} ${response.statusText} ${body}`)
			}

			return (await response.json()) as MessagesApiResponse
		}
	}
}
