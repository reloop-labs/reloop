/**
 * Defaults applied on API Key create.
 *
 * These match the values the create controller has always inserted in production.
 * Schema column defaults (Better Auth leftovers) are not used by Reloop create.
 */
export const API_KEY_CREATE_DEFAULTS = {
	enabled: true,
	rateLimitEnabled: true,
	rateLimitTimeWindow: 1000,
	rateLimitMax: 100,
	expiresAt: null as null,
	permissions: null as null,
	metadata: null as null,
	refillInterval: null as null,
	refillAmount: null as null,
	lastRefillAt: null as null,
	lastRequest: null as null,
	requestCount: 0,
} as const;
