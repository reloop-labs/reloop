/**
 * reputation.subscriber.ts
 *
 * Async delivery-reputation aggregator. Listens to kumomta.event on NATS
 * (own queue group so logs + contacts + reputation each receive every event).
 *
 * On each bounce / spam-complaint signal:
 *  1. Resolve org (X-Org-ID header, fallback to emailLog lookup).
 *  2. Skip if an active block already exists for the org.
 *  3. Aggregate last-24h sends / bounces / complaints from email_log.
 *  4. evaluateReputation():
 *     - blocked → insert org_sending_block, flag organization.isSuspect,
 *       set Redis fast-path key for the mail guard, publish ABUSE_SUSPECTED
 *       (severity high, action blocked) → Slack alert via admin service.
 *     - warned  → publish ABUSE_SUSPECTED (medium, allowed).
 *  5. Tell the customer: REPUTATION_NOTICE → email to owners/admins.
 *     Warnings escalate 1 → 2 → 3 as the rate climbs toward the block
 *     threshold (each level at most once per 24h); level 4 = paused.
 *
 * DB is the source of truth for counts (survives Redis restarts, no extra
 * counter infra). Signal events are low-volume, so one aggregate query per
 * bounce/complaint is cheap against the indexed email_log table.
 */

import { BusEvent, bus, type KumomtaLogRecordPayload } from "@reloop/bus";
import { db } from "@reloop/db/client";
import {
	blockTtlSeconds,
	evaluateReputation,
	REPUTATION_NOTICE_REPEAT_SECONDS,
	REPUTATION_THRESHOLDS,
	type ReputationCounts,
	type ReputationReason,
	type ReputationVerdict,
	reputationNoticeLevel,
} from "@reloop/db/reputation";
import * as schema from "@reloop/db/schema";
import { redis } from "@reloop/logs/utils/loader";
import { and, desc, eq, gt, gte, isNull, lte, sql } from "drizzle-orm";
import { log } from "evlog";

type SignalKind = "bounced" | "complaint" | null;

const OVER_QUOTA_PATTERNS = [
	"overquota",
	"over quota",
	"over-quota",
	"out of storage",
	"quota exceeded",
	"mailbox full",
];

function isOverQuota(event: KumomtaLogRecordPayload): boolean {
	const content = event.response?.content;
	if (!content) return false;
	const hay = content.toLowerCase();
	return OVER_QUOTA_PATTERNS.some((p) => hay.includes(p));
}

/** Only bounce / complaint signals affect reputation. Everything else → null. */
function classifySignal(event: KumomtaLogRecordPayload): SignalKind {
	switch (event.type) {
		case "Bounce":
		case "AdminBounce":
		case "OOB":
		case "Expiration":
			return "bounced";
		case "Feedback":
			return "complaint";
		case "TransientFailure":
			return isOverQuota(event) ? "bounced" : null;
		default:
			return null;
	}
}

async function resolveOrgContext(event: KumomtaLogRecordPayload): Promise<{
	organizationId: string | null;
	domainId: string | null;
	emailLogId: string | null;
}> {
	const headerOrg = event.headers?.["X-Org-ID"] ?? null;
	const headerDomain = event.headers?.["X-Domain-ID"] ?? null;
	const emailLogId =
		event.headers?.["X-Email-Log-ID"] ?? event.meta?.["X-Email-Log-ID"] ?? null;

	if (!emailLogId && event.id) {
		const row = await db.query.emailLog.findFirst({
			where: eq(schema.emailLog.providerMessageId, event.id),
			columns: { id: true, organizationId: true, domainId: true },
		});
		if (row) {
			return {
				organizationId: row.organizationId,
				domainId: row.domainId,
				emailLogId: row.id,
			};
		}
		return { organizationId: null, domainId: null, emailLogId: null };
	}

	if (headerOrg) {
		return { organizationId: headerOrg, domainId: headerDomain, emailLogId };
	}

	if (emailLogId) {
		const row = await db.query.emailLog.findFirst({
			where: eq(schema.emailLog.id, emailLogId),
			columns: { organizationId: true, domainId: true },
		});
		if (row) {
			return {
				organizationId: row.organizationId,
				domainId: row.domainId,
				emailLogId,
			};
		}
	}
	return { organizationId: null, domainId: headerDomain, emailLogId };
}

