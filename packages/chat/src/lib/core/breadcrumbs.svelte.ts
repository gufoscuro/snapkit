// Conversation navigation/action trace ("breadcrumbs") injected into the system
// prompt as ambient memory. Part of the @diaphora/chat orchestration layer.
// Deps: Svelte runes only — no host imports.

export type BreadcrumbAction = {
  tool: string
  input: unknown
  result?: string
}

export type Breadcrumb = {
  pageId: string
  enteredAt: number
  actions: BreadcrumbAction[]
}

type Options = {
  /** Cap on archived (non-current) breadcrumbs. FIFO when exceeded. Default 20. */
  maxEntries?: number
}

export function createBreadcrumbStore(opts: Options = {}) {
  const max = opts.maxEntries ?? 20
  const entries = $state<Breadcrumb[]>([])
  let current = $state<Breadcrumb | null>(null)

  function pushPage(pageId: string) {
    if (current && current.pageId === pageId) return
    if (current) {
      entries.push(current)
      while (entries.length > max) entries.shift()
    }
    current = { pageId, enteredAt: Date.now(), actions: [] }
  }

  function recordAction(tool: string, input: unknown, result?: string) {
    if (!current) return
    current.actions.push({ tool, input, result })
  }

  function format(): string {
    const all = current ? [...entries, current] : entries
    if (all.length === 0) return ''
    return all
      .map(b => {
        if (b.actions.length === 0) return `- ${b.pageId}`
        const actionLines = b.actions
          .map(a => `  - ${a.tool}(${safeStringify(a.input)})`)
          .join('\n')
        return `- ${b.pageId}\n${actionLines}`
      })
      .join('\n')
  }

  function reset() {
    entries.length = 0
    current = null
  }

  return {
    get entries() {
      return entries
    },
    get current() {
      return current
    },
    pushPage,
    recordAction,
    format,
    reset,
  }
}

export type BreadcrumbStore = ReturnType<typeof createBreadcrumbStore>

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value)
  } catch {
    return '<unserializable>'
  }
}
