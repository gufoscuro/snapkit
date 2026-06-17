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
  // The user's overarching, cross-page objective ("set up tool X, then build a
  // plan around it"). Survives soft resets (which clear only the message
  // history on a scope change) so a freshly-reskinned assistant retains the
  // north star; cleared by `reset()` (hard reset on user/session change).
  let goal = $state<string | null>(null)

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

  function setGoal(next: string) {
    goal = next.trim() || null
  }

  function clearGoal() {
    goal = null
  }

  function reset() {
    entries.length = 0
    current = null
    goal = null
  }

  return {
    get entries() {
      return entries
    },
    get current() {
      return current
    },
    get goal() {
      return goal
    },
    pushPage,
    recordAction,
    setGoal,
    clearGoal,
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
