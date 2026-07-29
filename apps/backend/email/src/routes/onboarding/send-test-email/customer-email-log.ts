import { db } from "@reloop/db/client";
import { domain, emailLog } from "@reloop/db/schema";
import {
	ONBOARDING_TEST_SUBJECT,
	ONBOARDING_TEST_TEXT,
} from "@reloop/email/routes/onboarding/onboarding.constants";
import { and, desc, eq, gte, ne, or, sql } from "drizzle-orm";
import { log } from "evlog";

function parseFromEmail(from: string): string {
	const angled = from.match(/<([^<>]+@[^<>]+)>/);
	return (angled?.[1] ?? from).trim();
}

function parseFromName(from: string): string | undefined {
	const displayNameMatch = from.match(/^(.+?)\s*<[^>]+>$/);
	if (!displayNameMatch?.[1]) return undefined;
	const name = displayNameMatch[1].trim().replace(/^["']|["']$/g, "");
	return name || undefined;
}

/**
 * After each onboarding test send, attribute one email_log to the customer.
 *
 * Platform transport creates a row under the platform org. We reassign the
 * newest matching unattributed row (or insert a customer row if none exists)
 * so every Send click produces a distinct log under the workspace + API key.
 */
export async function saveOnboardingCustomerEmailLog({
	organizationId,
	userId,
	apikeyId,
	from,
	to,
	onboardingDomainName,
	providerMessageId,
}: {
	organizationId: string;
	userId: string;
	apikeyId?: string;
	from: string;
	to: string;
	onboardingDomainName: string;
	providerMessageId?: string;
}): Promise<string | null> {
	try {
		// Prefer the platform row for this send (message id or very recent).
		const recentCutoff = new Date(Date.now() - 2 * 60 * 1000);

		const recipientMatch = sql`EXISTS (
			SELECT 1
			FROM jsonb_array_elements_text(${emailLog.toEmails}) AS addr(email)
			WHERE lower(addr.email) = lower(${to})
		)`;

		let matchId: string | undefined;

		if (providerMessageId?.trim()) {
			const [byMessage] = await db
				.select({ id: emailLog.id })
				.from(emailLog)
				.where(
					and(
						eq(emailLog.subject, ONBOARDING_TEST_SUBJECT),
						recipientMatch,
						or(
							eq(emailLog.messageId, providerMessageId.trim()),
							eq(emailLog.providerMessageId, providerMessageId.trim()),
						),
					),
				)
				.orderBy(desc(emailLog.createdAt))
				.limit(1);
			matchId = byMessage?.id;
		}

		if (!matchId) {
			// Newest onboarding send for this recipient that is still not fully
			// owned by this workspace + key (or has no key yet).
			const [recent] = await db
				.select({ id: emailLog.id })
				.from(emailLog)
				.where(
					and(
						eq(emailLog.subject, ONBOARDING_TEST_SUBJECT),
						recipientMatch,
						gte(emailLog.createdAt, recentCutoff),
						or(
							ne(emailLog.organizationId, organizationId),
							apikeyId
								? sql`(${emailLog.apikeyId} IS DISTINCT FROM ${apikeyId})`
								: sql`true`,
						),
					),
				)
				.orderBy(desc(emailLog.createdAt))
				.limit(1);
			matchId = recent?.id;
		}

		if (matchId) {
			const [updated] = await db
				.update(emailLog)
				.set({
					organizationId,
					userId,
					...(apikeyId ? { apikeyId } : {}),
					...(providerMessageId?.trim()
						? { providerMessageId: providerMessageId.trim() }
						: {}),
				})
				.where(eq(emailLog.id, matchId))
				.returning({ id: emailLog.id });
			return updated?.id ?? matchId;
		}

		// No platform row (e.g. SMTP/Mailpit fallback) — insert customer log.
		const [domainRow] = await db
			.select({ id: domain.id })
			.from(domain)
			.where(eq(domain.domain, onboardingDomainName))
			.limit(1);

		if (!domainRow) {
			log.warn({
				domain: onboardingDomainName,
				message:
					"Onboarding test domain row missing — skip customer email_log insert",
			});
			return null;
		}

		const messageId =
			providerMessageId?.trim() ||
			`msg_onboarding_${Date.now()}_${Math.random().toString(36).slice(2)}`;

		const [row] = await db
			.insert(emailLog)
			.values({
				messageId,
				organizationId,
				domainId: domainRow.id,
				userId,
				apikeyId,
				fromEmail: parseFromEmail(from),
				fromName: parseFromName(from) ?? "Reloop",
				toEmails: [to],
				subject: ONBOARDING_TEST_SUBJECT,
				textBody: ONBOARDING_TEST_TEXT,
				htmlBody: ONBOARDING_TEST_TEXT,
				status: "sent",
				provider: "kumomta",
				providerMessageId: providerMessageId?.trim() || undefined,
				size: ONBOARDING_TEST_TEXT.length * 2,
				sentAt: new Date(),
			})
			.returning({ id: emailLog.id });

		return row?.id ?? null;
	} catch (error) {
		// Send already succeeded — never fail the request because of logging.
		log.error({
			error: error instanceof Error ? error.message : String(error),
			organizationId,
			message: "Failed to save customer onboarding email_log",
		});
		return null;
	}
}
