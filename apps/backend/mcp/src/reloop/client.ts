import { isOAuthBearer } from "../auth/api-key";
import {
	type ErrorCodeMap,
	malformedResponseError,
	networkError,
	reloopErrorFromResponse,
	timeoutError,
} from "../errors/reloop-error";
import type { Logger } from "../observability/log";
import { USER_AGENT } from "../version";

export type FetchLike = (url: string, init: RequestInit) => Promise<Response>;

export type QueryValue = string | number | boolean | undefined;

export type ReloopRequest = {
	method: "GET" | "POST" | "PATCH" | "DELETE";
	path: string;
	query?: Record<string, QueryValue>;
	body?: unknown;
	codes?: ErrorCodeMap;
	idempotent: boolean;
};

export type ReloopClientOptions = {
	baseUrl: string;
	apiKey: string;
	fetch?: FetchLike;
	timeoutMs?: number;
	logger?: Logger;
};

const DEFAULT_TIMEOUT_MS = 30000;
const NO_CONTENT = 204;
export const MAX_RESPONSE_BODY_BYTES = 16 * 1024 * 1024;

class ResponseTooLargeError extends Error {
	constructor(readonly status: number) {
		super("response body exceeds the size limit");
	}
}

async function readBodyWithin(
	response: Response,
	limit: number,
): Promise<string> {
	const declared = Number(response.headers.get("content-length") ?? "0");
	if (declared > limit || response.body === null) {
		if (declared > limit) {
			throw new ResponseTooLargeError(response.status);
		}
		return "";
	}
	const reader = response.body.getReader();
	const chunks: Uint8Array[] = [];
	let total = 0;
	for (;;) {
		const { done, value } = await reader.read();
		if (done) {
			break;
		}
		total += value.byteLength;
		if (total > limit) {
			await reader.cancel();
			throw new ResponseTooLargeError(response.status);
		}
		chunks.push(value);
	}
	return new TextDecoder().decode(concat(chunks, total));
}

function concat(chunks: Uint8Array[], total: number): Uint8Array {
	const joined = new Uint8Array(total);
	let offset = 0;
	for (const chunk of chunks) {
		joined.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return joined;
}

export class ReloopClient {
	readonly baseUrl: string;
	readonly #apiKey: string;
	readonly #fetch: FetchLike;
	readonly #timeoutMs: number;
	readonly #logger: Logger | undefined;

	constructor(options: ReloopClientOptions) {
		this.baseUrl = options.baseUrl;
		this.#apiKey = options.apiKey;
		this.#fetch = options.fetch ?? globalThis.fetch;
		this.#timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
		this.#logger = options.logger;
	}

	async request<T>(spec: ReloopRequest): Promise<T> {
		const controller = new AbortController();
		let timedOut = false;
		const timer = setTimeout(() => {
			timedOut = true;
			controller.abort();
		}, this.#timeoutMs);
		const startedAt = Date.now();

		let response: Response;
		let text: string;
		try {
			response = await this.#fetch(this.#buildUrl(spec.path, spec.query), {
				method: spec.method,
				headers: this.#buildHeaders(spec.body !== undefined),
				body: spec.body === undefined ? undefined : JSON.stringify(spec.body),
				signal: controller.signal,
			});
			text =
				response.status === NO_CONTENT
					? ""
					: await readBodyWithin(response, MAX_RESPONSE_BODY_BYTES);
		} catch (cause) {
			if (cause instanceof ResponseTooLargeError) {
				throw malformedResponseError(cause.status);
			}
			if (timedOut) {
				throw timeoutError(this.baseUrl, this.#timeoutMs, spec.idempotent);
			}
			throw networkError(this.baseUrl, this.#scrub(cause), spec.idempotent);
		} finally {
			clearTimeout(timer);
		}

		this.#logger?.debug("reloop request", {
			method: spec.method,
			path: spec.path,
			status: response.status,
			durationMs: Date.now() - startedAt,
		});

		if (response.status === NO_CONTENT) {
			return undefined as T;
		}

		let body: unknown = {};
		if (text.length > 0) {
			try {
				body = JSON.parse(text);
			} catch {
				if (response.ok) {
					throw malformedResponseError(response.status);
				}
				body = {};
			}
		}

		if (!response.ok) {
			throw reloopErrorFromResponse({
				status: response.status,
				body,
				headers: response.headers,
				codes: spec.codes,
				idempotent: spec.idempotent,
			});
		}

		return body as T;
	}

	#scrub(cause: unknown): string {
		const message = cause instanceof Error ? cause.message : String(cause);
		return message.split(this.#apiKey).join("[redacted]");
	}

	#buildHeaders(hasBody: boolean): Record<string, string> {
		const headers: Record<string, string> = {
			accept: "application/json",
			"user-agent": USER_AGENT,
		};
		if (isOAuthBearer(this.#apiKey)) {
			headers["authorization"] = `Bearer ${this.#apiKey}`;
		} else {
			headers["x-api-key"] = this.#apiKey;
		}
		if (hasBody) {
			headers["content-type"] = "application/json";
		}
		return headers;
	}

	#buildUrl(
		path: string,
		query: Record<string, QueryValue> | undefined,
	): string {
		const url = `${this.baseUrl}${path}`;
		if (query === undefined) {
			return url;
		}
		const params = new URLSearchParams();
		for (const [key, value] of Object.entries(query)) {
			if (value !== undefined) {
				params.set(key, String(value));
			}
		}
		const search = params.toString();
		return search.length > 0 ? `${url}?${search}` : url;
	}
}
