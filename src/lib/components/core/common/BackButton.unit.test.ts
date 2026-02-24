import { render, screen, fireEvent, cleanup } from '@testing-library/svelte'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import BackButton from './BackButton.svelte'

const { mockGoto, mockResolve, mockHasPrevious, mockPopUrl } = vi.hoisted(() => ({
  mockGoto: vi.fn(),
  mockResolve: vi.fn((path: string) => path),
  mockHasPrevious: vi.fn(() => false),
  mockPopUrl: vi.fn(() => null as string | null),
}))

vi.mock('$app/navigation', () => ({ goto: mockGoto }))
vi.mock('$app/paths', () => ({ resolve: mockResolve }))
vi.mock('$lib/contexts/navigation-history.svelte', () => ({
  hasPrevious: mockHasPrevious,
  popUrl: mockPopUrl,
}))

describe('BackButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockHasPrevious.mockReturnValue(false)
    mockPopUrl.mockReturnValue(null)
    mockResolve.mockImplementation((path: string) => path)
  })

  afterEach(() => cleanup())

  describe('visibility', () => {
    it('does not render without history and without fallback', () => {
      render(BackButton)
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('renders when fallback is provided', () => {
      render(BackButton, { props: { fallback: '/customers' } })
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('renders when history has a previous url', () => {
      mockHasPrevious.mockReturnValue(true)
      render(BackButton)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('label', () => {
    it('renders with default label "Back"', () => {
      render(BackButton, { props: { fallback: '/customers' } })
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
    })

    it('renders with custom label', () => {
      render(BackButton, { props: { fallback: '/customers', label: 'Torna indietro' } })
      expect(screen.getByRole('button', { name: /torna indietro/i })).toBeInTheDocument()
    })
  })

  describe('click behaviour', () => {
    it('navigates to previous history url on click', async () => {
      mockHasPrevious.mockReturnValue(true)
      mockPopUrl.mockReturnValue('/customers')
      render(BackButton)

      await fireEvent.click(screen.getByRole('button'))

      expect(mockPopUrl).toHaveBeenCalledOnce()
      expect(mockResolve).toHaveBeenCalledWith('/customers')
      expect(mockGoto).toHaveBeenCalledWith('/customers')
    })

    it('navigates to fallback when history is empty', async () => {
      mockPopUrl.mockReturnValue(null)
      render(BackButton, { props: { fallback: '/customers' } })

      await fireEvent.click(screen.getByRole('button'))

      expect(mockPopUrl).toHaveBeenCalledOnce()
      expect(mockResolve).toHaveBeenCalledWith('/customers')
      expect(mockGoto).toHaveBeenCalledWith('/customers')
    })

    it('prefers history url over fallback', async () => {
      mockHasPrevious.mockReturnValue(true)
      mockPopUrl.mockReturnValue('/orders/123')
      render(BackButton, { props: { fallback: '/customers' } })

      await fireEvent.click(screen.getByRole('button'))

      expect(mockGoto).toHaveBeenCalledWith('/orders/123')
      expect(mockGoto).not.toHaveBeenCalledWith('/customers')
    })

    it('does not call goto when neither history nor fallback are available', () => {
      render(BackButton)
      expect(mockGoto).not.toHaveBeenCalled()
    })
  })
})
