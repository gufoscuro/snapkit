// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { JWTUser } from '$lib/server/auth'

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: JWTUser
			token?: string
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
