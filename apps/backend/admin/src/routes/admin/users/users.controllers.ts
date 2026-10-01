import { writeAdminAudit } from "@reloop/admin/utils/audit";
import { db } from "@reloop/db/client";
import {
	apikey,
	domain,
	member,
	organization,
	organizationCredits,
	organizationPlan,
	supportConversation,
	user,
} from "@reloop/db/schema";
import { and, count, desc, eq, inArray, or, sql } from "drizzle-orm";
import { createError } from "evlog";

export async function getUserController(userId: string) {
	const found = await db.query.user.findFirst({
		where: eq(user.id, userId),
	});
	if (!found) {
		throw createError({
			status: 404,
			message: "User not found",
			why: `No user with id ${userId}`,
			fix: "Check the user id and try again",
		});
	}

	const memberships = await db
		.select({
			memberId: member.id,
			role: member.role,
			joinedAt: member.createdAt,
			organizationId: organization.id,
			organizationName: organization.name,
			organizationSlug: organization.slug,
			organizationStatus: organization.status,
			billingEmail: organization.billingEmail,
			creditsRemaining: organizationCredits.creditsRemaining,
			creditsUsed: organizationCredits.creditsUsed,
			monthlyCredits: organizationCredits.monthlyCredits,
		})
		.from(member)
		.innerJoin(organization, eq(member.organizationId, organization.id))
		.leftJoin(
			organizationCredits,
			eq(organizationCredits.organizationId, organization.id),
		)
		.where(eq(member.userId, userId))
		.orderBy(desc(member.createdAt));

	const orgIds = memberships.map((m) => m.organizationId);

	const planRows =
		orgIds.length === 0
			? []
			: await db.query.organizationPlan.findMany({
					where: inArray(organizationPlan.organizationId, orgIds),
				});
	const planMap = new Map(planRows.map((r) => [r.organizationId, r.planId]));

	const domainCounts =
		orgIds.length === 0
			? []
			: await db
					.select({
						organizationId: domain.organizationId,
						value: count(),
					})
					.from(domain)
					.where(
						and(
							sql`${domain.deletedAt} IS NULL`,
							inArray(domain.organizationId, orgIds),
						),
					)
					.groupBy(domain.organizationId);

	const domainMap = new Map(
		domainCounts.map((row) => [row.organizationId, row.value]),
	);

	const [supportThreads, apiKeys] = await Promise.all([
		db
			.select({
				id: supportConversation.id,
				status: supportConversation.status,
				organizationId: supportConversation.organizationId,
				lastMessageAt: supportConversation.lastMessageAt,
				lastMessagePreview: supportConversation.lastMessagePreview,
				createdAt: supportConversation.createdAt,
			})
			.from(supportConversation)
			.where(eq(supportConversation.userId, userId))
			.orderBy(desc(supportConversation.lastMessageAt))
			.limit(30),
		db
			.select({
				id: apikey.id,
				name: apikey.name,
				prefix: apikey.prefix,
				start: apikey.start,
				enabled: apikey.enabled,
				organizationId: apikey.organizationId,
				organizationName: organization.name,
				requestCount: apikey.requestCount,
				lastRequest: apikey.lastRequest,
				expiresAt: apikey.expiresAt,
				createdAt: apikey.createdAt,
			})
			.from(apikey)
			.innerJoin(organization, eq(apikey.organizationId, organization.id))
			.where(eq(apikey.userId, userId))
			.orderBy(desc(apikey.createdAt))
			.limit(50),
	]);

	return {
		id: found.id,
		name: found.name,
		email: found.email,
		image: found.image ?? null,
		role: found.role,
		banned: found.banned ?? false,
		banReason: found.banReason ?? null,
		banExpires: found.banExpires ?? null,
		emailVerified: found.emailVerified,
		activeOrganizationId: found.activeOrganizationId ?? null,
		createdAt: found.createdAt,
		updatedAt: found.updatedAt,
		isSuspect: found.isSuspect ?? false,
		suspectReason: found.suspectReason ?? null,
		suspectSeverity: found.suspectSeverity ?? null,
		suspectCategory: found.suspectCategory ?? null,
		suspectUpdatedAt: found.suspectUpdatedAt ?? null,
		organizations: memberships.map((m) => ({
			memberId: m.memberId,
			role: m.role,
			joinedAt: m.joinedAt,
			id: m.organizationId,
			name: m.organizationName,
			slug: m.organizationSlug,
			status: m.organizationStatus,
			billingEmail: m.billingEmail ?? null,
			domainCount: domainMap.get(m.organizationId) ?? 0,
			creditsRemaining: m.creditsRemaining ?? null,
			creditsUsed: m.creditsUsed ?? null,
			monthlyCredits: m.monthlyCredits ?? null,
			planId: planMap.get(m.organizationId) ?? null,
		})),
		apiKeys: apiKeys.map((k) => ({
			id: k.id,
			name: k.name ?? null,
			prefix: k.prefix ?? null,
			start: k.start ?? null,
			enabled: k.enabled,
			organizationId: k.organizationId,
			organizationName: k.organizationName,
			requestCount: k.requestCount,
			lastRequest: k.lastRequest ?? null,
			expiresAt: k.expiresAt ?? null,
			createdAt: k.createdAt,
		})),
		supportConversations: supportThreads.map((t) => ({
			id: t.id,
			status: t.status,
			organizationId: t.organizationId ?? null,
			lastMessageAt: t.lastMessageAt,
			lastMessagePreview: t.lastMessagePreview ?? null,
			createdAt: t.createdAt,
		})),
	};
}

