<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="flex h-screen w-full items-center justify-center">
	<div class="text-center">
		<h1 class="text-4xl font-bold">{$page.status}</h1>
		<p class="mt-2 text-muted-foreground">{$page.error?.message}</p>
	</div>
</div>
