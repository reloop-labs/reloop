/** Matches apps/backend/auth DEFAULT_OTP when set (local .env.dev). */
export const DEFAULT_OTP = process.env.E2E_DEFAULT_OTP ?? "888888";

/** Clearly wrong OTP for negative tests (still 6 digits). */
export const INVALID_OTP = "000000";

/**
 * Unique email per test so signup/login lands on /onboarding (no existing org).
 */
export function uniqueTestEmail(prefix = "e2e") {
	const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
	return `${prefix}+${stamp}@reloop.test`;
}
