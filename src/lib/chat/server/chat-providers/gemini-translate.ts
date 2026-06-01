import type {
  ApiMessage,
  ContentBlock,
  MessagesApiPayload,
  MessagesApiResponse,
  StopReason,
  TextBlock,
  ToolDefinition,
  ToolResultBlock,
  ToolUseBlock,
} from '@diaphora/chat'
import { createId } from '@diaphora/chat/internal/id'

/**
 * Pure translation functions between Claude's Messages API format and
 * Google's Gemini `generateContent` format. No I/O — callable from server
 * routes or direct-call transports.
 */

/**
 * Gemini 3+ emits `thoughtSignature` on parts after internal thinking. The
 * signature must be echoed back verbatim on the corresponding part in the
 * next request, otherwise the API rejects with 400. `thought: true` marks
 * parts as internal reasoning that should not be shown to the user.
 */
type GeminiPartCommon = {
  thoughtSignature?: string
  thought?: boolean
}

export type GeminiTextPart = GeminiPartCommon & { text: string }
export type GeminiFunctionCallPart = GeminiPartCommon & {
  functionCall: { name: string; args: Record<string, unknown> }
}
export type GeminiFunctionResponsePart = GeminiPartCommon & {
  functionResponse: { name: string; response: Record<string, unknown> }
}
export type GeminiInlineDataPart = GeminiPartCommon & {
  inlineData: { mimeType: string; data: string }
}
export type GeminiPart =
  | GeminiTextPart
  | GeminiFunctionCallPart
  | GeminiFunctionResponsePart
  | GeminiInlineDataPart

export type GeminiContent = {
  role: 'user' | 'model'
  parts: GeminiPart[]
}

export type GeminiFunctionDeclaration = {
  name: string
  description: string
  parameters: Record<string, unknown>
}

export type GeminiRequest = {
  contents: GeminiContent[]
  systemInstruction?: { parts: GeminiTextPart[] }
  tools?: Array<{ functionDeclarations: GeminiFunctionDeclaration[] }>
  generationConfig?: {
    temperature?: number
    maxOutputTokens?: number
  }
}

export type GeminiResponse = {
  candidates?: Array<{
    content?: {
      role: 'model'
      parts?: GeminiPart[]
    }
    finishReason?: string
  }>
  usageMetadata?: {
    promptTokenCount?: number
    candidatesTokenCount?: number
  }
  promptFeedback?: { blockReason?: string }
}

export type TranslateOptions = {
  /** Model name (used only for the response envelope; the URL is built by the caller). */
  model: string
  temperature?: number
}

export function toGeminiRequest(
  payload: MessagesApiPayload,
  options: TranslateOptions,
): GeminiRequest {
  const toolNameById = buildToolUseNameMap(payload.messages)

  const contents: GeminiContent[] = []
  for (const msg of payload.messages) {
    const translated = toGeminiContents(msg, toolNameById)
    contents.push(...translated)
  }

  const request: GeminiRequest = { contents }

  if (payload.system) {
    request.systemInstruction = { parts: [{ text: payload.system }] }
  }

  if (payload.tools && payload.tools.length > 0) {
    request.tools = [{ functionDeclarations: payload.tools.map(toGeminiFunctionDeclaration) }]
  }

  if (options.temperature !== undefined || payload.max_tokens !== undefined) {
    request.generationConfig = {}
    if (options.temperature !== undefined)
      request.generationConfig.temperature = options.temperature
    if (payload.max_tokens !== undefined)
      request.generationConfig.maxOutputTokens = payload.max_tokens
  }

  return request
}

function buildToolUseNameMap(messages: ApiMessage[]): Map<string, string> {
  const map = new Map<string, string>()
  for (const msg of messages) {
    if (msg.role !== 'assistant' || typeof msg.content === 'string') continue
    for (const block of msg.content) {
      if (block.type === 'tool_use') map.set(block.id, block.name)
    }
  }
  return map
}

function toGeminiContents(msg: ApiMessage, toolNameById: Map<string, string>): GeminiContent[] {
  const role: GeminiContent['role'] = msg.role === 'assistant' ? 'model' : 'user'

  if (typeof msg.content === 'string') {
    return msg.content.length > 0 ? [{ role, parts: [{ text: msg.content }] }] : []
  }

  const blocks = msg.content

  if (msg.role === 'assistant') {
    const parts: GeminiPart[] = []
    for (const block of blocks) {
      if (block.type === 'text') {
        if (!block.text) continue
        const part: GeminiTextPart = { text: block.text }
        const signature = readThoughtSignature(block.metadata)
        if (signature) part.thoughtSignature = signature
        parts.push(part)
      } else if (block.type === 'tool_use') {
        const part: GeminiFunctionCallPart = {
          functionCall: { name: block.name, args: (block as ToolUseBlock).input ?? {} },
        }
        const signature = readThoughtSignature(block.metadata)
        if (signature) part.thoughtSignature = signature
        parts.push(part)
      }
    }
    return parts.length > 0 ? [{ role: 'model', parts }] : []
  }

  // User message: may carry text blocks, tool_result blocks, and image attachments.
  // Gemini accepts functionResponse parts inside a `user` role content block.
  const parts: GeminiPart[] = []
  for (const block of blocks) {
    if (block.type === 'text') {
      if (block.text) parts.push({ text: block.text })
    } else if (block.type === 'tool_result') {
      parts.push(toFunctionResponsePart(block, toolNameById))
    } else if (block.type === 'image') {
      parts.push({ inlineData: { mimeType: block.source.media_type, data: block.source.data } })
    }
  }
  return parts.length > 0 ? [{ role: 'user', parts }] : []
}

