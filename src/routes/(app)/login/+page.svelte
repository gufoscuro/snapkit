<script lang="ts">
  import { goto } from '$app/navigation'
  import { resolve } from '$app/paths'
  import Logo from '$lib/components/icons/Logo.svelte'
  import { Button } from '$lib/components/ui/button'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import { ApiError, apiRequest, initSanctum } from '$utils/request'

  let email = $state('')
  let password = $state('')
  let error = $state<string | null>(null)
  let loading = $state(false)

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault()
    error = null
    loading = true

    try {
      await initSanctum()
      await apiRequest({
        url: '/login',
        method: 'POST',
        data: {
          email,
          password,
        },
      })
    } catch (exception) {
      if (exception instanceof ApiError) {
        if (exception.status === 422) {
          error = 'Invalid email or password.'
          return
        }
      }
      error = 'An error occurred. Please try again.'
    } finally {
      loading = false
      goto(resolve('/home'))
    }
  }
</script>

<div class="grid min-h-svh lg:grid-cols-2">
  <div class="flex flex-col gap-4 p-6 md:p-10">
    <div class="flex justify-center gap-2 md:justify-start">
      <a href="##" class="flex items-center gap-2 font-medium">
        <Logo class="size-5 text-primary" />
        Moddo
      </a>
    </div>
    <div class="flex flex-1 items-center justify-center">
      <div class="flex w-full max-w-xs flex-col gap-6">
        <div class="flex flex-col items-center gap-2 text-center">
          <h1 class="text-2xl font-bold">Benvenuti</h1>
          <p class="text-sm text-balance text-muted-foreground">
            Inserisci nome utente e password per autenticarti e accedere
          </p>
        </div>

        <form onsubmit={handleSubmit} class="space-y-4">
          {#if error}
            <div class="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          {/if}

          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input
              id="email"
              type="email"
              bind:value={email}
              placeholder="Enter your email"
              required
              disabled={loading} />
          </div>

          <div class="space-y-2">
            <Label for="password">Password</Label>
            <Input
              id="password"
              type="password"
              bind:value={password}
              placeholder="Enter your password"
              required
              disabled={loading} />
          </div>

          <Button type="submit" class="w-full" disabled={loading}>
            {#if loading}
              Logging in...
            {:else}
              Login
            {/if}
          </Button>
        </form>
      </div>
    </div>
  </div>
  <div class="relative hidden items-center justify-center bg-muted lg:flex">
    <Logo class="w-40 text-muted-foreground/10" />
  </div>
</div>
