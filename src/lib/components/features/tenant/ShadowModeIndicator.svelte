<!--
  @component ShadowModeIndicator
  @description Marks that the user is acting inside a tenant that isn't their own,
  naming both sides and offering a one-click way back to their home tenant.
  @keywords shadow, impersonation, tenant, superadmin, banner, indicator
  @uses Button
-->
<script lang="ts">
  import { Button } from '$components/ui/button'
  import * as m from '$lib/paraglide/messages'
  import { buildVanityOrigin } from '$lib/utils/tenant'
  import { cn } from '$lib/utils.js'
  import EyeIcon from '@lucide/svelte/icons/eye'
  import LogOutIcon from '@lucide/svelte/icons/log-out'

  type Props = {
    /** The user's own tenant name. */
    homeTenantName: string
    /** Vanity of the user's own tenant — the way back. */
    homeVanity: string
    /**
     * Vanity of the tenant being acted inside. Deliberately the vanity and not the
     * display name: it's the exact word shown in the address bar, so the banner and
     * the URL corroborate each other instead of offering two labels to reconcile.
     * It also costs no lookup — we hold the origin, not the tenant's name.
     */
    actingAsVanity: string
    class?: string
  }

  let { homeTenantName, homeVanity, actingAsVanity, class: className = '' }: Props = $props()

  // Leaving is a plain origin change: the tenant lives in the host, so going home
  // is going to the home host. Nothing to unset — the cookies we'd have had to
  // clear belong to the origin we're leaving behind.
  function exit() {
    window.location.href = buildVanityOrigin(homeVanity, window.location)
  }
</script>

<!-- The URL already says *which* tenant; it can't say that you're a guest in it —
     an operator and a superadmin see the identical address. That distinction is the
     one worth a banner, because it's the one that decides how much damage a wrong
     click does. -->
<div
  class={cn(
    'flex items-center gap-2 rounded-md border border-amber-500/50 bg-amber-500/10 py-1 pr-1 pl-2 text-amber-700 dark:text-amber-400',
    className,
  )}>
  <EyeIcon class="size-4 shrink-0" />
  <span class="truncate text-xs">
    {m.shadow_mode_acting_as({ home: homeTenantName, target: actingAsVanity })}
  </span>
  <Button
    type="button"
    variant="ghost"
    size="sm"
    class="h-6 shrink-0 gap-1 px-2 text-xs hover:bg-amber-500/20"
    onclick={exit}>
    <LogOutIcon class="size-3" />
    {m.shadow_mode_exit()}
  </Button>
</div>
