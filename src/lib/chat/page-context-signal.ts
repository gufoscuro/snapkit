// Late-bound bridge to the orchestrator's page-tools registry.
//
// The navigate_to_page tool is built (with its host goto/resolveHref) and
// passed into createChatOrchestrator BEFORE the orchestrator — and therefore
// its registry — exists, so the tool can't reference the registry directly. The
// chat store binds the real waiter once the orchestrator is created; until then
// this is a no-op. Standalone (imports nothing app-side) to avoid an import
// cycle between the chat store and the navigation tool.
//
// The actual waiting logic lives in the package registry's
// `waitForNextRegistration` — this is just the host-side glue.

let _wait: (timeoutMs?: number) => Promise<void> = () => Promise.resolve()

/** Bind the real registry waiter. Called by the chat store after orchestrator init. */
export function bindPageContextWaiter(fn: (timeoutMs?: number) => Promise<void>): void {
  _wait = fn
}

/** Resolve once the destination page registers its scoped chat tools (or times out). */
export function waitForPageContextRegister(timeoutMs?: number): Promise<void> {
  return _wait(timeoutMs)
}
