export const DEFAULT_APP_NAME = "Reloop";

export function resolveAppName(value: string | undefined): string {
	const name = value?.trim();
	if (!name || name.toLowerCase() === DEFAULT_APP_NAME.toLowerCase()) {
		return DEFAULT_APP_NAME;
	}
	return `Self-hosted ${DEFAULT_APP_NAME} × ${name}`;
}

export const appName = resolveAppName(process.env.APP_NAME);
