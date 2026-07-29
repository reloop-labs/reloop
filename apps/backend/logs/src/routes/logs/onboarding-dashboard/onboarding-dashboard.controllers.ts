import { validateApiKey } from "@reloop/auth/apikey/validate";
import type { ApiKeyCache } from "@reloop/auth/apikey/validate";
import { db } from "@reloop/db/client";
import { activityLog, domain, emailLog, member, user } from "@reloop/db/schema";
import { logsConfig } from "@reloop/logs/logs.config";
import { insertAuditLog } from "@reloop/logs/utils/insert-audit-log";
import { and, desc, eq, or, sql } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

/** Matches onboarding send-test-email subject. */
const ONBOARDING_TEST_SUBJECT = "Hello World!";
const ONBOARDING_TEST_TEXT = "Congrats on sending your first email!";
const ONBOARDING_TEST_LOCAL_PART = "onboarding";

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

async function ensureActivityLogAttributed({
	emailLogId,
	organizationId,
	userId,
	apikeyId,
	to,
	from,
	subject,
}: {
	emailLogId: string;
	organizationId: string;
	userId: string;
	apikeyId: string;
	to: string;
	from: string;
	subject: string;
}) {
	const updated = await db
		.update(activityLog)
		.set({
			organizationId,
			userId,
			actorType: "api_key",
			actorId: apikeyId,
		})
		.where(
			or(
				eq(activityLog.resourceId, emailLogId),
				sql`${activityLog.metadata}->>'email_log_id' = ${emailLogId}`,
				sql`${activityLog.metadata}->>'id' = ${emailLogId}`,
			),
		)
		.returning({ id: activityLog.id });

	if (updated.length > 0) {
		return { activityUpdated: true as const, count: updated.length };
	}

	await insertAuditLog({
		event: "email.sent",
		level: "info",
		service: "mail",
		action: "sent",
		actor_type: "api_key",
		actor_id: apikeyId,
		resource_type: "email",
		resource_id: emailLogId,
		organization_id: organizationId,
		user_id: userId,
		status_code: 200,
		metadata: {
			id: emailLogId,
			email_log_id: emailLogId,
			to,
			from,
			subject,
			mode: "onboarding_test",
		},
		request_details: {
			// Display as the public mail send API in the Logs UI.
			endpoint: "/api/mail/v1/send",
			method: "POST",
			statusCode: 200,
		},
		environment:
			logsConfig.NODE_ENV === "production" ? "production" : "development",
	});

	return { activityUpdated: false as const, count: 0 };
}

async function insertCustomerEmailLog({
	organizationId,
	userId,
	apikeyId,
	to,
	from,
	onboardingDomainName,
}: {
	organizationId: string;
	userId: string;
	apikeyId: string;
	to: string;
	from: string;
	onboardingDomainName: string;
}): Promise<string | null> {
	const [domainRow] = await db
		.select({ id: domain.id })
		.from(domain)
		.where(eq(domain.domain, onboardingDomainName))
		.limit(1);

	if (!domainRow) {
		return null;
	}

	const messageId = `msg_onboarding_${Date.now()}_${Math.random().toString(36).slice(2)}`;
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
			size: ONBOARDING_TEST_TEXT.length * 2,
			sentAt: new Date(),
		})
		.returning({ id: emailLog.id });

	return row?.id ?? null;
}

/**
 * Attribute every onboarding test email_log for this API key's org.
 * Organization is taken from the API key, not the session active org.
 */
