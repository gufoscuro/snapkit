const MAX_HISTORY = 5

let stack = $state<string[]>([])
let isGoingBack = false

export function pushUrl(url: string) {
  if (isGoingBack) {
    isGoingBack = false
    return
  }
  const last = stack[stack.length - 1]
  if (url === last) return
  stack = [...stack.slice(-(MAX_HISTORY - 1)), url]
}

export function popUrl(): string | null {
  if (stack.length < 2) return null
  isGoingBack = true
  stack = stack.slice(0, -1)
  return stack[stack.length - 1]
}

export function hasPrevious(): boolean {
  return stack.length >= 2
}
