export const DEFAULT_APP_NAME = "Reloop";

export function resolveAppName(value: string | undefined): string {
	return value?.trim() || DEFAULT_APP_NAME;
}

export const appName = resolveAppName(process.env.APP_NAME);
