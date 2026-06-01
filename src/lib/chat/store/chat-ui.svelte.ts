let _isOpen = $state(false)

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
}
