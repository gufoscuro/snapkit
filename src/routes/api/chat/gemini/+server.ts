import { env } from '$env/dynamic/private'
import type { MessagesApiPayload } from '@diaphora/chat'
import { chatEnabled } from '$lib/chat/enabled'
import { resolveServerContext } from '$lib/chat/server/chat-contexts/resolve'
import {
  fromGeminiResponse,
  toGeminiRequest,
  type GeminiResponse,
} from '$lib/chat/server/chat-providers/gemini-translate'
import { GoogleGenAI, type Content, type GenerateContentConfig, type Tool } from '@google/genai'
import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const GEMINI_MODEL = env.GEMINI_MODEL || 'gemini-2.5-flash'
const GEMINI_API_KEY = env.GEMINI_API_KEY

// SDK unificata: solo `apiKey` per Google AI Studio. Per passare a Vertex più avanti
// basterà sostituire questa init con `{ vertexai: true, project, location, googleAuthOptions }`.
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null

export const POST: RequestHandler = async event => {
  // Chat is gated by `chatEnabled` (currently subordinated to `dev`). When the
  // gate is off, hide the endpoint entirely so it can't be probed or abused
  // while the API key is unauthenticated.
  if (!chatEnabled) error(404)
  if (!ai) {
    return json({ error: 'GEMINI_API_KEY is not set' }, { status: 503 })
  }

  let payload: MessagesApiPayload
  try {
    payload = (await event.request.json()) as MessagesApiPayload
  } catch {
    return json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!payload.messages || !Array.isArray(payload.messages)) {
    return json({ error: 'payload.messages is required' }, { status: 400 })
  }

  // Strict: require a valid serverContext on every request. The authoritative system
  // prompt is composed server-side from the registered template + vars; any `payload.system`
  // sent by the client is discarded.
  const resolved = resolveServerContext(payload)
  if (!resolved.ok) {
    return json(resolved.body, { status: resolved.status })
  }
  payload = resolved.payload

  const translated = toGeminiRequest(payload, { model: GEMINI_MODEL })

  const config: GenerateContentConfig = {}
  if (translated.systemInstruction) config.systemInstruction = translated.systemInstruction
  if (translated.tools) config.tools = translated.tools as unknown as Tool[]
  if (translated.generationConfig?.temperature !== undefined)
    config.temperature = translated.generationConfig.temperature
  if (translated.generationConfig?.maxOutputTokens !== undefined)
    config.maxOutputTokens = translated.generationConfig.maxOutputTokens

  let response
  try {
    response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: translated.contents as unknown as Content[],
      config,
    })
  } catch (err) {
    console.error('[chat/gemini] Gemini call failed:', err)
    const status = (err as { status?: number })?.status
    return json(
      { error: 'Gemini call failed', details: String(err) },
      { status: status && status >= 400 && status < 600 ? status : 503 },
    )
  }

  try {
    return json(fromGeminiResponse(response as unknown as GeminiResponse, GEMINI_MODEL))
  } catch (err) {
    return json({ error: 'Translation failed', details: String(err) }, { status: 500 })
  }
}
