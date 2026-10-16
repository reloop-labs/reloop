import {
	type OrgRisk,
	type OrgRiskFacts,
	scoreOrgRisk,
} from "@reloop/admin/lib/spam-risk";
import { writeAdminAudit } from "@reloop/admin/utils/audit";
import { db } from "@reloop/db/client";
import { type DomainRiskSignal, scoreDomainRisk } from "@reloop/db/domain-risk";
import {
	domain,
	emailLog,
	member,
	organization,
	orgSendingBlock,
	user,
} from "@reloop/db/schema";
import { checkOutboundSpam, type SpamCheckInput } from "@reloop/db/spam-check";
import { matchDisposable } from "@reloop/email-validation";
import { and, desc, eq, gt, gte, inArray, isNull, sql } from "drizzle-orm";
import { createError } from "evlog";

const DAY_MS = 86_400_000;
/** Orgs scored per list request — keeps the 7d aggregate bounded. */
const MAX_CANDIDATES = 500;

const isDisposable = (registrable: string) =>
	matchDisposable(registrable).match !== null;

type OrgRow = {
	id: string;
	name: string;
	slug: string;
	status: "active" | "suspended" | "deleted";
	isSuspect: boolean;
	createdAt: Date;
};

type ScoredOrg = {
	facts: OrgRiskFacts;
	domains: Array<{
		domain: string;
		status: string;
		registeredAt: Date | null;
		signals: DomainRiskSignal[];
	}>;
	risk: OrgRisk;
};

/** Batch-load every fact scoreOrgRisk needs for a set of orgs. */
async function loadRiskFacts(
	orgs: OrgRow[],
	now: Date,
): Promise<Map<string, ScoredOrg>> {
	const ids = orgs.map((o) => o.id);
	if (ids.length === 0) return new Map();
	const since7d = new Date(now.getTime() - 7 * DAY_MS);
	const since24h = new Date(now.getTime() - DAY_MS);

	const [sendRows, blockRows, domainRows] = await Promise.all([
		db
			.select({
				organizationId: emailLog.organizationId,
				sent: sql<number>`count(*)`,
				bounced: sql<number>`count(*) filter (where ${emailLog.status} = 'bounced')`,
				complaints: sql<number>`count(*) filter (where ${emailLog.status} = 'spam')`,
				sent24h: sql<number>`count(*) filter (where ${emailLog.createdAt} >= ${since24h})`,
			})
			.from(emailLog)
			.where(
				and(
					inArray(emailLog.organizationId, ids),
					gte(emailLog.createdAt, since7d),
				),
			)
			.groupBy(emailLog.organizationId),
		db
			.select({
				organizationId: orgSendingBlock.organizationId,
				total: sql<number>`count(*)`,
				active: sql<number>`count(*) filter (where ${orgSendingBlock.releasedAt} is null and ${orgSendingBlock.expiresAt} > ${now})`,
			})
			.from(orgSendingBlock)
			.where(inArray(orgSendingBlock.organizationId, ids))
			.groupBy(orgSendingBlock.organizationId),
		db
			.select({
				organizationId: domain.organizationId,
				domain: domain.domain,
				status: domain.status,
				registeredAt: domain.registeredAt,
				createdAt: domain.createdAt,
			})
			.from(domain)
			.where(
				and(inArray(domain.organizationId, ids), isNull(domain.deletedAt)),
			),
	]);

	const sends = new Map(sendRows.map((r) => [r.organizationId, r]));
	const blocks = new Map(blockRows.map((r) => [r.organizationId, r]));
	const domainsByOrg = new Map<string, typeof domainRows>();
	for (const d of domainRows) {
		const list = domainsByOrg.get(d.organizationId) ?? [];
		list.push(d);
		domainsByOrg.set(d.organizationId, list);
	}

	function build(org: OrgRow): ScoredOrg {
		const s = sends.get(org.id);
		const b = blocks.get(org.id);
		const domains = (domainsByOrg.get(org.id) ?? []).map((d) => ({
			domain: d.domain,
			status: d.status,
			registeredAt: d.registeredAt,
			signals: scoreDomainRisk({
				domain: d.domain,
				registeredAt: d.registeredAt,
				now,
				isDisposable,
			}),
		}));
		const pastBlocks = Number(b?.total ?? 0) - Number(b?.active ?? 0);
		const facts: OrgRiskFacts = {
			createdAt: org.createdAt,
			status: org.status,
			isSuspect: org.isSuspect,
			sent7d: Number(s?.sent ?? 0),
			bounced7d: Number(s?.bounced ?? 0),
			complaints7d: Number(s?.complaints ?? 0),
			sent24h: Number(s?.sent24h ?? 0),
			activeSendingBlock: Number(b?.active ?? 0) > 0,
			pastSendingBlocks: Math.max(pastBlocks, 0),
			domainsAdded24h: (domainsByOrg.get(org.id) ?? []).filter(
				(d) => d.createdAt >= since24h,
			).length,
			domains,
		};
		return { facts, domains, risk: scoreOrgRisk(facts, now) };
	}

	return new Map(orgs.map((o) => [o.id, build(o)]));
}