async function hasActiveBlock(organizationId: string): Promise<boolean> {
	const rows = await db
		.select({ id: schema.orgSendingBlock.id })
		.from(schema.orgSendingBlock)
		.where(
			and(
				eq(schema.orgSendingBlock.organizationId, organizationId),
				isNull(schema.orgSendingBlock.releasedAt),
				gt(schema.orgSendingBlock.expiresAt, new Date()),
			),
		)
		.limit(1);
	return rows.length > 0;
}

async function windowCounts(organizationId: string): Promise<{
	sent: number;
	bounced: number;
	complaint: number;
}> {
	const since = new Date(Date.now() - 24 * 3600 * 1000);
	const rows = await db
		.select({
			sent: sql<number>`count(*) filter (where ${schema.emailLog.status} != 'pending')`,
			bounced: sql<number>`count(*) filter (where ${schema.emailLog.status} = 'bounced')`,
			complaint: sql<number>`count(*) filter (where ${schema.emailLog.status} = 'spam')`,
		})
		.from(schema.emailLog)
		.where(
			and(
				eq(schema.emailLog.organizationId, organizationId),
				gte(schema.emailLog.createdAt, since),
			),
		);
	const row = rows[0];
	return {
		sent: Number(row?.sent ?? 0),
		bounced: Number(row?.bounced ?? 0),
		complaint: Number(row?.complaint ?? 0),
	};
}

const PAUSED_NOTICE_LEVEL = 4;

/**
 * Record a warning notice unless one at this level or higher already went
 * out in the repeat window. Advisory lock serializes the burst of bounce
 * events that arrive together so only one email is sent per level.
 */
async function claimWarningNotice(
	organizationId: string,
	level: number,
	reason: ReputationReason,
	counts: ReputationCounts,
	verdict: ReputationVerdict,
): Promise<string | null> {
	return db.transaction(async (tx) => {
		await tx.execute(
			sql`select pg_advisory_xact_lock(hashtext(${`${organizationId}:reputation_notice`}))`,
		);
		const since = new Date(
			Date.now() - REPUTATION_NOTICE_REPEAT_SECONDS * 1000,
		);
		const [recent] = await tx
			.select({ id: schema.orgReputationNotice.id })
			.from(schema.orgReputationNotice)
			.where(
				and(
					eq(schema.orgReputationNotice.organizationId, organizationId),
					gte(schema.orgReputationNotice.createdAt, since),
					gte(schema.orgReputationNotice.level, level),
					// The pause email doesn't silence warnings after the pause lifts.
					lte(schema.orgReputationNotice.level, 3),
				),
			)
			.limit(1);
		if (recent) return null;
		const [row] = await tx
			.insert(schema.orgReputationNotice)
			.values(noticeValues(organizationId, level, reason, counts, verdict))
			.returning({ id: schema.orgReputationNotice.id });
		return row?.id ?? null;
	});
}

function noticeValues(
	organizationId: string,
	level: number,
	reason: ReputationReason,
	counts: ReputationCounts,
	verdict: ReputationVerdict,
) {
	return {
		organizationId,
		level,
		reason,
		sentCount: counts.sent,
		bouncedCount: counts.bounced,
		complaintCount: counts.complaint,
		bounceRate: verdict.bounceRate,
		complaintRate: verdict.complaintRate,
	};
}

