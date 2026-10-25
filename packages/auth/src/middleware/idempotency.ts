import { createHash } from "node:crypto";
import { apiError } from "@reloop/auth/middleware/api-errors";
import { extractSessionToken } from "@reloop/auth/middleware/keys";
import { extractApiKey } from "@reloop/auth/middleware/resolve/extract-api-key";
import { RedisCache } from "@reloop/cache/redis-client";
import { Elysia } from "elysia";
import { log } from "evlog";

/** Prefixed JSON store ops (RedisCache satisfies this). */
export type IdempotencyStore = {
	get<T>(key: string): Promise<T | undefined>;
	set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
	setIfAbsent(
		key: string,
		value: unknown,
		ttlSeconds: number,
	): Promise<boolean>;
	delete(key: string): Promise<void>;
};

export type IdempotencyOptions = {
	redisUrl?: string;
	/** Test override. */
	store?: IdempotencyStore;
	/** Path suffixes that handle idempotency themselves or must never replay. */
	excludePathSuffixes?: string[];
};

export const IDEMPOTENCY_KEY_HEADER = "idempotency-key";
export const IDEMPOTENT_REPLAYED_HEADER = "idempotent-replayed";
export const IDEMPOTENCY_KEY_MAX_LENGTH = 255;
/** How long a completed response can be replayed. */
export const IDEMPOTENCY_TTL_SECONDS = 24 * 60 * 60;
/** How long an in-flight request holds its key before a retry may take over. */
const IN_FLIGHT_TTL_SECONDS = 120;
const DOCS_LINK = "https://reloop.sh/docs/api/idempotency";

type PendingRecord = { state: "pending"; fingerprint: string };
type DoneRecord = {
	state: "done";
	fingerprint: string;
	status: number;
	body: unknown;
};
type IdempotencyRecord = PendingRecord | DoneRecord;

type Claim = { key: string; fingerprint: string; store: IdempotencyStore };

const sha256 = (value: string) =>
	createHash("sha256").update(value).digest("hex");