export async function listUsersController({
	limit = 50,
	offset = 0,
	q,
	searchField = "email",
	role,
	status,
	isSuspect,
	sortBy = "createdAt",
	sortDirection = "desc",
}: {
	limit?: number;
	offset?: number;
	q?: string;
	searchField?: string;
	role?: string;
	status?: string;
	isSuspect?: boolean;
	sortBy?: string;
	sortDirection?: "asc" | "desc";
}) {
	const conditions = [];

	if (isSuspect !== undefined) {
		conditions.push(eq(user.isSuspect, isSuspect));
	} else if (status === "suspect") {
		conditions.push(eq(user.isSuspect, true));
	} else if (status === "banned") {
		conditions.push(eq(user.banned, true));
	} else if (status === "active") {
		conditions.push(eq(user.banned, false));
	}

	if (role && role !== "all") {
		conditions.push(eq(user.role, role as "user" | "super-admin"));
	}

	if (q && q.trim()) {
		const term = `%${q.trim()}%`;
		if (searchField === "name") {
			conditions.push(sql`${user.name} ILIKE ${term}`);
		} else {
			conditions.push(
				or(sql`${user.email} ILIKE ${term}`, sql`${user.name} ILIKE ${term}`)!,
			);
		}
	}

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	const [totalRow] = await db
		.select({ value: count() })
		.from(user)
		.where(whereClause);

	const sortCol =
		sortBy === "email"
			? user.email
			: sortBy === "name"
				? user.name
				: user.createdAt;
	const orderClause =
		sortDirection === "asc" ? sql`${sortCol} ASC` : sql`${sortCol} DESC`;

	const usersList = await db
		.select({
			id: user.id,
			name: user.name,
			email: user.email,
			image: user.image,
			role: user.role,
			banned: user.banned,
			banReason: user.banReason,
			emailVerified: user.emailVerified,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
			isSuspect: user.isSuspect,
			suspectReason: user.suspectReason,
			suspectSeverity: user.suspectSeverity,
			suspectCategory: user.suspectCategory,
			suspectUpdatedAt: user.suspectUpdatedAt,
			activeOrganizationId: user.activeOrganizationId,
		})
		.from(user)
		.where(whereClause)
		.orderBy(orderClause)
		.limit(limit)
		.offset(offset);

	const userIds = usersList.map((u) => u.id);

	const memberCounts =
		userIds.length === 0
			? []
			: await db
					.select({
						userId: member.userId,
						count: count(),
					})
					.from(member)
					.where(inArray(member.userId, userIds))
					.groupBy(member.userId);

	const memberCountMap = new Map(memberCounts.map((m) => [m.userId, m.count]));

	// Get active org names for display
	const activeOrgIds = usersList
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

	return {
		items: usersList.map((u) => ({
			id: u.id,
			name: u.name,
			email: u.email,
			image: u.image ?? null,
			role: u.role,
			banned: u.banned ?? false,
			banReason: u.banReason ?? null,
			emailVerified: u.emailVerified,
			createdAt: u.createdAt,
			updatedAt: u.updatedAt,
			isSuspect: u.isSuspect ?? false,
			suspectReason: u.suspectReason ?? null,
			suspectSeverity: u.suspectSeverity ?? null,
			suspectCategory: u.suspectCategory ?? null,
			suspectUpdatedAt: u.suspectUpdatedAt ?? null,
			organizationCount: memberCountMap.get(u.id) ?? 0,
			activeOrgName: u.activeOrganizationId
				? (activeOrgMap.get(u.activeOrganizationId) ?? null)
				: null,
		})),
		total: totalRow?.value ?? 0,
	};
}

export async function updateUserSuspectController({
	userId,
	isSuspect,
	reason,
	severity,
	category,
	flagOrganizations = false,
	actorUserId,
}: {
	userId: string;
	isSuspect: boolean;
	reason?: string | null;
	severity?: "low" | "medium" | "high" | "critical" | null;
	category?: "spam" | "phishing" | "fraud" | "abuse" | "other" | null;
	flagOrganizations?: boolean;
	actorUserId: string;
}) {
	const found = await db.query.user.findFirst({
		where: eq(user.id, userId),
	});

	if (!found) {
		throw createError({
			status: 404,
			message: "User not found",
			why: `No user with id ${userId}`,
			fix: "Check the user id and try again",
		});
	}

	const now = new Date();

	await db
		.update(user)
		.set({
			isSuspect,
			suspectReason: isSuspect ? (reason ?? null) : null,
			suspectSeverity: isSuspect ? (severity ?? null) : null,
			suspectCategory: isSuspect ? (category ?? null) : null,
			suspectUpdatedAt: now,
		})
		.where(eq(user.id, userId));

	let affectedOrgCount = 0;
	if (flagOrganizations) {
		const memberships = await db
			.select({ organizationId: member.organizationId })
			.from(member)
			.where(eq(member.userId, userId));

		const orgIds = memberships.map((m) => m.organizationId);
		if (orgIds.length > 0) {
			await db
				.update(organization)
				.set({
					isSuspect,
					suspectReason: isSuspect
						? (reason ?? `Flagged via suspected member (${found.email})`)
						: null,
					suspectSeverity: isSuspect ? (severity ?? null) : null,
					suspectCategory: isSuspect ? (category ?? null) : null,
					suspectUpdatedAt: now,
				})
				.where(inArray(organization.id, orgIds));

			affectedOrgCount = orgIds.length;
		}
	}

	await writeAdminAudit({
		actorUserId,
		action: isSuspect ? "user.suspect.flagged" : "user.suspect.cleared",
		resourceType: "user",
		resourceId: userId,
		organizationId: found.activeOrganizationId ?? null,
		metadata: {
			isSuspect,
			reason,
			severity,
			category,
			flagOrganizations,
			affectedOrgCount,
		},
	});

	return {
		success: true,
		isSuspect,
		affectedOrgCount,
	};
}
