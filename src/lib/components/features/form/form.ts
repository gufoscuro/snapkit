export const FormFieldClass = Object.freeze({
  MinWidth: 'min-w-64 md:min-w-formfield',
  MaxWidth: 'max-w-full md:max-w-formfield',
  TableCell: 'h-10 w-full rounded-none border-transparent focus:border-primary',
  SelectorDefaultWidth: 'min-w-40 lg:min-w-[280px]',
  SelectorContentDefaultWidth: 'min-w-[280px]',
  SelectorTableCellWidth: 'w-full max-md:max-w-60 overflow-hidden overflow-ellipsis',
  SelectorContentTableCellWidth: 'w-56 md:w-80 lg:w-[500px]',
})

export type FormFieldMessagePosition = 'top' | 'bottom' | 'floating-top' | 'floating-bottom'

export interface FileReadData {
  file: File;
  base64String?: string;
  text?: string;
}
