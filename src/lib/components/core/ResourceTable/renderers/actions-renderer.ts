import { renderComponent } from '$lib/components/ui/data-table'
import ActionsCell from './ActionsCell.svelte'
import type { CellContext } from '@tanstack/table-core'
import type { ColumnConfig, ActionsConfig, ActionHelpers } from '../types'

/**
 * Actions renderer - renders action buttons or dropdown menu
 *
 * - Single action: renders as button
 * - Multiple actions: renders as dropdown menu
 *
 * @example
 * {
 *   renderer: 'actions',
 *   rendererConfig: {
 *     actions: [
 *       {
 *         icon: Archive,
 *         variant: 'ghost',
 *         onClick: async (row, helpers) => {
 *           await archiveItem(row.id)
 *           helpers.removeRow(row.id)
 *         }
 *       }
 *     ]
 *   }
 * }
 */
export function createActionsRenderer<T>(
	config: ColumnConfig<T>,
	actionHelpers: ActionHelpers<T>
) {
	return (context: CellContext<T, unknown>) => {
		const row = context.row.original
		const actionsConfig = config.rendererConfig as ActionsConfig<T> | undefined

		if (!actionsConfig?.actions || actionsConfig.actions.length === 0) {
			return null
		}

		return renderComponent(ActionsCell, {
			row,
			actions: actionsConfig.actions,
			buttonSize: actionsConfig.buttonSize,
			dropdownAlign: actionsConfig.dropdownAlign,
			actionHelpers
		})
	}
}
