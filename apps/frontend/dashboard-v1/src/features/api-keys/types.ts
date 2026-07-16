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
};
