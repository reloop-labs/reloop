/**
 * step-2b-check-suppressions.ts
 *
 * GAP 8 — Global suppression list enforcement on transactional API sends.
 *
 * Campaigns already filter suppressed contacts via resolve-audience.ts.
 * This step closes the same gap for the direct /send endpoint.
 *
 * Suppression is checked PLATFORM-WIDE, not just within the sending org.
 * If victim@example.com hard-bounced or filed a spam complaint in any org,
 * delivering to them from a different org still harms the shared sending
 * IP reputation. A single platform-global lookup is cleaner and safer.
 *
 * Behaviour:
 *  - Normalises all recipient addresses (To + CC + BCC) to bare emails.
 *  - Looks up each one across ALL orgs in the contact table.
 *  - Contacts with status = "blocked" OR a non-null suppressionReason
 *    (hard_bounce | spam_complaint | mailbox_full) are filtered out.
 *  - Org override: if the sending org removed its own suppression for an
 *    address (contact.unsuppressedAt), other orgs' suppressions recorded
 *    before that removal are ignored for this org. Newer ones still apply.
 *  - If EVERY recipient is suppressed → throws 400.
 *  - If SOME recipients are suppressed → skips those, logs a warning,
 *    continues with remaining recipients.
 */

import type { MailModel } from "@reloop/be-mail/model/mail.model";
import { db } from "@reloop/db/client";
import { apikey, contact } from "@reloop/db/schema";
import { and, eq, inArray, isNotNull, or } from "drizzle-orm";
import { createError, log } from "evlog";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Strip RFC 5322 display name: `"Name <email>"` → `"email"` */
function normalizeBareEmail(raw: string): string {
	const angled = raw.match(/<([^<>]+@[^<>]+)>/);
	if (angled?.[1]) return angled[1].trim().toLowerCase();
	const plain = raw.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
	return (plain?.[0] ?? raw).trim().toLowerCase();
}

function toArray(value: string | string[] | undefined): string[] {
	if (!value) return [];
	return Array.isArray(value) ? value : [value];
}

type SuppressionReason = "hard_bounce" | "spam_complaint" | "mailbox_full";

async function resolveContactOwner(
	userId: string | undefined,
	apiKeyId: string | undefined,
): Promise<string | null> {
	// Internal cron/flush sends use a synthetic "system" principal
	if (userId && userId !== "system") return userId;
	if (!apiKeyId) return null;
	const [key] = await db
		.select({ userId: apikey.userId })
		.from(apikey)
		.where(eq(apikey.id, apiKeyId))
		.limit(1);
	return key?.userId ?? null;
}

/**
 * Another org's suppression blocked this send, but the sending org has no
 * suppressed row for the address, so nothing would show in its Suppression
 * tab and it would have nothing to remove. Copy the suppression into the
 * sending org (keeping the original suppressedAt) so the org can see it and
 * remove it, which records the unsuppressedAt override above.
 * Best effort: a failure here must not change the send outcome.
 */
async function mirrorForeignSuppressions({
	organizationId,
	userId,
	apiKeyId,
	suppressions,
}: {
	organizationId: string;
	userId?: string;
	apiKeyId?: string;
	suppressions: Map<string, { reason: SuppressionReason; suppressedAt: Date }>;
}) {
	try {
		const ownerUserId = await resolveContactOwner(userId, apiKeyId);
		if (!ownerUserId) return;
		for (const [email, { reason, suppressedAt }] of suppressions) {
			await db
				.insert(contact)
				.values({
					email,
					organizationId,
					userId: ownerUserId,
					status: "blocked",
					suppressionReason: reason,
					suppressedAt,
				})
				.onConflictDoUpdate({
					target: [contact.email, contact.organizationId],
					set: {
						suppressionReason: reason,
						suppressedAt,
						deletedAt: null,
						updatedAt: new Date(),
					},
				});
		}
	} catch (error) {
		log.warn({
			message: "Failed to mirror another org's suppression into sending org",
			organizationId,
			error: error instanceof Error ? error.message : String(error),
		});
	}
}

// ─── Step ─────────────────────────────────────────────────────────────────────

export interface SuppressionResult {
	/** Modified body with suppressed recipients removed */
	body: MailModel.SendEmailBody;
	/** List of addresses that were removed */
	suppressed: Array<{ email: string; reason: string }>;
}

