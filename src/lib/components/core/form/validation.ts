import * as m from '$lib/paraglide/messages';

/**
 * Single field validator function.
 * Returns an error message string if invalid, undefined if valid.
 */
export type FieldValidator<T> = (value: T[keyof T], values: T) => string | undefined;

/**
 * Schema definition: field name -> array of validators
 */
export type ValidationSchema<T> = {
	[K in keyof T]?: FieldValidator<T>[];
};

/**
 * Refine function for cross-field validation.
 * Returns partial errors object or undefined/empty object if valid.
 */
export type RefineFn<T> = (values: T) => Partial<Record<keyof T, string>> | undefined;

/**
 * Options for validators that support custom messages.
 */
type ValidatorOptions = {
	message?: string;
	field?: string;
};

/**
 * Check if a value is empty (null, undefined, empty string, empty array).
 */
function isEmpty(value: unknown): boolean {
	if (value === null || value === undefined) return true;
	if (typeof value === 'string' && value.trim() === '') return true;
	if (Array.isArray(value) && value.length === 0) return true;
	return false;
}

/**
 * Required field validator.
 */
function required<T>(options?: ValidatorOptions): FieldValidator<T> {
	return (value) => {
		if (isEmpty(value)) {
			if (options?.message) return options.message;
			if (options?.field) return m.validation_required({ field: options.field });
			return m.validation_required_generic();
		}
		return undefined;
	};
}

/**
 * Minimum number validator.
 */
function min<T>(minValue: number, options?: ValidatorOptions): FieldValidator<T> {
	return (value) => {
		if (isEmpty(value)) return undefined;
		const num = typeof value === 'number' ? value : Number(value);
		if (isNaN(num) || num < minValue) {
			return (
				options?.message ??
				m.validation_min({ field: options?.field ?? '', min: String(minValue) })
			);
		}
		return undefined;
	};
}

/**
 * Maximum number validator.
 */
function max<T>(maxValue: number, options?: ValidatorOptions): FieldValidator<T> {
	return (value) => {
		if (isEmpty(value)) return undefined;
		const num = typeof value === 'number' ? value : Number(value);
		if (isNaN(num) || num > maxValue) {
			return (
				options?.message ??
				m.validation_max({ field: options?.field ?? '', max: String(maxValue) })
			);
		}
		return undefined;
	};
}

/**
 * Minimum string length validator.
 */
function minLength<T>(minLen: number, options?: ValidatorOptions): FieldValidator<T> {
	return (value) => {
		if (isEmpty(value)) return undefined;
		const str = String(value);
		if (str.length < minLen) {
			return (
				options?.message ??
				m.validation_min_length({ field: options?.field ?? '', min: String(minLen) })
			);
		}
		return undefined;
	};
}

/**
 * Maximum string length validator.
 */
function maxLength<T>(maxLen: number, options?: ValidatorOptions): FieldValidator<T> {
	return (value) => {
		if (isEmpty(value)) return undefined;
		const str = String(value);
		if (str.length > maxLen) {
			return (
				options?.message ??
				m.validation_max_length({ field: options?.field ?? '', max: String(maxLen) })
			);
		}
		return undefined;
	};
}

/**
 * Email format validator.
 */
function email<T>(options?: ValidatorOptions): FieldValidator<T> {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return (value) => {
		if (isEmpty(value)) return undefined;
		const str = String(value);
		if (!emailRegex.test(str)) {
			return options?.message ?? m.validation_email();
		}
		return undefined;
	};
}

/**
 * Regex pattern validator.
 */
function pattern<T>(regex: RegExp, options?: ValidatorOptions): FieldValidator<T> {
	return (value) => {
		if (isEmpty(value)) return undefined;
		const str = String(value);
		if (!regex.test(str)) {
			return options?.message ?? m.validation_pattern();
		}
		return undefined;
	};
}

/**
 * Custom validator with user-provided function.
 */
function custom<T>(
	fn: (value: T[keyof T], values: T) => boolean,
	options: ValidatorOptions & { message: string }
): FieldValidator<T> {
	return (value, values) => {
		if (!fn(value, values)) {
			return options.message;
		}
		return undefined;
	};
}

/**
 * Schema builder result with refine capability.
 */
type SchemaBuilder<T extends Record<string, unknown>> = {
	/**
	 * Add cross-field validation.
	 */
	refine: (fn: RefineFn<T>) => SchemaBuilder<T>;
	/**
	 * Build the final validation function.
	 */
	build: () => (values: T) => Partial<Record<keyof T, string>>;
};

/**
 * Create a validation schema.
 *
 * @example
 * ```ts
 * import { v } from '$components/core/form/validation';
 *
 * const validate = v.schema<MyForm>({
 *   name: [v.required()],
 *   email: [v.required(), v.email()],
 *   quantity: [v.required(), v.min(1)],
 * }).build();
 * ```
 */
function schema<T extends Record<string, unknown>>(
	definition: ValidationSchema<T>
): SchemaBuilder<T> {
	const refineFns: RefineFn<T>[] = [];

	const builder: SchemaBuilder<T> = {
		refine(fn: RefineFn<T>) {
			refineFns.push(fn);
			return builder;
		},

		build() {
			return (values: T): Partial<Record<keyof T, string>> => {
				const errors: Partial<Record<keyof T, string>> = {};

				// Run field validators
				for (const [fieldName, validators] of Object.entries(definition)) {
					const key = fieldName as keyof T;
					const fieldValidators = validators as FieldValidator<T>[];

					for (const validator of fieldValidators) {
						const error = validator(values[key], values);
						if (error) {
							errors[key] = error;
							break; // Stop at first error for this field
						}
					}
				}

				// Run refine functions for cross-field validation
				for (const refineFn of refineFns) {
					const refineErrors = refineFn(values);
					if (refineErrors) {
						Object.assign(errors, refineErrors);
					}
				}

				return errors;
			};
		}
	};

	return builder;
}

/**
 * Validation builder utilities.
 *
 * @example
 * ```ts
 * import { v } from '$components/core/form/validation';
 *
 * const validate = v.schema<OrderFormValues>({
 *   material: [v.required()],
 *   quantity: [v.required(), v.min(1)],
 *   email: [v.email()],
 * }).refine((values) => {
 *   if (values.password !== values.confirmPassword) {
 *     return { confirmPassword: 'Passwords must match' };
 *   }
 * }).build();
 * ```
 */
export const v = {
	schema,
	required,
	min,
	max,
	minLength,
	maxLength,
	email,
	pattern,
	custom
};
