import { getContext, setContext } from 'svelte';
import type { LegalEntityResourceConfig } from '$lib/stores/tenant-config/types';

const FORM_CONTEXT_KEY = Symbol('form-context');

/**
 * Form API exposed via context to all child components.
 * Generic type T represents the form values shape.
 */
export type FormAPI<T extends Record<string, unknown> = Record<string, unknown>> = {
	readonly values: T;
	readonly errors: Partial<Record<keyof T, string>>;
	readonly touched: Partial<Record<keyof T, boolean>>;
	readonly isValid: boolean;
	readonly isDirty: boolean;
	readonly inflight: boolean;
	readonly locked: boolean;
	readonly errorMessage: string | null;
	readonly resourceConfig?: LegalEntityResourceConfig;
	updateField: <K extends keyof T>(name: K, value: T[K]) => void;
	validateField: <K extends keyof T>(name: K) => void;
	touchField: <K extends keyof T>(name: K) => void;
	reset: () => void;
	submit: (option?: string | null) => void;
};

/**
 * Set the form context. Called by FormUtil.
 */
export function setFormContext<T extends Record<string, unknown>>(api: FormAPI<T>): void {
	setContext(FORM_CONTEXT_KEY, api);
}

/**
 * Get the form context. Throws if not found.
 * Use this when the component MUST be inside a FormUtil.
 */
export function getFormContext<
	T extends Record<string, unknown> = Record<string, unknown>
>(): FormAPI<T> {
	const ctx = getContext<FormAPI<T> | undefined>(FORM_CONTEXT_KEY);
	if (!ctx) {
		throw new Error('Form context not found. Wrap your component with <FormUtil>.');
	}
	return ctx;
}

/**
 * Get the form context optionally. Returns null if not found.
 * Use this when the component can work both inside and outside a FormUtil.
 */
export function getFormContextOptional<
	T extends Record<string, unknown> = Record<string, unknown>
>(): FormAPI<T> | null {
	return getContext<FormAPI<T> | undefined>(FORM_CONTEXT_KEY) ?? null;
}

/**
 * Clear the form context for child components.
 * Use this in components that manage their own internal state and don't want
 * their child fields to autowire to the parent form.
 */
export function clearFormContext(): void {
	setContext(FORM_CONTEXT_KEY, null);
}