function toReport(org: OrgRow, built: ScoredOrg) {
	const { facts, domains, risk } = built;
	return {
		organizationId: org.id,
		name: org.name,
		slug: org.slug,
		status: org.status,
		isSuspect: org.isSuspect,
		createdAt: org.createdAt,
		score: risk.score,
		level: risk.level,
		signals: risk.signals,
		stats: {
			sent7d: facts.sent7d,
			bounced7d: facts.bounced7d,
			complaints7d: facts.complaints7d,
			sent24h: facts.sent24h,
			bounceRate: facts.sent7d > 0 ? facts.bounced7d / facts.sent7d : 0,
			complaintRate: facts.sent7d > 0 ? facts.complaints7d / facts.sent7d : 0,
			activeSendingBlock: facts.activeSendingBlock,
			pastSendingBlocks: facts.pastSendingBlocks,
		},
		domains,
	};
}

const orgColumns = {
	id: organization.id,
	name: organization.name,
	slug: organization.slug,
	status: organization.status,
	isSuspect: organization.isSuspect,
	createdAt: organization.createdAt,
};

async function findOrgOr404(organizationId: string): Promise<OrgRow> {
	const [org] = await db
		.select(orgColumns)
		.from(organization)
		.where(eq(organization.id, organizationId))
		.limit(1);
	if (!org) {
		throw createError({
			status: 404,
			message: "Organization not found",
			why: `No organization with id ${organizationId}`,
			fix: "Check the organization id and try again",
		});
	}
	return org;
}

export async function getOrgSpamRiskController(organizationId: string) {
	const now = new Date();
	const org = await findOrgOr404(organizationId);
	const built = (await loadRiskFacts([org], now)).get(org.id);
	if (!built) throw new Error("risk facts missing for loaded org");
	return toReport(org, built);
}

const LEVEL_ORDER = { low: 0, medium: 1, high: 2, critical: 3 } as const;

/**
 * Riskiest active orgs right now. Candidates are orgs that sent mail or
 * were created in the last 7 days — dormant orgs can't be spamming.
 */
export async function listSpamRiskController({
	limit = 50,
	minLevel = "medium",
}: {
	limit?: number;
	minLevel?: keyof typeof LEVEL_ORDER;
}) {
	const now = new Date();
	const since7d = new Date(now.getTime() - 7 * DAY_MS);

	const [recentSenders, recentOrgs] = await Promise.all([
		db
			.select({ id: emailLog.organizationId, sent: sql<number>`count(*)` })
			.from(emailLog)
			.where(gte(emailLog.createdAt, since7d))
			.groupBy(emailLog.organizationId)
			.orderBy(desc(sql`count(*)`))
			.limit(MAX_CANDIDATES),
		db
			.select({ id: organization.id })
			.from(organization)
			.where(gt(organization.createdAt, since7d))
			.orderBy(desc(organization.createdAt))
			.limit(MAX_CANDIDATES),
	]);
	const candidateIds = [
		...new Set([...recentSenders, ...recentOrgs].map((r) => r.id)),
	];
	if (candidateIds.length === 0) return { items: [], total: 0, scanned: 0 };

	const orgs = await db
		.select(orgColumns)
		.from(organization)
		.where(
			and(
				inArray(organization.id, candidateIds),
				eq(organization.status, "active"),
			),
		);
	const built = await loadRiskFacts(orgs, now);

	const items = orgs
		.map((o) => {
			const b = built.get(o.id);
			return b ? toReport(o, b) : null;
		})
		.filter(
			(r): r is NonNullable<typeof r> =>
				r !== null && LEVEL_ORDER[r.level] >= LEVEL_ORDER[minLevel],
		)
		.sort((a, b) => b.score - a.score);

	return {
		items: items.slice(0, limit),
		total: items.length,
		scanned: orgs.length,
	};
}

