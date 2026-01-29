/**
 * Mock data for FormGenericMultiSelector component preview
 *
 * This file provides realistic example data for the admin panel block preview system.
 * When creating mock data, always use plausible, business-relevant values.
 */

/**
 * Mock tag type
 */
type MockTag = {
	id: string
	name: string
}

/**
 * Mock category type
 */
type MockCategory = {
	id: string
	name: string
	description: string
}

/**
 * Standard multi-selector with tags
 */
export const mockTagsSelector = {
	label: 'Product Tags',
	placeholder: 'Select tags...',
	name: 'tags',
	value: ['tag-001', 'tag-003'],
	showLabel: true,
	showErrorMessage: true,
	allowCreate: false,
	emptyText: 'No tags found',
	addItemText: 'Add tag',
	addItemInvalidText: 'Invalid tag'
}

/**
 * Categories multi-selector
 */
export const mockCategoriesSelector = {
	label: 'Product Categories',
	placeholder: 'Select categories...',
	name: 'categories',
	value: ['cat-001', 'cat-002', 'cat-005'],
	showLabel: true,
	showErrorMessage: true,
	allowCreate: false,
	emptyText: 'No categories found',
	addItemText: 'Add category',
	addItemInvalidText: 'Cannot add category'
}

/**
 * Empty multi-selector (no selection)
 */
export const mockEmptyMultiSelector = {
	label: 'Shipping Regions',
	placeholder: 'Select regions...',
	name: 'regions',
	value: [],
	showLabel: true,
	showErrorMessage: true,
	allowCreate: false,
	emptyText: 'No regions found',
	addItemText: 'Add region',
	addItemInvalidText: 'Cannot add region'
}

/**
 * Multi-selector with create allowed
 */
export const mockCreatableMultiSelector = {
	label: 'Skills',
	placeholder: 'Add skills...',
	name: 'skills',
	value: ['skill-001', 'skill-002'],
	showLabel: true,
	showErrorMessage: true,
	allowCreate: true,
	emptyText: 'No skills found',
	addItemText: 'Add new skill',
	addItemInvalidText: 'Skill name is invalid'
}

/**
 * Multi-selector with error
 */
export const mockMultiSelectorWithError = {
	label: 'Required Items',
	placeholder: 'Select items...',
	name: 'required_items',
	value: [],
	error: 'At least one item must be selected',
	showLabel: true,
	showErrorMessage: true,
	allowCreate: false,
	emptyText: 'No items found',
	addItemText: 'Add item',
	addItemInvalidText: 'Cannot add item'
}

/**
 * Multi-selector with warning
 */
export const mockMultiSelectorWithWarning = {
	label: 'Optional Features',
	placeholder: 'Select features...',
	name: 'optional_features',
	value: ['feat-001'],
	warning: 'Some features may require additional configuration',
	showLabel: true,
	showErrorMessage: true,
	allowCreate: false,
	emptyText: 'No features found',
	addItemText: 'Add feature',
	addItemInvalidText: 'Cannot add feature'
}

/**
 * Default export for simple use case
 */
export default mockTagsSelector
