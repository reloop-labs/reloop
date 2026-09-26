export const SELF_HOSTED_MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

export function isBillingEnabled(): boolean {
	const value = process.env.BILLING_ENABLED;
	return value === "true" || value === "1";
}
