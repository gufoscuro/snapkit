import type { ComponentProps } from 'svelte'
import type BackButton from './BackButton.svelte'

export const mockBackButtonProps: ComponentProps<typeof BackButton> = {
  fallback: '/dashboard',
  label: 'Back'
}
