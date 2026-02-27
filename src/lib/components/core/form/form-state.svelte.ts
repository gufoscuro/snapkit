import { stringifyJSON } from '$utils/json';

/**
 * Validation function type.
 * Returns an object with field names as keys and error messages as values.
 */
export type ValidateFn<T> = (values: T) => Partial<Record<keyof T, string>>;

/**
 * Configuration for createFormState.
 * Uses getters to ensure we always access the latest prop values.
 */
export type FormStateConfig<T extends Record<string, unknown>> = {
	getInitialValues: () => T;
	getValidate?: () => ValidateFn<T> | undefined;
};

/**
 * Creates a reactive form state using Svelte 5 runes.
 * This is the core state management logic, separated from the UI component.
 */
export function createFormState<T extends Record<string, unknown>>(config: FormStateConfig<T>) {
	const initial = config.getInitialValues();
	let initialSnapshot = $state(stringifyJSON(initial));

	let values = $state<T>({ ...initial });
	let errors = $state<Partial<Record<keyof T, string>>>({});
	let touched = $state<Partial<Record<keyof T, boolean>>>({});

	const isValid = $derived(Object.keys(errors).length === 0);
	const isDirty = $derived(stringifyJSON(values) !== initialSnapshot);

	/**
	 * Update a single field value.
	 */
	function updateField<K extends keyof T>(name: K, value: T[K]) {
		values[name] = value;
	}

	/**
	 * Validate a single field.
	 * Always uses the latest validate function via getter.
	 */
	function validateField<K extends keyof T>(name: K) {
		const validateFn = config.getValidate?.();
		if (!validateFn) return;
		const allErrors = validateFn(values);
		if (allErrors[name]) {
			errors[name] = allErrors[name];
		} else {
			delete errors[name];
			// Trigger reactivity by reassigning
			errors = { ...errors };
		}
	}

	/**
	 * Validate all fields.
	 * Returns true if valid, false otherwise.
	 * Always uses the latest validate function via getter.
	 */
	function validate(): boolean {
		const validateFn = config.getValidate?.();
		if (!validateFn) return true;
		errors = validateFn(values);
		return Object.keys(errors).length === 0;
	}

	/**
	 * Mark a field as touched.
	 */
	function touchField<K extends keyof T>(name: K) {
		touched[name] = true;
	}

	/**
	 * Reset the form to initial values.
	 */
	function reset() {
		const initial = config.getInitialValues();
		values = { ...initial };
		initialSnapshot = stringifyJSON(initial);
		errors = {};
		touched = {};
	}

	/**
	 * Set new values (used when initialValues prop changes).
	 */
	function setValues(newValues: T) {
		values = { ...newValues };
		initialSnapshot = stringifyJSON(newValues);
		errors = {};
		touched = {};
	}

	/**
	 * Set errors programmatically (e.g. from server-side validation).
	 * Also marks the affected fields as touched so error messages are displayed.
	 */
	function setErrors(serverErrors: Partial<Record<keyof T, string>>) {
		errors = { ...errors, ...serverErrors };
		for (const key of Object.keys(serverErrors) as Array<keyof T>) {
			touched[key] = true;
		}
	}

	return {
		get values() {
			return values;
		},
		get errors() {
			return errors;
		},
		get touched() {
			return touched;
		},
		get isValid() {
			return isValid;
		},
		get isDirty() {
			return isDirty;
		},
		updateField,
		validateField,
		validate,
		touchField,
		reset,
		setValues,
		setErrors
	};
}

export type FormState<T extends Record<string, unknown>> = ReturnType<typeof createFormState<T>>;
