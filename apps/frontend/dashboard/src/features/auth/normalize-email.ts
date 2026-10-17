/**
 * Better Auth stores and matches emails in lowercase, so keep what the user
 * sees (the field, the OTP screen, the `otpSent` param) in the same form.
 */
export function normalizeEmail(value: string): string {
	return value.trim().toLowerCase();
}