async function topBouncingDomains(
	organizationId: string,
): Promise<{ domain: string; sent: number; bounced: number }[]> {
	const since = new Date(Date.now() - 24 * 3600 * 1000);
	const bounced = sql<number>`count(*) filter (where ${schema.emailLog.status} = 'bounced')`;
	const rows = await db
		.select({
			domain: schema.domain.domain,
			sent: sql<number>`count(*) filter (where ${schema.emailLog.status} != 'pending')`,
			bounced,
		})
		.from(schema.emailLog)
		.innerJoin(schema.domain, eq(schema.domain.id, schema.emailLog.domainId))
		.where(
			and(
				eq(schema.emailLog.organizationId, organizationId),
				gte(schema.emailLog.createdAt, since),
			),
		)
		.groupBy(schema.domain.domain)
		.having(sql`${bounced} > 0`)
		.orderBy(desc(bounced))
		.limit(3);
	return rows.map((r) => ({
		domain: r.domain,
		sent: Number(r.sent),
		bounced: Number(r.bounced),
	}));
}

async function publishNotice(args: {
	noticeId: string;
	organizationId: string;
	level: 1 | 2 | 3 | 4;
	reason: ReputationReason;
	counts: ReputationCounts;
	verdict: ReputationVerdict;
	pausedUntil: Date | null;
}): Promise<void> {
	const domains = await topBouncingDomains(args.organizationId).catch(() => []);
	await bus.publish(BusEvent.REPUTATION_NOTICE, {
		noticeId: args.noticeId,
		organizationId: args.organizationId,
		level: args.level,
		reason: args.reason,
		window: "24h",
		sent: args.counts.sent,
		bounced: args.counts.bounced,
		complaint: args.counts.complaint,
		bounceRate: args.verdict.bounceRate,
		complaintRate: args.verdict.complaintRate,
		bounceBlockRate: REPUTATION_THRESHOLDS.bounceBlockRate,
		complaintBlockRate: REPUTATION_THRESHOLDS.complaintBlockRate,
		topBouncingDomains: domains,
		pausedUntil: args.pausedUntil?.toISOString() ?? null,
	});
}