export async function checkSuppressions_step2b({
	organizationId,
	body,
	userId,
	apiKeyId,
}: {
	organizationId: string;
	body: MailModel.SendEmailBody;
	/** Sender, used to own contacts created by {@link mirrorForeignSuppressions}. */
	userId?: string;
	apiKeyId?: string;
}): Promise<SuppressionResult> {
	// Collect all recipient addresses across To / CC / BCC
	const toList = toArray(body.to);
	const ccList = toArray(body.cc);
	const bccList = toArray(body.bcc);

	const allBare = [
		...toList.map(normalizeBareEmail),
		...ccList.map(normalizeBareEmail),
		...bccList.map(normalizeBareEmail),
	].filter(Boolean);

	if (allBare.length === 0) return { body, suppressed: [] };

	// Platform-global lookup, plus the sending org's own override rows.
	// The same email can exist in multiple org contact rows so we
	// deduplicate by email after the query.
	const isSuppressedRow = or(
		inArray(contact.status, ["blocked"]),
		isNotNull(contact.suppressionReason),
	);
	const rows = await db
		.select({
			email: contact.email,
			organizationId: contact.organizationId,
			status: contact.status,
			suppressionReason: contact.suppressionReason,
			suppressedAt: contact.suppressedAt,
			updatedAt: contact.updatedAt,
			unsuppressedAt: contact.unsuppressedAt,
		})
		.from(contact)
		.where(
			and(
				inArray(contact.email, allBare),
				or(
					isSuppressedRow,
					and(
						eq(contact.organizationId, organizationId),
						isNotNull(contact.unsuppressedAt),
					),
				),
			),
		);

	// When the sending org removed its own suppression for an address, other
	// orgs' suppressions recorded before that removal no longer apply to it.
	const overrideByEmail = new Map<string, Date>();
	for (const row of rows) {
		if (
			row.organizationId === organizationId &&
			row.unsuppressedAt &&
			row.status !== "blocked" &&
			!row.suppressionReason
		) {
			overrideByEmail.set(row.email.toLowerCase(), row.unsuppressedAt);
		}
	}

	// Deduplicate: keep the most severe reason per email
	const suppressedByEmail = new Map<string, string>();
	const ownSuppressed = new Set<string>();
	const foreignSuppression = new Map<
		string,
		{ reason: SuppressionReason; suppressedAt: Date }
	>();
	for (const row of rows) {
		if (row.status !== "blocked" && !row.suppressionReason) continue;
		const key = row.email.toLowerCase();
		const override = overrideByEmail.get(key);
		const suppressedAt = row.suppressedAt ?? row.updatedAt;
		if (
			row.organizationId !== organizationId &&
			override &&
			suppressedAt <= override
		) {
			continue;
		}
		if (row.organizationId === organizationId) {
			ownSuppressed.add(key);
		} else if (row.suppressionReason && !foreignSuppression.has(key)) {
			foreignSuppression.set(key, {
				reason: row.suppressionReason,
				suppressedAt,
			});
		}
		const reason = row.suppressionReason ?? row.status ?? "blocked";
		// hard_bounce and spam_complaint take priority over "blocked"
		if (!suppressedByEmail.has(key) || reason !== "blocked") {
			suppressedByEmail.set(key, reason);
		}
	}

	for (const key of ownSuppressed) foreignSuppression.delete(key);
	if (foreignSuppression.size > 0) {
		await mirrorForeignSuppressions({
			organizationId,
			userId,
			apiKeyId,
			suppressions: foreignSuppression,
		});
	}

	if (suppressedByEmail.size === 0) return { body, suppressed: [] };

	// Build a lookup set from the deduplicated map
	const suppressedSet = suppressedByEmail;

	// Helper: filter a recipient list, preserving original RFC 5322 format
	function filterList(list: string[]): string[] {
		return list.filter((r) => !suppressedSet.has(normalizeBareEmail(r)));
	}

	const cleanTo = filterList(toList);
	const cleanCc = filterList(ccList);
	const cleanBcc = filterList(bccList);

	// Build the suppressed log list
	const suppressed = Array.from(suppressedSet.entries()).map(
		([email, reason]) => ({
			email,
			reason,
		}),
	);

	log.warn({
		message: "Suppressed recipients removed from transactional send",
		suppressed,
		remaining: cleanTo.length + cleanCc.length + cleanBcc.length,
	});

	const suppressedSummary = suppressed
		.map(({ email, reason }) => `${email} (${reason})`)
		.join(", ");

	// If every recipient was suppressed, fail rather than sending nothing silently
	if (cleanTo.length === 0 && cleanCc.length === 0 && cleanBcc.length === 0) {
		throw createError({
			status: 400,
			message: `All recipients are on the suppression list: ${suppressedSummary}`,
			why: "Every recipient address is on the suppression list because an earlier email hard-bounced, filled a full mailbox, or was reported as spam",
			fix: "Remove the address from the Suppression tab on the Contacts page if it should receive email again, or send to a different address",
		});
	}

	// At least one To address is required for a valid send
	if (cleanTo.length === 0) {
		throw createError({
			status: 400,
			message: `No valid recipients in To field. Suppressed: ${suppressedSummary}`,
			why: "All addresses in the To field are on the suppression list. A valid To address is required even if CC/BCC recipients remain.",
			fix: "Provide at least one non-suppressed address in the To field, or remove the address from the Suppression tab on the Contacts page",
		});
	}

	// Return the body with cleaned recipient lists
	const updatedBody: MailModel.SendEmailBody = {
		...body,
		to: cleanTo.length === 1 ? cleanTo[0]! : cleanTo,
		...(ccList.length > 0
			? { cc: cleanCc.length === 1 ? cleanCc[0] : cleanCc }
			: {}),
		...(bccList.length > 0
			? { bcc: cleanBcc.length === 1 ? cleanBcc[0] : cleanBcc }
			: {}),
	};

	return { body: updatedBody, suppressed };
}
