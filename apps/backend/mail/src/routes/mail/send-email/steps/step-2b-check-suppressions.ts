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
 *  - If EVERY recipient is suppressed → throws 400.
 *  - If SOME recipients are suppressed → skips those, logs a warning,
 *    continues with remaining recipients.
 */

import type { MailModel } from "@reloop/be-mail/model/mail.model";
import { db } from "@reloop/db/client";
import { contact } from "@reloop/db/schema";
import { and, inArray, isNotNull, or } from "drizzle-orm";
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

// ─── Step ─────────────────────────────────────────────────────────────────────

export interface SuppressionResult {
	/** Modified body with suppressed recipients removed */
	body: MailModel.SendEmailBody;
	/** List of addresses that were removed */
	suppressed: Array<{ email: string; reason: string }>;
}

export async function checkSuppressions_step2b({
	body,
}: {
	body: MailModel.SendEmailBody;
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

	// Platform-global lookup — no org filter.
	// The same email can exist in multiple org contact rows so we
	// deduplicate by email after the query.
	const rows = await db
		.select({
			email: contact.email,
			status: contact.status,
			suppressionReason: contact.suppressionReason,
		})
		.from(contact)
		.where(
			and(
				inArray(contact.email, allBare),
				or(
					inArray(contact.status, ["blocked"]),
					isNotNull(contact.suppressionReason),
				),
			),
		);

	// Deduplicate: keep the most severe reason per email
	const suppressedByEmail = new Map<string, string>();
	for (const row of rows) {
		const key = row.email.toLowerCase();
		const reason = row.suppressionReason ?? row.status ?? "blocked";
		// hard_bounce and spam_complaint take priority over "blocked"
		if (!suppressedByEmail.has(key) || reason !== "blocked") {
			suppressedByEmail.set(key, reason);
		}
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

	// If every recipient was suppressed, fail rather than sending nothing silently
	if (cleanTo.length === 0 && cleanCc.length === 0 && cleanBcc.length === 0) {
		throw createError({
			status: 400,
			message: "All recipients are suppressed",
			why: "Every recipient address is on the suppression list for this organization (hard bounce or spam complaint)",
			fix: "Remove suppressed addresses from your recipient list, or check the suppression status in your contacts dashboard",
		});
	}

	// At least one To address is required for a valid send
	if (cleanTo.length === 0) {
		throw createError({
			status: 400,
			message: "No valid recipients in To field",
			why: "All addresses in the To field are suppressed. A valid To address is required even if CC/BCC recipients remain.",
			fix: "Provide at least one non-suppressed address in the To field",
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
