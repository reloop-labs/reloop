import { db } from "@reloop/db/client";
import { member, organization, user } from "@reloop/db/schema";
import { and, count, desc, eq, inArray, or, sql } from "drizzle-orm";

export async function listSuspectsController({
	limit = 50,
	offset = 0,
	q,
	type = "all",
	severity,
	category,
}: {
	limit?: number;
	offset?: number;
	q?: string;
	type?: "all" | "user" | "organization";
	severity?: "low" | "medium" | "high" | "critical";
	category?: "spam" | "phishing" | "fraud" | "abuse" | "other";
}) {
	// ── Overall Stats ────────────────────────────────────────────────────────
	const [[userStats], [orgStats]] = await Promise.all([
		db
			.select({
				total: count(),
				critical: count(
					sql`CASE WHEN ${user.suspectSeverity} = 'critical' THEN 1 END`,
				),
				high: count(
					sql`CASE WHEN ${user.suspectSeverity} = 'high' THEN 1 END`,
				),
			})
			.from(user)
			.where(eq(user.isSuspect, true)),
		db
			.select({
				total: count(),
				critical: count(
					sql`CASE WHEN ${organization.suspectSeverity} = 'critical' THEN 1 END`,
				),
				high: count(
					sql`CASE WHEN ${organization.suspectSeverity} = 'high' THEN 1 END`,
				),
			})
			.from(organization)
			.where(eq(organization.isSuspect, true)),
	]);

	const usersCount = Number(userStats?.total ?? 0);
	const orgsCount = Number(orgStats?.total ?? 0);
	const criticalCount =
		Number(userStats?.critical ?? 0) + Number(orgStats?.critical ?? 0);
	const highCount = Number(userStats?.high ?? 0) + Number(orgStats?.high ?? 0);

	const stats = {
		totalSuspects: usersCount + orgsCount,
		usersCount,
		orgsCount,
		criticalCount,
		highCount,
	};

	type UnifiedSuspect = {
		type: "user" | "organization";
		id: string;
		name: string;
		identifier: string;
		isSuspect: boolean;
		suspectReason: string | null;
		suspectSeverity: string | null;
		suspectCategory: string | null;
		suspectUpdatedAt: Date | null;
		createdAt: Date;
		associatedCount: number;
		associatedName?: string | null;
	};

	const items: UnifiedSuspect[] = [];

	// ── Query Suspected Users ──────────────────────────────────────────────
	if (type === "all" || type === "user") {
		const userConditions = [eq(user.isSuspect, true)];
		if (severity) userConditions.push(eq(user.suspectSeverity, severity));
		if (category) userConditions.push(eq(user.suspectCategory, category));
		if (q && q.trim()) {
			const term = `%${q.trim()}%`;
			userConditions.push(
				or(
					sql`${user.name} ILIKE ${term}`,
					sql`${user.email} ILIKE ${term}`,
					sql`${user.suspectReason} ILIKE ${term}`,
				)!,
			);
		}

		const suspectedUsers = await db
			.select({
				id: user.id,
				name: user.name,
				email: user.email,
				isSuspect: user.isSuspect,
				suspectReason: user.suspectReason,
				suspectSeverity: user.suspectSeverity,
				suspectCategory: user.suspectCategory,
				suspectUpdatedAt: user.suspectUpdatedAt,
				createdAt: user.createdAt,
				activeOrganizationId: user.activeOrganizationId,
			})
			.from(user)
			.where(and(...userConditions))
			.orderBy(desc(user.suspectUpdatedAt));

		const uIds = suspectedUsers.map((u) => u.id);
		const orgCounts =
			uIds.length === 0
				? []
				: await db
						.select({ userId: member.userId, value: count() })
						.from(member)
						.where(inArray(member.userId, uIds))
						.groupBy(member.userId);
		const orgCountMap = new Map(orgCounts.map((r) => [r.userId, r.value]));

		const activeOrgIds = suspectedUsers
			.map((u) => u.activeOrganizationId)
			.filter((id): id is string => Boolean(id));

		const activeOrgs =
			activeOrgIds.length === 0
				? []
				: await db
						.select({ id: organization.id, name: organization.name })
						.from(organization)
						.where(inArray(organization.id, activeOrgIds));
		const activeOrgMap = new Map(activeOrgs.map((o) => [o.id, o.name]));

		for (const u of suspectedUsers) {
			items.push({
				type: "user",
				id: u.id,
				name: u.name,
				identifier: u.email,
				isSuspect: u.isSuspect,
				suspectReason: u.suspectReason ?? null,
				suspectSeverity: u.suspectSeverity ?? null,
				suspectCategory: u.suspectCategory ?? null,
				suspectUpdatedAt: u.suspectUpdatedAt ?? null,
				createdAt: u.createdAt,
				associatedCount: orgCountMap.get(u.id) ?? 0,
				associatedName: u.activeOrganizationId
					? (activeOrgMap.get(u.activeOrganizationId) ?? null)
					: null,
			});
		}
	}

	// ── Query Suspected Organizations ──────────────────────────────────────
	if (type === "all" || type === "organization") {
		const orgConditions = [eq(organization.isSuspect, true)];
		if (severity)
			orgConditions.push(eq(organization.suspectSeverity, severity));
		if (category)
			orgConditions.push(eq(organization.suspectCategory, category));
		if (q && q.trim()) {
			const term = `%${q.trim()}%`;
			orgConditions.push(
				or(
					sql`${organization.name} ILIKE ${term}`,
					sql`${organization.slug} ILIKE ${term}`,
					sql`${organization.suspectReason} ILIKE ${term}`,
				)!,
			);
		}

		const suspectedOrgs = await db
			.select({
				id: organization.id,
				name: organization.name,
				slug: organization.slug,
				isSuspect: organization.isSuspect,
				suspectReason: organization.suspectReason,
				suspectSeverity: organization.suspectSeverity,
				suspectCategory: organization.suspectCategory,
				suspectUpdatedAt: organization.suspectUpdatedAt,
				createdAt: organization.createdAt,
			})
			.from(organization)
			.where(and(...orgConditions))
			.orderBy(desc(organization.suspectUpdatedAt));

		const oIds = suspectedOrgs.map((o) => o.id);
		const memberCounts =
			oIds.length === 0
				? []
				: await db
						.select({ organizationId: member.organizationId, value: count() })
						.from(member)
						.where(inArray(member.organizationId, oIds))
						.groupBy(member.organizationId);
		const memberCountMap = new Map(
			memberCounts.map((r) => [r.organizationId, r.value]),
		);

		for (const o of suspectedOrgs) {
			items.push({
				type: "organization",
				id: o.id,
				name: o.name,
				identifier: o.slug,
				isSuspect: o.isSuspect,
				suspectReason: o.suspectReason ?? null,
				suspectSeverity: o.suspectSeverity ?? null,
				suspectCategory: o.suspectCategory ?? null,
				suspectUpdatedAt: o.suspectUpdatedAt ?? null,
				createdAt: o.createdAt,
				associatedCount: memberCountMap.get(o.id) ?? 0,
			});
		}
	}

	// Sort unified list: latest suspect update first, fallback to creation
	items.sort((a, b) => {
		const aTime = a.suspectUpdatedAt
			? new Date(a.suspectUpdatedAt).getTime()
			: new Date(a.createdAt).getTime();
		const bTime = b.suspectUpdatedAt
			? new Date(b.suspectUpdatedAt).getTime()
			: new Date(b.createdAt).getTime();
		return bTime - aTime;
	});

	const total = items.length;
	const pagedItems = items.slice(offset, offset + limit);

	return {
		items: pagedItems,
		total,
		stats,
	};
}