function toFunctionResponsePart(
  block: ToolResultBlock,
  toolNameById: Map<string, string>,
): GeminiFunctionResponsePart {
  const name = toolNameById.get(block.tool_use_id) ?? 'unknown_tool'
  const response: Record<string, unknown> = block.is_error
    ? { error: block.content }
    : (tryParseJsonObject(block.content) ?? { content: block.content })
  return { functionResponse: { name, response } }
}

function readThoughtSignature(metadata: Record<string, unknown> | undefined): string | undefined {
  const gemini = metadata?.gemini
  if (gemini && typeof gemini === 'object' && 'thoughtSignature' in gemini) {
    const signature = (gemini as { thoughtSignature?: unknown }).thoughtSignature
    if (typeof signature === 'string' && signature.length > 0) return signature
  }
  return undefined
}

function tryParseJsonObject(raw: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>
    }
    return null
  } catch {
    return null
  }
}

function toGeminiFunctionDeclaration(tool: ToolDefinition): GeminiFunctionDeclaration {
  return {
    name: tool.name,
    description: tool.description,
    parameters: tool.input_schema,
  }
}

const BLOCKING_FINISH_REASONS = new Set([
  'SAFETY',
  'RECITATION',
  'BLOCKLIST',
  'PROHIBITED_CONTENT',
  'SPII',
  'MALFORMED_FUNCTION_CALL',
  'OTHER',
])

export function fromGeminiResponse(data: GeminiResponse, model: string): MessagesApiResponse {
  const candidate = data.candidates?.[0]
  if (!candidate) {
    const blocked = data.promptFeedback?.blockReason
    throw new Error(
      blocked ? `Gemini response blocked (${blocked})` : 'Gemini response has no candidates',
    )
  }

  if (candidate.finishReason && BLOCKING_FINISH_REASONS.has(candidate.finishReason)) {
    throw new Error(`Gemini stopped with finishReason "${candidate.finishReason}"`)
  }

  const parts = candidate.content?.parts ?? []
  const content: ContentBlock[] = []

  for (const part of parts) {
    // `thought: true` parts are internal reasoning — never render them, but the
    // `thoughtSignature` that may accompany them lives on text/functionCall parts
    // we keep, so no side-channel bookkeeping is needed.
    if (part.thought) continue

    if ('text' in part && part.text && part.text.trim().length > 0) {
      const block: TextBlock = { type: 'text', text: part.text }
      if (part.thoughtSignature) {
        block.metadata = { gemini: { thoughtSignature: part.thoughtSignature } }
      }
      content.push(block)
    } else if ('functionCall' in part && part.functionCall) {
      const args =
        part.functionCall.args && typeof part.functionCall.args === 'object'
          ? part.functionCall.args
          : {}
      const block: ToolUseBlock = {
        type: 'tool_use',
        id: createId('tu'),
        name: part.functionCall.name,
        input: args,
      }
      if (part.thoughtSignature) {
        block.metadata = { gemini: { thoughtSignature: part.thoughtSignature } }
      }
      content.push(block)
    }
  }

  const hasToolUse = content.some(b => b.type === 'tool_use')

  return {
    id: `gemini_${Date.now()}`,
    role: 'assistant',
    content,
    stop_reason: toStopReason(candidate.finishReason, hasToolUse),
    model,
    usage: data.usageMetadata
      ? {
          input_tokens: data.usageMetadata.promptTokenCount ?? 0,
          output_tokens: data.usageMetadata.candidatesTokenCount ?? 0,
        }
      : undefined,
  }
}

// Gemini returns finishReason: 'STOP' even when it emits functionCall parts,
// unlike OpenAI which uses 'tool_calls'. Infer tool_use from content instead.
function toStopReason(finishReason: string | undefined, hasToolUse: boolean): StopReason {
  if (hasToolUse) return 'tool_use'
  switch (finishReason) {
    case 'MAX_TOKENS':
      return 'max_tokens'
    case 'STOP':
    case undefined:
    default:
      return 'end_turn'
  }
}
