export const DEFAULT_APP_NAME = "Reloop";

const SELF_HOSTED_PREFIX = /^self-hosted\s+reloop\s*×\s*/i;

export function resolveAppName(value: string | undefined): string {
	const name = value?.trim().replace(SELF_HOSTED_PREFIX, "").trim();
	if (!name || name.toLowerCase() === DEFAULT_APP_NAME.toLowerCase()) {
		return DEFAULT_APP_NAME;
	}
	return `Self-hosted ${DEFAULT_APP_NAME} × ${name}`;
}

export const appName = resolveAppName(process.env.APP_NAME);