/** JSON with sorted object keys so `{a,b}` and `{b,a}` fingerprint the same. */
function stableStringify(value: unknown): string {
	if (value === null || typeof value !== "object") {
		return JSON.stringify(value ?? null);
	}
	if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
	const obj = value as Record<string, unknown>;
	return `{${Object.keys(obj)
		.sort()
		.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`)
		.join(",")}}`;
}

function pathnameOf(request: Request): string {
	try {
		return new URL(request.url).pathname.replace(/\/+$/, "") || "/";
	} catch {
		return request.url;
	}
}

/** Status and payload of a handler result, whether plain or `status(...)`. */
function unwrap(value: unknown, fallbackStatus: number) {
	if (
		value &&
		typeof value === "object" &&
		"code" in value &&
		"response" in value &&
		typeof (value as { code: unknown }).code === "number"
	) {
		const custom = value as { code: number; response: unknown };
		return { status: custom.code, body: custom.response };
	}
	return { status: fallbackStatus, body: value };
}

/**
 * Early responses are raw `Response`s so Elysia does not validate them
 * against the route's own response schemas (a route's strict 409 schema
 * would otherwise turn ours into a 422 validation error). Elysia merges
 * `set.headers` (rate limit etc.) into them.
 */
function reply(
	status: number,
	body: unknown,
	extra: Record<string, string> = {},
): Response {
	const headers = new Headers(extra);
	headers.set("content-type", "application/json");
	return new Response(JSON.stringify(body ?? null), { status, headers });
}

const error = (
	status: number,
	code: string,
	message: string,
	why: string,
	fix: string,
) => apiError(status, { code, message, why, fix, link: DOCS_LINK });

/**
 * Stripe-style `Idempotency-Key` support for every POST on the service.
 *
 * The first successful (2xx) response for a key is stored for 24 hours and
 * replayed with `Idempotent-Replayed: true`. A retry while the first request
 * is still running gets 409; reusing a key with a different body or endpoint
 * gets 422. Failed requests release the key so a corrected retry can proceed.
 * Keys are scoped per API key (or dashboard session). Requests without the header,
 * unauthenticated requests and non-JSON bodies are unaffected. Fails open
 * when Redis is down. Apply once on the root app, before routes.
 */
export function idempotencyPlugin(opts: IdempotencyOptions = {}) {
	const store: IdempotencyStore =
		opts.store ??
		new RedisCache("idem", IDEMPOTENCY_TTL_SECONDS, opts.redisUrl);
	const exclude = opts.excludePathSuffixes ?? [];
	const claims = new WeakMap<Request, Claim>();

	const release = (request: Request) => {
		const claim = claims.get(request);
		if (!claim) return;
		claims.delete(request);
		return claim.store.delete(claim.key);
	};

	return (
		new Elysia({ name: "reloop-idempotency" })
			.onBeforeHandle(async ({ request, body }) => {
				if (request.method !== "POST") return;
				const rawKey = request.headers.get(IDEMPOTENCY_KEY_HEADER)?.trim();
				if (!rawKey) return;

				const path = pathnameOf(request);
				if (exclude.some((suffix) => path.endsWith(suffix))) return;

				if (rawKey.length > IDEMPOTENCY_KEY_MAX_LENGTH) {
					return reply(
						400,
						error(
							400,
							"invalid_idempotency_key",
							"Invalid Idempotency-Key",
							`Idempotency-Key must be at most ${IDEMPOTENCY_KEY_MAX_LENGTH} characters.`,
							"Send a shorter unique key, such as a UUID.",
						),
					);
				}

				// Only JSON bodies can be fingerprinted reliably; binary and
				// multipart uploads would all hash alike and replay each other.
				const contentType = request.headers.get("content-type") ?? "";
				if (body !== undefined && !contentType.includes("json")) return;

				// Scoped per credential: this hook can run before the route's auth
				// resolve, so the organization is not known yet.
				const apiKey = extractApiKey(request.headers);
				const session = extractSessionToken(request.headers.get("cookie"));
				const principal = apiKey
					? `key:${sha256(apiKey).slice(0, 32)}`
					: session
						? `session:${sha256(session).slice(0, 32)}`
						: null;
				if (!principal) return;

				const key = `${principal}:${sha256(rawKey)}`;
				const fingerprint = sha256(`POST ${path}\n${stableStringify(body)}`);

				let record: IdempotencyRecord | undefined;
				let acquired = false;
				try {
					record = await store.get<IdempotencyRecord>(key);
					if (!record) {
						acquired = await store.setIfAbsent(
							key,
							{ state: "pending", fingerprint } satisfies PendingRecord,
							IN_FLIGHT_TTL_SECONDS,
						);
						if (!acquired) record = await store.get<IdempotencyRecord>(key);
					}
				} catch (err) {
					log.error({
						error: err instanceof Error ? err.message : String(err),
						message: "Idempotency store error — failing open",
					});
					return;
				}

				if (acquired) {
					claims.set(request, { key, fingerprint, store });
					return;
				}

				if (record && record.fingerprint !== fingerprint) {
					return reply(
						422,
						error(
							422,
							"idempotency_key_reused",
							"Idempotency-Key reused with a different request",
							"This key was already used for a request with a different body or endpoint.",
							"Use a new Idempotency-Key for each distinct request; reuse a key only to retry the exact same request.",
						),
					);
				}

				if (record?.state === "done") {
					return reply(record.status, record.body, {
						[IDEMPOTENT_REPLAYED_HEADER]: "true",
					});
				}

				return reply(
					409,
					error(
						409,
						"idempotency_in_progress",
						"Request with this Idempotency-Key is still in progress",
						"An earlier request with the same key has not finished yet.",
						"Wait a moment and retry with the same key to get its result.",
					),
					{ "retry-after": "1" },
				);
			})
			.onAfterHandle(async ({ request, set, responseValue }) => {
				const claim = claims.get(request);
				if (!claim) return;
				claims.delete(request);

				const fallback = typeof set.status === "number" ? set.status : 200;
				const { status, body } = unwrap(responseValue, fallback);
				const replayable =
					status >= 200 &&
					status < 300 &&
					!(body instanceof Response) &&
					!(body instanceof Blob) &&
					!(body instanceof ReadableStream);

				if (!replayable) {
					await claim.store.delete(claim.key);
					return;
				}
				await claim.store.set(
					claim.key,
					{
						state: "done",
						fingerprint: claim.fingerprint,
						status,
						body,
					} satisfies DoneRecord,
					IDEMPOTENCY_TTL_SECONDS,
				);
			})
			.onError(async ({ request }) => {
				await release(request);
			})
			// Safety net for paths that end before afterHandle (e.g. auth 401).
			.onAfterResponse(async ({ request }) => {
				await release(request);
			})
			.as("global")
	);
}
