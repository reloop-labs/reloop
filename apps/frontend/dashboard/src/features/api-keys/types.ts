/** One access restriction; a key with none has full access. */
export type ApiKeyScopeEntry = {
	domainId: string;
	domain: string;
	/** Exact address, or null for every address on the domain. */
	email: string | null;
};

export type ApiKeyData = {
	id: string;
	name: string | null;
	start: string | null;
	prefix: string | null;
	enabled: boolean;
	requestCount: number;
	remaining: number | null;
	expiresAt: string | null;
	createdAt: string;
	lastRequest: string | null;
	/** Empty (or missing on older responses) means full access. */
	scope?: ApiKeyScopeEntry[];
	createdBy?: {
		id: string;
		name: string | null;
		image: string | null;
		email: string | null;
	};
};

export type ApiKeyListResponse = {
	apiKeys: ApiKeyData[];
	total: number;
	page: number;
	limit: number;
};

export type CreatedByUser = {
	id: string;
	name: string | null;
	image: string | null;
	email?: string | null;
};

export type ApiKeyWithSecret = {
	id: string;
	name: string | null;
	key: string;
	scope?: ApiKeyScopeEntry[];
};

/** Full key payload from GET /api/api-key/v1/:id */
export type ApiKeyDetail = ApiKeyData & {
	organizationId?: string;
	userId?: string;
	refillInterval?: number | null;
	refillAmount?: number | null;
	lastRefillAt?: string | null;
	rateLimitEnabled?: boolean;
	rateLimitTimeWindow?: number;
	rateLimitMax?: number;
	updatedAt?: string;
	permissions?: string | null;
	metadata?: string | null;
};
