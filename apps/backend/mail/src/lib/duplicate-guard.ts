/**
 * duplicate-guard.ts
 *
 * Burst protection for the "same sender → same recipient + same content,
 * twice in a row" spam pattern.
 *
 * Two layers, both Redis-backed and fail-open (a cache outage must never
 * block legitimate mail — mirrors rate-limiter.ts):
 *
 *  1. Exact fingerprint: sha256(org + from + normalized recipients +
 *     subject + content hash). Content covers html/text, template id +
 *     variables, attachments, thread and schedule, so personalised or
 *     re-attached sends are never "identical". Second identical send within
 *     10 min → 429. Skipped when the caller supplies an Idempotency-Key
 *     (they own dedup), and released if the send fails before KumoMTA
 *     accepts it, so a retry after a failure is never blocked.
 *  2. Recipient velocity: >3 sends to the same bare address from the same
 *     org within 60s → 429, even if content is slightly mutated.
 *
 * Called from sendEmailController BEFORE credits reservation / log creation
 * so duplicate spam never burns quota or touches KumoMTA.
 */

import { createHash } from "node:crypto";
import { createError } from "evlog";

export const DUPLICATE_FINGERPRINT_TTL_SECONDS = 600;
export const RECIPIENT_VELOCITY_WINDOW_SECONDS = 60;
export const RECIPIENT_VELOCITY_MAX = 3;

export interface DuplicateGuardRedis {
	increment(rawKey: string): Promise<number>;
	expire(rawKey: string, seconds: number): Promise<number>;
}

function bareEmail(raw: string): string {
	const angled = raw.match(/<([^<>]+@[^<>]+)>/);
	if (angled?.[1]) return angled[1].trim().toLowerCase();
	const plain = raw.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
	return (plain?.[0] ?? raw).trim().toLowerCase();
}

function toList(value: string | string[] | undefined): string[] {
	if (!value) return [];
	return (Array.isArray(value) ? value : [value])
		.map((s) => bareEmail(s))
		.filter(Boolean)
		.sort();
}

function sha256(input: string): string {
	return createHash("sha256").update(input, "utf8").digest("hex");
}

/** JSON with sorted object keys so `{a,b}` and `{b,a}` hash the same. */
function stableStringify(value: unknown): string {
	if (value === null || typeof value !== "object") {
		return JSON.stringify(value ?? null);
	}
	if (Array.isArray(value)) {
		return `[${value.map(stableStringify).join(",")}]`;
	}
	const obj = value as Record<string, unknown>;
	return `{${Object.keys(obj)
		.sort()
		.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`)
		.join(",")}}`;
}

type FingerprintAttachment = {
	filename?: string;
	path?: string;
	content?: unknown;
	content_id?: string;
};

export interface DuplicateFingerprintInput {
	organizationId: string;
	from: string;
	to?: string | string[];
	cc?: string | string[];
	bcc?: string | string[];
	subject: string;
	html?: string;
	text?: string;
	template?: { id: string; variables?: Record<string, unknown> };
	attachments?: FingerprintAttachment[];
	threadId?: string;
	scheduledAt?: string;
}

/** Deterministic fingerprint for an outbound send. Exported for tests. */
export function buildDuplicateFingerprint({
	organizationId,
	from,
	to,
	cc,
	bcc,
	subject,
	html,
	text,
	template,
	attachments,
	threadId,
	scheduledAt,
}: DuplicateFingerprintInput): string {
	const recipients = [...toList(to), ...toList(cc), ...toList(bcc)].join(",");
	const attachmentKey = (attachments ?? []).map((a) => ({
		filename: a.filename ?? "",
		path: a.path ?? "",
		content:
			a.content == null
				? ""
				: sha256(
						typeof a.content === "string"
							? a.content
							: stableStringify(a.content),
					),
		cid: a.content_id ?? "",
	}));
	const bodyHash = sha256(
		[
			html ?? "",
			text ?? "",
			stableStringify(template ?? null),
			stableStringify(attachmentKey),
			threadId ?? "",
			scheduledAt ?? "",
		].join("\n"),
	);
	return sha256(
		[
			organizationId,
			bareEmail(from),
			recipients,
			subject.trim(),
			bodyHash,
		].join("|"),
	);
}

function duplicateError(retryAfter: number) {
	return createError({
		status: 429,
		message: "Duplicate send blocked",
		why: "An identical email to the same recipient(s) was just sent. This looks like an accidental double-submit or burst spam run",
		fix: `Wait ${retryAfter} seconds and retry only if the recipient really needs a second copy. Use a unique Idempotency-Key header for safe retries`,
	});
}

function velocityError(retryAfter: number, email: string) {
	return createError({
		status: 429,
		message: "Recipient velocity limit reached",
		why: `More than ${RECIPIENT_VELOCITY_MAX} emails to ${email} within ${RECIPIENT_VELOCITY_WINDOW_SECONDS}s from this organization`,
		fix: `Wait ${retryAfter} seconds before emailing ${email} again. Batch follow-ups into a single message instead of rapid re-sends`,
	});
}

export interface DuplicateGuardHandle {
	/** Forget this send's fingerprint (call when it failed before delivery). */
	release(): Promise<void>;
}

const NOOP_HANDLE: DuplicateGuardHandle = { release: async () => {} };

export async function assertNotDuplicateBurst(
	redis: DuplicateGuardRedis,
	input: DuplicateFingerprintInput & { idempotencyKey?: string },
): Promise<DuplicateGuardHandle> {
	const { organizationId, to, idempotencyKey } = input;
	const toBare = toList(to);
	// Suppression-filtered sends can reach here with an empty To only when
	// the caller bypasses step-2b; nothing to fingerprint — skip silently.
	if (toBare.length === 0) return NOOP_HANDLE;

	let fpKey: string | null = null;
	if (!idempotencyKey) {
		try {
			fpKey = `dup:send:org:${organizationId}:fp:${buildDuplicateFingerprint(input)}`;
		} catch {
			fpKey = null; // hashing must never block mail
		}
	}

	let ownsFingerprint = false;
	const handle: DuplicateGuardHandle = {
		release: async () => {
			if (!fpKey || !ownsFingerprint) return;
			try {
				// EXPIRE with 0 deletes the key.
				await redis.expire(fpKey, 0);
			} catch {
				// Best-effort: worst case the key ages out on its own TTL.
			}
		},
	};

	try {
		if (fpKey) {
			const fpCount = await redis.increment(fpKey);
			if (fpCount === 1) {
				ownsFingerprint = true;
				await redis.expire(fpKey, DUPLICATE_FINGERPRINT_TTL_SECONDS);
			} else {
				throw duplicateError(DUPLICATE_FINGERPRINT_TTL_SECONDS);
			}
		}

		// Per-recipient velocity (To only — CC/BCC fan-out is legitimate bulk).
		for (const email of toBare) {
			const vKey = `dup:send:org:${organizationId}:rcpt:${sha256(email)}`;
			const count = await redis.increment(vKey);
			if (count === 1) {
				await redis.expire(vKey, RECIPIENT_VELOCITY_WINDOW_SECONDS);
			} else if (count > RECIPIENT_VELOCITY_MAX) {
				await handle.release();
				throw velocityError(RECIPIENT_VELOCITY_WINDOW_SECONDS, email);
			}
		}
	} catch (error) {
		// Re-throw our own 429s; swallow Redis infra failures (fail-open).
		if (error instanceof Error && "status" in error) throw error;
	}
	return handle;
}
