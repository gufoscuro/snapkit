// Presentation state for the chat surface. Separate from the conversation
// (`chatStore`) so the drawer's open/close and the single-surface dock
// coordinator stay independent of the orchestrator lifecycle.

let _isOpen = $state(false)
// When a page renders the chat inline (e.g. the admin editor's third pane), it
// claims the dock and the floating button + drawer are suppressed, so the SAME
// conversation never appears in two places at once.
let _dockOwner = $state<string | null>(null)

export const chatUi = {
  get isOpen() {
    return _isOpen
  },
  set isOpen(value: boolean) {
    _isOpen = value
  },
  open() {
    _isOpen = true
  },
  close() {
    _isOpen = false
  },
  toggle() {
    _isOpen = !_isOpen
  },

  /** Id of the page rendering the chat as an embedded dock, or null when floating. */
  get dockOwner() {
    return _dockOwner
  },
  /** A page claims the embedded dock slot (hides the floating UI). */
  claimDock(id: string) {
    _dockOwner = id
  },
  /** Release the dock, but only if `id` still owns it — guards against races where
   * an incoming page claims before the outgoing one's cleanup runs. */
  releaseDock(id: string) {
    if (_dockOwner === id) _dockOwner = null
  },
}
