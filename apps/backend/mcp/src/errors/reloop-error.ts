import { redact } from "../observability/log";

export type ReloopErrorField = { field: string; message: string };

export type ReloopErrorJson = {
	code: string;
	message: string;
	status?: number;
	why?: string;
	fix?: string;
	link?: string;
	retryable: boolean;
	retryAfterSeconds?: number;
	fields?: ReloopErrorField[];
};

export type ErrorCodeMap = Partial<Record<number, string>>;

export class ReloopError extends Error {
	readonly code: string;
	readonly status?: number;
	readonly why?: string;
	readonly fix?: string;
	readonly link?: string;
	readonly retryable: boolean;
	readonly retryAfterSeconds?: number;
	readonly fields?: ReloopErrorField[];

	constructor(options: Omit<ReloopErrorJson, "message"> & { message: string }) {
		super(options.message);
		this.name = "ReloopError";
		this.code = options.code;
		this.status = options.status;
		this.why = options.why;
		this.fix = options.fix;
		this.link = options.link;
		this.retryable = options.retryable;
		this.retryAfterSeconds = options.retryAfterSeconds;
		this.fields = options.fields;
	}

	toJSON(): ReloopErrorJson {
		const json: ReloopErrorJson = {
			code: this.code,
			message: this.message,
			retryable: this.retryable,
		};
		if (this.status !== undefined) {
			json.status = this.status;
		}
		if (this.why !== undefined) {
			json.why = this.why;
		}
		if (this.fix !== undefined) {
			json.fix = this.fix;
		}
		if (this.link !== undefined) {
			json.link = this.link;
		}
		if (this.retryAfterSeconds !== undefined) {
			json.retryAfterSeconds = this.retryAfterSeconds;
		}
		if (this.fields !== undefined) {
			json.fields = this.fields;
		}
		return json;
	}
}

const DEFAULT_CODES: ErrorCodeMap = {
	400: "validation_error",
	401: "unauthorized",
	402: "quota_exceeded",
	403: "forbidden",
	404: "not_found",
	409: "conflict",
	422: "validation_error",
	429: "rate_limited",
};

function readProperty(source: unknown, key: string): unknown {
	if (typeof source !== "object" || source === null) {
		return undefined;
	}
	const value: unknown = Reflect.get(source, key);
	return value;
}

function readString(source: unknown, key: string): string | undefined {
	const value = readProperty(source, key);
	return typeof value === "string" && value.length > 0 ? value : undefined;
}

function readHttpUrl(source: unknown, key: string): string | undefined {
	const value = readString(source, key);
	return value !== undefined && /^https?:\/\//i.test(value) ? value : undefined;
}

function readNumber(source: unknown, key: string): number | undefined {
	const value = readProperty(source, key);
	return typeof value === "number" && Number.isFinite(value)
		? value
		: undefined;
}

function readErrorFields(body: unknown): ReloopErrorField[] | undefined {
	const value = readProperty(body, "errors");
	if (!Array.isArray(value)) {
		return undefined;
	}
	const entries: unknown[] = value;
	const fields: ReloopErrorField[] = [];
	for (const entry of entries) {
		const field = readString(entry, "field");
		const message = readString(entry, "message");
		if (field !== undefined && message !== undefined) {
			fields.push({ field, message });
		}
	}
	return fields.length > 0 ? fields : undefined;
}

function readRetryAfterHeader(headers: Headers): number | undefined {
	const raw = headers.get("retry-after")?.trim();
	if (raw === undefined || raw.length === 0) {
		return undefined;
	}
	const value = Number(raw);
	return Number.isFinite(value) ? value : undefined;
}

function resolveCode(status: number, codes: ErrorCodeMap | undefined): string {
	const override = codes?.[status];
	if (override !== undefined) {
		return override;
	}
	const fallback = DEFAULT_CODES[status];
	if (fallback !== undefined) {
		return fallback;
	}
	return status >= 500 ? "upstream_error" : "api_error";
}

function fallbackFix(status: number, idempotent: boolean): string | undefined {
	if (status === 401 || status === 403) {
		return "Check that the Reloop API key is valid, enabled, and belongs to the organization you expect.";
	}
	if (status === 429) {
		return "Wait retryAfterSeconds seconds (or a minute) and retry.";
	}
	if (status >= 500 && !idempotent) {
		return "Reloop failed while processing a write. Verify the current state with a read tool before repeating it.";
	}
	if (status >= 500) {
		return "Retry shortly. If it persists, check the Reloop instance status.";
	}
	return undefined;
}

function isRetryable(status: number, idempotent: boolean): boolean {
	if (status === 429) {
		return true;
	}
	return status >= 500 ? idempotent : false;
}

export function reloopErrorFromResponse(options: {
	status: number;
	body: unknown;
	headers: Headers;
	codes?: ErrorCodeMap;
	idempotent: boolean;
}): ReloopError {
	const { status, body, headers, codes, idempotent } = options;
	return new ReloopError({
		code: resolveCode(status, codes),
		message:
			readString(body, "message") ?? `Reloop API returned HTTP ${status}.`,
		status,
		why: readString(body, "why"),
		fix: readString(body, "fix") ?? fallbackFix(status, idempotent),
		link: readHttpUrl(body, "link"),
		retryable: isRetryable(status, idempotent),
		retryAfterSeconds:
			readRetryAfterHeader(headers) ?? readNumber(body, "retryAfter"),
		fields: readErrorFields(body),
	});
}

function describeCause(cause: unknown): string {
	return redact(cause instanceof Error ? cause.message : String(cause));
}

export function networkError(
	baseUrl: string,
	cause: unknown,
	idempotent: boolean,
): ReloopError {
	return new ReloopError({
		code: "network_error",
		message: `Could not reach Reloop at ${baseUrl}.`,
		why: describeCause(cause),
		fix: idempotent
			? "Check RELOOP_BASE_URL and that the Reloop instance is reachable, then retry."
			: "The request may not have reached Reloop. Verify the resource state with a read tool before repeating the write.",
		retryable: idempotent,
	});
}

export function timeoutError(
	baseUrl: string,
	timeoutMs: number,
	idempotent: boolean,
): ReloopError {
	return new ReloopError({
		code: "timeout",
		message: `Reloop at ${baseUrl} did not respond within ${timeoutMs}ms.`,
		fix: idempotent
			? "Retry, or raise RELOOP_TIMEOUT_MS if the instance is slow."
			: "The request may have reached Reloop. Check the result (for example with a read tool or the Reloop dashboard) before repeating the write.",
		retryable: idempotent,
	});
}

export function malformedResponseError(status: number): ReloopError {
	return new ReloopError({
		code: "malformed_response",
		message: `Reloop returned a response that is not JSON (HTTP ${status}).`,
		status,
		fix: "Verify RELOOP_BASE_URL points at a Reloop instance and not at a proxy, login page, or the dashboard.",
		retryable: false,
	});
}

export function toReloopError(value: unknown): ReloopError {
	if (value instanceof ReloopError) {
		return value;
	}
	return new ReloopError({
		code: "internal_error",
		message: describeCause(value),
		retryable: false,
	});
}
