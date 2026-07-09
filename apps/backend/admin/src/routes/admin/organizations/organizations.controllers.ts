import { writeAdminAudit } from "@reloop/admin/utils/audit";
import { db } from "@reloop/db/client";
import {
	domain,
	member,
	organization,
	organizationCredits,
	user,
} from "@reloop/db/schema";
import { createError } from "evlog";
import { and, count, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";

export async function listOrganizationsController({
	limit = 50,
	offset = 0,
	q,
	status,
}: {
	limit?: number;
	offset?: number;
	q?: string;
	status?: "active" | "suspended" | "deleted";
}) {
	const conditions = [];
	if (status) conditions.push(eq(organization.status, status));
	if (q) {
		conditions.push(
			or(
				ilike(organization.name, `%${q}%`),
				ilike(organization.slug, `%${q}%`),
			)!,
		);
	}
	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	const [totalRow] = await db
		.select({ value: count() })
		.from(organization)
		.where(whereClause);

	const orgs = await db
		.select({
			id: organization.id,
			name: organization.name,
			slug: organization.slug,
			status: organization.status,
			createdAt: organization.createdAt,
			creditsRemaining: organizationCredits.creditsRemaining,
		})
		.from(organization)
		.leftJoin(
			organizationCredits,
			eq(organizationCredits.organizationId, organization.id),
		)
		.where(whereClause)
		.orderBy(desc(organization.createdAt))
		.limit(limit)
		.offset(offset);

	const orgIds = orgs.map((o) => o.id);

	const memberCounts =
		orgIds.length === 0
			? []
			: await db
					.select({
						organizationId: member.organizationId,
						value: count(),
					})
					.from(member)
					.where(inArray(member.organizationId, orgIds))
					.groupBy(member.organizationId);

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

	const memberMap = new Map(
		memberCounts.map((row) => [row.organizationId, row.value]),
	);
	const domainMap = new Map(
		domainCounts.map((row) => [row.organizationId, row.value]),
	);

	return {
		items: orgs.map((o) => ({
			...o,
			memberCount: memberMap.get(o.id) ?? 0,
			domainCount: domainMap.get(o.id) ?? 0,
			creditsRemaining: o.creditsRemaining ?? null,
		})),
		total: totalRow?.value ?? 0,
	};
}

export async function getOrganizationController(organizationId: string) {
	const org = await db.query.organization.findFirst({
		where: eq(organization.id, organizationId),
	});
	if (!org) {
		throw createError({
			status: 404,
			message: "Organization not found",
			why: `No organization with id ${organizationId}`,
			fix: "Check the organization id and try again",
		});
	}

	const members = await db
		.select({
			id: member.id,
			role: member.role,
			userId: member.userId,
			userName: user.name,
			userEmail: user.email,
			createdAt: member.createdAt,
		})
		.from(member)
		.innerJoin(user, eq(member.userId, user.id))
		.where(eq(member.organizationId, organizationId));

	const domains = await db
		.select({
			id: domain.id,
			domain: domain.domain,
			status: domain.status,
			createdAt: domain.createdAt,
		})
		.from(domain)
		.where(
			and(
				eq(domain.organizationId, organizationId),
				sql`${domain.deletedAt} IS NULL`,
			),
		);

	const credits = await db.query.organizationCredits.findFirst({
		where: eq(organizationCredits.organizationId, organizationId),
	});

	return {
		id: org.id,
		name: org.name,
		slug: org.slug,
		status: org.status,
		createdAt: org.createdAt,
		billingEmail: org.billingEmail,
		members,
		domains,
		credits: credits
			? {
					creditsUsed: credits.creditsUsed,
					creditsRemaining: credits.creditsRemaining,
					monthlyCredits: credits.monthlyCredits,
					status: credits.status,
					currentPeriodStart: credits.currentPeriodStart,
					currentPeriodEnd: credits.currentPeriodEnd,
				}
			: null,
	};
}

export async function updateOrganizationStatusController({
	organizationId,
	status,
	reason,
	actorUserId,
}: {
	organizationId: string;
	status: "active" | "suspended" | "deleted";
	reason?: string;
	actorUserId: string;
}) {
	const org = await db.query.organization.findFirst({
		where: eq(organization.id, organizationId),
	});
	if (!org) {
		throw createError({
			status: 404,
			message: "Organization not found",
			why: `No organization with id ${organizationId}`,
			fix: "Check the organization id and try again",
		});
	}

	await db
		.update(organization)
		.set({ status, updatedAt: new Date() })
		.where(eq(organization.id, organizationId));

	await writeAdminAudit({
		actorUserId,
		action: `organization.${status}`,
		resourceType: "organization",
		resourceId: organizationId,
		organizationId,
		metadata: { previousStatus: org.status, reason },
	});

	return { success: true };
}
