export function resolveInternalBaseUrl(
	baseUrl: string,
	internalBaseUrl?: string,
	env: string | undefined = process.env.AUTH_INTERNAL_BASE_URL,
): string {
	return internalBaseUrl?.trim() || env?.trim() || baseUrl;
}
