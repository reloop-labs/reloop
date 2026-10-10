const API_KEY_CHARSET = /^[A-Za-z0-9_-]+$/;
const BEARER_SCHEME = /^bearer\s+(.+)$/i;
const MIN_LENGTH = 24;
const MAX_LENGTH = 128;
const MASK_PREFIX_LENGTH = 12;

export function isPlausibleApiKey(value: string): boolean {
	return (
		value.length >= MIN_LENGTH &&
		value.length <= MAX_LENGTH &&
		API_KEY_CHARSET.test(value) &&
		value.includes("_")
	);
}

export function maskApiKey(key: string): string {
	if (key.length <= MASK_PREFIX_LENGTH) {
		return "*".repeat(key.length);
	}
	return `${key.slice(0, MASK_PREFIX_LENGTH)}…`;
}

const JWT_PART = /^[A-Za-z0-9_-]+$/;

export function isOAuthBearer(value: string): boolean {
	const parts = value.split(".");
	return (
		parts.length === 3 &&
		parts.every((part) => part.length > 0 && JWT_PART.test(part))
	);
}

export function extractRequestApiKey(request: Request): string | undefined {
	const authorization = request.headers.get("authorization");
	if (authorization !== null) {
		const token = BEARER_SCHEME.exec(authorization.trim())?.[1]?.trim();
		if (token !== undefined && token.length > 0) {
			return token;
		}
	}
	const apiKeyHeader = request.headers.get("x-api-key")?.trim();
	return apiKeyHeader !== undefined && apiKeyHeader.length > 0
		? apiKeyHeader
		: undefined;
}
