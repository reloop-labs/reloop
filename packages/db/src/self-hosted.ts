export const SELF_HOSTED_MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

export function isSelfHosted(): boolean {
	const value = process.env.SELF_HOSTED;
	return value === "true" || value === "1";
}