/** Run the same verdict the send pipeline uses, without sending. */
export async function checkSpamController(body: SpamCheckInput) {
	return checkOutboundSpam(body);
}

/**
 * One-click block: suspend the org (stops every send path via sender-gate),
 * flag it as a spam suspect, and optionally flag + ban its members.
 */
export async function blockOrgForSpamController({
	organizationId,
	reason,
	banUsers = false,
	actorUserId,
}: {
	organizationId: string;
	reason: string;
	banUsers?: boolean;
	actorUserId: string;
}) {
	const org = await findOrgOr404(organizationId);
	const risk = await getOrgSpamRiskController(organizationId);
	const severity = risk.level === "low" ? "medium" : risk.level;
	const now = new Date();

	const userIds = banUsers
		? (
				await db
					.select({ userId: member.userId })
					.from(member)
					.where(eq(member.organizationId, organizationId))
			).map((m) => m.userId)
		: [];

	await db.transaction(async (tx) => {
		await tx
			.update(organization)
			.set({
				status: "suspended",
				isSuspect: true,
				suspectReason: reason,
				suspectSeverity: severity,
				suspectCategory: "spam",
				suspectUpdatedAt: now,
				updatedAt: now,
			})
			.where(eq(organization.id, organizationId));
		if (userIds.length > 0) {
			await tx
				.update(user)
				.set({
					banned: true,
					banReason: reason,
					isSuspect: true,
					suspectReason: `Spam block on organization ${org.name}: ${reason}`,
					suspectSeverity: severity,
					suspectCategory: "spam",
					suspectUpdatedAt: now,
				})
				.where(inArray(user.id, userIds));
		}
	});

	await writeAdminAudit({
		actorUserId,
		action: "organization.spam.blocked",
		resourceType: "organization",
		resourceId: organizationId,
		organizationId,
		metadata: {
			reason,
			previousStatus: org.status,
			riskScore: risk.score,
			riskLevel: risk.level,
			signals: risk.signals.map((s) => s.id),
			bannedUserIds: userIds,
		},
	});

	return {
		success: true,
		status: "suspended" as const,
		riskScore: risk.score,
		riskLevel: risk.level,
		bannedUserCount: userIds.length,
	};
}

/**
 * Undo a block: reactivate, clear the suspect flag, release any active
 * reputation pause. Member bans are lifted only when asked — a user may
 * have been banned for something else.
 */
export async function unblockOrgController({
	organizationId,
	reason,
	unbanUsers = false,
	actorUserId,
}: {
	organizationId: string;
	reason: string;
	unbanUsers?: boolean;
	actorUserId: string;
}) {
	const org = await findOrgOr404(organizationId);
	const now = new Date();

	const userIds = unbanUsers
		? (
				await db
					.select({ userId: member.userId })
					.from(member)
					.where(eq(member.organizationId, organizationId))
			).map((m) => m.userId)
		: [];

	const released = await db.transaction(async (tx) => {
		await tx
			.update(organization)
			.set({
				status: "active",
				isSuspect: false,
				suspectReason: null,
				suspectSeverity: null,
				suspectCategory: null,
				suspectUpdatedAt: now,
				updatedAt: now,
			})
			.where(eq(organization.id, organizationId));
		const rows = await tx
			.update(orgSendingBlock)
			.set({ releasedAt: now })
			.where(
				and(
					eq(orgSendingBlock.organizationId, organizationId),
					isNull(orgSendingBlock.releasedAt),
					gt(orgSendingBlock.expiresAt, now),
				),
			)
			.returning({ id: orgSendingBlock.id });
		if (userIds.length > 0) {
			await tx
				.update(user)
				.set({
					banned: false,
					banReason: null,
					isSuspect: false,
					suspectReason: null,
					suspectSeverity: null,
					suspectCategory: null,
					suspectUpdatedAt: now,
				})
				.where(inArray(user.id, userIds));
		}
		return rows.length;
	});

	await writeAdminAudit({
		actorUserId,
		action: "organization.spam.unblocked",
		resourceType: "organization",
		resourceId: organizationId,
		organizationId,
		metadata: {
			reason,
			previousStatus: org.status,
			releasedSendingBlocks: released,
			unbannedUserIds: userIds,
		},
	});

	return {
		success: true,
		status: "active" as const,
		releasedSendingBlocks: released,
		unbannedUserCount: userIds.length,
	};
}
