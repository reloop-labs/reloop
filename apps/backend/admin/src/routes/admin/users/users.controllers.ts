import { db } from "@reloop/db/client";
import {
	apikey,
	domain,
	member,
	organization,
	organizationCredits,
	supportConversation,
	user,
} from "@reloop/db/schema";
import { and, count, desc, eq, inArray, sql } from "drizzle-orm";
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