export async function onboardingDashboardController({
	userId,
	apiKey,
	apiKeyCache,
}: {
	userId: string;
	apiKey: string;
	apiKeyCache: ApiKeyCache;
}) {
	const log = useLogger();

	const [userRow] = await db
		.select({ email: user.email })
		.from(user)
		.where(eq(user.id, userId))
		.limit(1);

	const to = userRow?.email?.trim();
	if (!to) {
		return {
			status: 400 as const,
			body: {
				message: "No email on your account",
				why: "Your signed-in user has no email address.",
				fix: "Update your profile email, then try again.",
			},
		};
	}

	const keyAuth = await validateApiKey(apiKey, apiKeyCache);
	if (!keyAuth) {
		return {
			status: 401 as const,
			body: {
				message: "Invalid API key",
				why: "That API key is missing, disabled, expired, or malformed.",
				fix: "Use the key generated during onboarding.",
			},
		};
	}

	// Multi-org: attribute to the key's workspace, not session activeOrganizationId.
	const organizationId = keyAuth.organizationId;

	const [membership] = await db
		.select({ id: member.id })
		.from(member)
		.where(
			and(
				eq(member.userId, userId),
				eq(member.organizationId, organizationId),
			),
		)
		.limit(1);

	if (!membership) {
		return {
			status: 403 as const,
			body: {
				message: "API key does not belong to your account",
				why: "You are not a member of the workspace that owns this API key.",
				fix: "Use the API key generated for a workspace you belong to.",
			},
		};
	}

	const onboardingTestDomain = (
		process.env.ONBOARDING_TEST_DOMAIN || ""
	).trim();
	const from = onboardingTestDomain
		? `Reloop <${ONBOARDING_TEST_LOCAL_PART}@${onboardingTestDomain}>`
		: `Reloop <${ONBOARDING_TEST_LOCAL_PART}@reloop.email>`;

	try {
		const candidates = await db
			.select({
				id: emailLog.id,
				organizationId: emailLog.organizationId,
				apikeyId: emailLog.apikeyId,
				fromEmail: emailLog.fromEmail,
			})
			.from(emailLog)
			.where(
				and(
					eq(emailLog.subject, ONBOARDING_TEST_SUBJECT),
					sql`EXISTS (
						SELECT 1
						FROM jsonb_array_elements_text(${emailLog.toEmails}) AS addr(email)
						WHERE lower(addr.email) = lower(${to})
					)`,
				),
			)
			.orderBy(desc(emailLog.createdAt));

		const userMemberships = await db
			.select({ organizationId: member.organizationId })
			.from(member)
			.where(eq(member.userId, userId));
		const memberOrgIds = new Set(
			userMemberships.map((m) => m.organizationId),
		);

		// Claim only this key/org, unattributed, or non-member (platform) orgs.
		const matches = candidates.filter((row) => {
			if (row.organizationId === organizationId) return true;
			if (row.apikeyId === keyAuth.apiKeyId) return true;
			if (!row.apikeyId) return true;
			return !memberOrgIds.has(row.organizationId);
		});

		const attributedIds: string[] = [];
		let updatedCount = 0;

		for (const match of matches) {
			const alreadyOwned =
				match.organizationId === organizationId &&
				match.apikeyId === keyAuth.apiKeyId;

			if (!alreadyOwned) {
				await db
					.update(emailLog)
					.set({
						organizationId,
						apikeyId: keyAuth.apiKeyId,
						userId,
					})
					.where(eq(emailLog.id, match.id));
				updatedCount += 1;
			}

			await ensureActivityLogAttributed({
				emailLogId: match.id,
				organizationId,
				userId,
				apikeyId: keyAuth.apiKeyId,
				to,
				from: match.fromEmail || parseFromEmail(from),
				subject: ONBOARDING_TEST_SUBJECT,
			});
			attributedIds.push(match.id);
		}

		if (matches.length === 0 && onboardingTestDomain) {
			const emailLogId = await insertCustomerEmailLog({
				organizationId,
				userId,
				apikeyId: keyAuth.apiKeyId,
				to,
				from,
				onboardingDomainName: onboardingTestDomain,
			});
			if (emailLogId) {
				updatedCount += 1;
				attributedIds.push(emailLogId);
				await ensureActivityLogAttributed({
					emailLogId,
					organizationId,
					userId,
					apikeyId: keyAuth.apiKeyId,
					to,
					from: parseFromEmail(from),
					subject: ONBOARDING_TEST_SUBJECT,
				});
			} else {
				log.warn(
					"Onboarding domain row missing — skip customer email_log insert",
					{
						domain: onboardingTestDomain,
						organizationId,
					},
				);
			}
		}

		if (attributedIds.length === 0) {
			log.warn(
				"No onboarding email_log found or created on dashboard handoff",
				{
					email: to,
					organizationId,
				},
			);
			return {
				status: 200 as const,
				body: {
					object: "onboarding.dashboard" as const,
					updated: false,
					reason: "email_log_not_found",
					organizationId,
					apikeyId: keyAuth.apiKeyId,
					count: 0,
					ids: [] as string[],
				},
			};
		}

		log.info("Onboarding logs attributed to customer workspace", {
			count: attributedIds.length,
			updatedCount,
			organizationId,
			apikeyId: keyAuth.apiKeyId,
		});

		return {
			status: 200 as const,
			body: {
				object: "onboarding.dashboard" as const,
				updated: updatedCount > 0 || attributedIds.length > 0,
				organizationId,
				apikeyId: keyAuth.apiKeyId,
				count: attributedIds.length,
				ids: attributedIds,
			},
		};
	} catch (error) {
		log.error("Failed to attribute onboarding email logs", {
			error: error instanceof Error ? error.message : String(error),
			organizationId,
			email: to,
		});
		return {
			status: 200 as const,
			body: {
				object: "onboarding.dashboard" as const,
				updated: false,
				reason: "update_failed",
				organizationId,
				apikeyId: keyAuth.apiKeyId,
				count: 0,
				ids: [] as string[],
			},
		};
	}
}
