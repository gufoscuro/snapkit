/**
 * Take as input a list of classnames and return a string with all of them joined by a space
 * @param classnames
 * @returns {string} - A string with all classnames joined by a space
 */
export function joinClassnames(...classnames: Array<string>): string {
  return classnames.join(' ')
}
