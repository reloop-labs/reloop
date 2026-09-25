import {
	isBillingEnabled,
	SELF_HOSTED_MAX_ATTACHMENT_BYTES,
} from "@reloop/db/billing-enabled";
import { db } from "@reloop/db/client";
import { organizationPlan } from "@reloop/db/schema";
import { eq } from "drizzle-orm";
import { MailErrors } from "./errors";

/**
 * Size gate enforced from the org's billing plan.
 *
 * Single source of truth for "how big may this send be" is
 * `organization_plan.max_attachment_bytes`, which is materialized from
 * `@reloop/pricing` planLimits (free: 1 MB, paid: 5 MB) whenever the plan
 * changes. The mail service must never use a hardcoded byte cap here —
 * that is what let 10 MB attachments through only to die with a KumoMTA
 * 413 (`Failed to buffer the request body: length limit exceeded`,
 * Kumo default `request_body_limit` = 2 MB).
 *
 * Pricing semantics: `maxAttachmentBytes` applies BOTH per file and to the
 * total decoded attachments of one send. That bounds the base64-inflated
 * inject payload (~+33% + MIME overhead) under the KumoMTA HTTP limit.
 */

// Fallback when no plan row exists yet — matches DB default + free plan.
export const FALLBACK_FREE_ATTACHMENT_BYTES = 1 * 1024 * 1024;

// Ceiling for the KumoMTA HTTP inject JSON payload. Must stay in sync with
// `request_body_limit` in apps/backend/smtp/init.lua. Sized for the largest
// paid plan: 5 MB decoded -> ~6.8 MB base64 + MIME/HTML overhead.
export const KUMO_INJECT_PAYLOAD_LIMIT_BYTES = 15 * 1024 * 1024;

export async function getOrgAttachmentLimit(
	organizationId: string,
): Promise<{ maxAttachmentBytes: number; planId: string }> {
	if (!isBillingEnabled()) {
		return {
			maxAttachmentBytes: SELF_HOSTED_MAX_ATTACHMENT_BYTES,
			planId: "self-hosted",
		};
	}
	const row = await db.query.organizationPlan.findFirst({
		where: eq(organizationPlan.organizationId, organizationId),
		columns: { maxAttachmentBytes: true, planId: true },
	});
	if (!row) {
		return {
			maxAttachmentBytes: FALLBACK_FREE_ATTACHMENT_BYTES,
			planId: "free",
		};
	}
	return {
		maxAttachmentBytes: row.maxAttachmentBytes,
		planId: row.planId,
	};
}

/** Decoded byte estimate for a not-yet-materialized request attachment. */
export function estimateAttachmentBytes(att: {
	content?: unknown;
	path?: string;
	filename?: string;
}): number | null {
	if (typeof att.content === "string") {
		const raw = att.content.trim();
		if (!raw) return 0;
		// data: URLs carry a mediatype prefix — strip it before measuring.
		const base64Part =
			raw.includes(",") && raw.startsWith("data:")
				? (raw.split(",").pop() ?? "")
				: raw;
		// Heuristic: base64 payloads are long + base64 alphabet. Plain text
		// falls back to UTF-8 length so small text attachments aren't inflated.
		const looksBase64 =
			base64Part.length >= 64 && /^[A-Za-z0-9+/=\s\r\n]+$/.test(base64Part);
		if (looksBase64) {
			const clean = base64Part.replace(/\s/g, "");
			const padding = clean.endsWith("==") ? 2 : clean.endsWith("=") ? 1 : 0;
			return Math.floor((clean.length * 3) / 4) - padding;
		}
		return Buffer.byteLength(raw, "utf8");
	}
	if (Buffer.isBuffer(att.content)) return att.content.byteLength;
	// path-based attachments are fetched from the upload service later; the
	// authoritative check happens post-materialize in kumomta-client.
	return null;
}

export type GateAttachment = {
	content?: unknown;
	path?: string;
	filename?: string;
};

/**
 * Fail fast BEFORE credits are reserved, logs created, or KumoMTA is hit.
 * Throws MailErrors.attachmentTooLarge (413) on first violation.
 */
export function assertAttachmentsWithinPlan(
	attachments: GateAttachment[] | undefined,
	maxAttachmentBytes: number,
	planId: string,
): { totalEstimated: number } {
	if (!attachments?.length) return { totalEstimated: 0 };
	let total = 0;
	for (const att of attachments) {
		const estimated = estimateAttachmentBytes(att);
		if (estimated == null) continue; // verified post-materialize
		total += estimated;
		if (estimated > maxAttachmentBytes) {
			throw MailErrors.attachmentTooLarge({
				filename: att.filename ?? "(unnamed)",
				actualBytes: estimated,
				limitBytes: maxAttachmentBytes,
				planId,
			});
		}
	}
	if (total > maxAttachmentBytes) {
		throw MailErrors.attachmentTooLarge({
			filename: "all attachments combined",
			actualBytes: total,
			limitBytes: maxAttachmentBytes,
			planId,
		});
	}
	return { totalEstimated: total };
}

/** Guard the final base64-inflated inject payload before POSTing to Kumo. */
export function assertInjectPayloadWithinLimit(payloadBytes: number): void {
	if (payloadBytes > KUMO_INJECT_PAYLOAD_LIMIT_BYTES) {
		throw MailErrors.payloadTooLarge({
			actualBytes: payloadBytes,
			limitBytes: KUMO_INJECT_PAYLOAD_LIMIT_BYTES,
		});
	}
}
