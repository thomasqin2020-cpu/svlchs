/**
 * CSV serialization helpers that are safe for admin exports.
 *
 * Two concerns, both handled here so every export route is consistent:
 *
 *  1. Formula / CSV injection. Export cells come from public, unauthenticated
 *     forms and donor-controlled Stripe metadata. A value beginning with
 *     `=`, `+`, `-`, `@`, a tab, or a carriage return is interpreted by Excel /
 *     Google Sheets as a formula when the admin opens the file (e.g.
 *     `=HYPERLINK(...)` or a DDE payload). Prefixing such a value with a single
 *     quote forces the spreadsheet to treat it as text.
 *
 *  2. Quote escaping. Embedded double-quotes must be doubled, otherwise a value
 *     like `O"Brien` breaks the row and shifts every subsequent column.
 */
export function csvCell(value: unknown): string {
  let s = value == null ? '' : String(value)
  // Neutralize leading formula triggers (the leading-char set per OWASP).
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return `"${s.replaceAll('"', '""')}"`
}

/** Join a list of values into one safe CSV row. */
export function csvRow(cells: unknown[]): string {
  return cells.map(csvCell).join(',')
}
