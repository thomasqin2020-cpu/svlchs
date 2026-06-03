/**
 * Shared, conservative email format check for server-side validation.
 *
 * `email.includes('@')` (the previous check) accepts junk like `a@`, `@b`, and
 * `a@b` — those become DB rows and undeliverable ack-email targets. The client
 * `type="email"` attribute is trivially bypassed (curl, the JSON API path, or
 * JS disabled), so the server must validate too. This is intentionally simple
 * (one `@`, a dot in the domain) — full RFC 5322 is neither necessary nor wise.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
