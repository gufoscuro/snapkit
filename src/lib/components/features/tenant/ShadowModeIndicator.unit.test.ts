import { cleanup, fireEvent, render, screen } from '@testing-library/svelte'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('$lib/paraglide/messages', () => ({
  shadow_mode_acting_as: ({ home, target }: { home: string; target: string }) => `${home} — acting as ${target}`,
  shadow_mode_exit: () => 'Exit',
}))

import { mockShadowModeIndicator } from './ShadowModeIndicator.mock'
import ShadowModeIndicator from './ShadowModeIndicator.svelte'

describe('ShadowModeIndicator', () => {
  afterEach(() => cleanup())

  it('names both sides — who you are and who you are acting as', () => {
    render(ShadowModeIndicator, { props: mockShadowModeIndicator })
    expect(screen.getByText('Moddo S.r.l. — acting as acme')).toBeInTheDocument()
  })

  it('offers a way out', () => {
    render(ShadowModeIndicator, { props: mockShadowModeIndicator })
    expect(screen.getByRole('button', { name: /exit/i })).toBeInTheDocument()
  })

  it('exits by going to the home tenant origin, keeping scheme and port', async () => {
    const assign = vi.fn()
    // jsdom/happy-dom won't navigate, so observe the assignment instead.
    const original = Object.getOwnPropertyDescriptor(window, 'location')
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        protocol: 'http:',
        hostname: 'acme.moddo.local',
        port: '5173',
        set href(value: string) {
          assign(value)
        },
      },
    })

    render(ShadowModeIndicator, { props: mockShadowModeIndicator })
    await fireEvent.click(screen.getByRole('button', { name: /exit/i }))

    expect(assign).toHaveBeenCalledWith('http://moddo.moddo.local:5173')

    if (original) Object.defineProperty(window, 'location', original)
  })
})
