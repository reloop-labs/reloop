export type LogData = {
	uuid: string;
	event: string;
	level: string;
	status_code?: number | null;
	created_at: string;
	trace_id?: string | null;
	metadata?: Record<string, unknown>;
	requestDetails?: Record<string, unknown>;
	request_body?: Record<string, unknown> | null;
};

export type LogDetail = {
	uuid: string;
	event: string;
	level: string;
	status_code?: number | null;
	trace_id: string | null;
	metadata: Record<string, unknown>;
	request_body?: Record<string, unknown> | null;
	requestDetails: {
		endpoint?: string;
		method?: string;
		userAgent?: string;
		ipAddress?: string;
		[key: string]: unknown;
	};
	created_at: string;
};

export type LevelStats = {
	debug: number;
	info: number;
	warn: number;
	error: number;
	fatal: number;
};

export type LogListResponse = {
	logs: LogData[];
	count: number;
	stats?: LevelStats;
};

export type LogsListParams = {
	page: number;
	limit: number;
	search: string;
	startDate: string;
	endDate: string;
	statusCode: string;
	outcome: string;
	actorId?: string;
};