export async function initReputationSubscriber() {
	await bus.subscribe(
		BusEvent.KUMOMTA_EVENT,
		async (event: KumomtaLogRecordPayload) => {
			try {
				const signal = classifySignal(event);
				if (!signal) return; // deliveries / receptions don't affect reputation

				const { organizationId, domainId, emailLogId } =
					await resolveOrgContext(event);
				if (!organizationId) {
					log.warn({
						kumomtaId: event.id,
						type: event.type,
						message:
							"[reputation] Cannot resolve org for signal event — skipping",
					});
					return;
				}

				if (await hasActiveBlock(organizationId)) return; // already paused

				const counts = await windowCounts(organizationId);
				const verdict = evaluateReputation(counts);
				if (!verdict.warned && !verdict.blocked) return;

				const pct = (r: number) => `${(r * 100).toFixed(2)}%`;
				const summary =
					`${counts.sent} sent / 24h, ${counts.bounced} bounced ` +
					`(${pct(verdict.bounceRate)}), ${counts.complaint} complaints ` +
					`(${pct(verdict.complaintRate)})`;

				if (!verdict.blocked) {
					await bus
						.publish(BusEvent.ABUSE_SUSPECTED, {
							organizationId,
							emailLogId,
							fromEmail: event.sender ?? "",
							subject: event.headers?.Subject ?? "",
							recipientCount: 1,
							severity: "medium",
							reasons: [
								`reputation_warning:${verdict.reason}`,
								`window_24h:${summary}`,
							],
							action: "allowed",
							timestamp: new Date().toISOString(),
						})
						.catch(() => {});
					log.warn({
						message: `[reputation] Warning for org ${organizationId}: ${summary}`,
						organizationId,
					});

					const level = reputationNoticeLevel(counts);
					if (level === 0) return;
					const reason = verdict.reason ?? "bounce_rate";
					const noticeId = await claimWarningNotice(
						organizationId,
						level,
						reason,
						counts,
						verdict,
					);
					if (!noticeId) return; // already told them at this level today
					await publishNotice({
						noticeId,
						organizationId,
						level,
						reason,
						counts,
						verdict,
						pausedUntil: null,
					});
					log.info({
						message: `[reputation] Sent level ${level} warning to org ${organizationId}`,
						organizationId,
						level,
					});
					return;
				}

				// ── Block: escalating cooldown based on block history ──
				const prior = await db
					.select({ id: schema.orgSendingBlock.id })
					.from(schema.orgSendingBlock)
					.where(eq(schema.orgSendingBlock.organizationId, organizationId));
				const ttlSeconds = blockTtlSeconds(prior.length);
				const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

				const reason = verdict.reason ?? "bounce_rate";
				await db.insert(schema.orgSendingBlock).values({
					organizationId,
					domainId: domainId ?? undefined,
					reason,
					window: "24h",
					sentCount: counts.sent,
					bouncedCount: counts.bounced,
					complaintCount: counts.complaint,
					bounceRate: verdict.bounceRate,
					complaintRate: verdict.complaintRate,
					expiresAt,
					notifiedAt: new Date(),
					metadata: {
						triggerSignal: signal,
						triggerRecipient: event.recipient,
						priorBlocks: prior.length,
					},
				});

				// Flag the org so the existing admin suspects UI surfaces it.
				await db
					.update(schema.organization)
					.set({
						isSuspect: true,
						suspectReason: `Sending paused: ${verdict.reason} over threshold (${summary}). Cooldown until ${expiresAt.toISOString()}`,
						suspectSeverity: "high",
						suspectCategory: "reputation",
						suspectUpdatedAt: new Date(),
					})
					.where(eq(schema.organization.id, organizationId))
					.catch((error) => {
						log.warn({
							message: "[reputation] Failed to flag org as suspect",
							organizationId,
							error: error instanceof Error ? error.message : String(error),
						});
					});

				// Redis fast-path for the mail-service sync guard.
				await redis.set(
					`block:org:${organizationId}`,
					{
						reason: verdict.reason,
						bounceRate: verdict.bounceRate,
						complaintRate: verdict.complaintRate,
						retryAfterSeconds: ttlSeconds,
					},
					ttlSeconds,
				);

				await bus
					.publish(BusEvent.ABUSE_SUSPECTED, {
						organizationId,
						emailLogId,
						fromEmail: event.sender ?? "",
						subject: event.headers?.Subject ?? "",
						recipientCount: 1,
						severity: "high",
						reasons: [
							`reputation_block:${verdict.reason}`,
							`window_24h:${summary}`,
							`cooldown:${ttlSeconds}s`,
						],
						action: "blocked",
						timestamp: new Date().toISOString(),
					})
					.catch(() => {});

				try {
					const [notice] = await db
						.insert(schema.orgReputationNotice)
						.values(
							noticeValues(
								organizationId,
								PAUSED_NOTICE_LEVEL,
								reason,
								counts,
								verdict,
							),
						)
						.returning({ id: schema.orgReputationNotice.id });
					if (notice) {
						await publishNotice({
							noticeId: notice.id,
							organizationId,
							level: PAUSED_NOTICE_LEVEL,
							reason,
							counts,
							verdict,
							pausedUntil: expiresAt,
						});
					}
				} catch (error) {
					log.error({
						message: "[reputation] Failed to notify org of sending pause",
						organizationId,
						error: error instanceof Error ? error.message : String(error),
					});
				}

				log.warn({
					message:
						`[reputation] Sending paused for org ${organizationId} ` +
						`(${verdict.reason}, cooldown ${ttlSeconds}s): ${summary}`,
					organizationId,
					reason: verdict.reason,
				});
			} catch (error) {
				log.error({
					error: error instanceof Error ? error.message : String(error),
					kumomtaId: event.id,
					type: event.type,
					message: "[reputation] Failed to process signal event",
				});
			}
		},
		{ queue: "logs-reputation-worker" },
	);

	log.info("server", "[reputation] Reputation subscriber registered");
}
