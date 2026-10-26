/**
 * batch.ts
 *
 * Pure helpers for POST /v1/send/batch. The batch endpoint fans each email
 * out through the normal single-send pipeline (no contacts are created or
 * stored), so these only cover what is batch-specific: per-item idempotency
 * keys, bounded concurrency and per-item error serialization.
 */

export const BATCH_MAX_EMAILS = 100;
/** Parallel sends per batch request. Keeps KumoMTA/DB pressure bounded. */
export const BATCH_SEND_CONCURRENCY = 5;

export type BatchValidationMode = "strict" | "permissive";

/** `x-batch-validation` header → mode. Anything unknown falls back to strict. */
export function parseBatchValidationMode(
	value: string | null | undefined,
): BatchValidationMode {
	return value?.trim().toLowerCase() === "permissive" ? "permissive" : "strict";
}

/** Matches the single-send cap so derived keys fit the same column. */
const IDEMPOTENCY_KEY_MAX = 500;

/**
 * Per-email idempotency key. A batch-level Idempotency-Key header becomes
 * `<key>:<index>` so a retried batch replays each email individually through
 * the DB-backed single-send idempotency. Without a header, the email's own
 * `idempotency_key` is used.
 */
export function deriveBatchItemIdempotencyKey({
	headerKey,
	itemKey,
	index,
}: {
	headerKey?: string | null;
	itemKey?: string;
	index: number;
}): string | undefined {
	const header = headerKey?.trim();
	if (header) {
		const suffix = `:${index}`;
		return `${header.slice(0, IDEMPOTENCY_KEY_MAX - suffix.length)}${suffix}`;
	}
	const own = itemKey?.trim();
	return own ? own.slice(0, IDEMPOTENCY_KEY_MAX) : undefined;
}

export interface BatchItemError {
	index: number;
	message: string;
	why?: string;
	fix?: string;
	status?: number;
}

/** Turn any thrown error into the per-item `errors[]` shape. */
export function toBatchItemError(
	index: number,
	error: unknown,
): BatchItemError {
	const e = error as
		| (Error & { status?: unknown; why?: string; fix?: string })
		| undefined;
	// Only structured (status-carrying) errors are client-facing; anything
	// else is internal (DB, network) and must not leak its message.
	if (!(e instanceof Error) || typeof e.status !== "number") {
		return {
			index,
			message: "Email could not be sent",
			why: "An internal error occurred while sending this email",
			fix: "Retry this email. If it keeps failing, contact support",
			status: 500,
		};
	}
	return {
		index,
		message: e.message || "Email could not be sent",
		...(e.why ? { why: e.why } : {}),
		...(e.fix ? { fix: e.fix } : {}),
		status: e.status,
	};
}

/**
 * Run `fn` over `items` with at most `limit` in flight. Results keep input
 * order; a rejection is captured per item rather than aborting the rest.
 */
export async function mapWithConcurrency<T, R>(
	items: readonly T[],
	limit: number,
	fn: (item: T, index: number) => Promise<R>,
): Promise<PromiseSettledResult<R>[]> {
	const results: PromiseSettledResult<R>[] = new Array(items.length);
	let next = 0;
	const worker = async (): Promise<void> => {
		while (next < items.length) {
			const index = next++;
			try {
				results[index] = {
					status: "fulfilled",
					value: await fn(items[index] as T, index),
				};
			} catch (reason) {
				results[index] = { status: "rejected", reason };
			}
		}
	};
	const workers = Array.from(
		{ length: Math.max(1, Math.min(limit, items.length)) },
		worker,
	);
	await Promise.all(workers);
	return results;
}
