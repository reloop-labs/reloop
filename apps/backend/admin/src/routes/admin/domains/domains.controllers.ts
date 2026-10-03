import { writeAdminAudit } from "@reloop/admin/utils/audit";
import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import { domain, domainDnsRecord, organization } from "@reloop/db/schema";
import { and, count, desc, eq, ilike, isNull, sql } from "drizzle-orm";
import { createError } from "evlog";

export async function listDomainsController({
	limit = 50,
	offset = 0,
	q,
	status,
}: {
	limit?: number;
	offset?: number;
	q?: string;
	status?: "pending" | "verifying" | "active" | "suspended" | "failed";
}) {
	const conditions = [sql`${domain.deletedAt} IS NULL`];
	if (status) conditions.push(eq(domain.status, status));
	if (q) conditions.push(ilike(domain.domain, `%${q}%`));
	const whereClause = and(...conditions);

	const [totalRow] = await db
		.select({ value: count() })
		.from(domain)
		.where(whereClause);

	const items = await db
		.select({
			id: domain.id,
			domain: domain.domain,
			status: domain.status,
			organizationId: domain.organizationId,
			organizationName: organization.name,
			systemVerified: domain.systemVerified,
			createdAt: domain.createdAt,
		})
		.from(domain)
		.innerJoin(organization, eq(domain.organizationId, organization.id))
		.where(whereClause)
		.orderBy(desc(domain.createdAt))
		.limit(limit)
		.offset(offset);

	return {
		items,
		total: totalRow?.value ?? 0,
	};
}

export async function updateDomainStatusController({
	domainId,
	status,
	reason,
	actorUserId,
}: {
	domainId: string;
	status: "pending" | "verifying" | "active" | "suspended" | "failed";
	reason?: string;
	actorUserId: string;
}) {
	const existing = await db.query.domain.findFirst({
		where: eq(domain.id, domainId),
	});
	if (!existing || existing.deletedAt) {
		throw createError({
			status: 404,
			message: "Domain not found",
			why: `No domain with id ${domainId}`,
			fix: "Check the domain id and try again",
		});
	}

	await db
		.update(domain)
		.set({ status, updatedAt: new Date() })
		.where(eq(domain.id, domainId));

	await writeAdminAudit({
		actorUserId,
		action: `domain.${status}`,
		resourceType: "domain",
		resourceId: domainId,
		organizationId: existing.organizationId,
		metadata: {
			previousStatus: existing.status,
			domain: existing.domain,
			reason,
		},
	});

	return { success: true };
}

export async function reverifyDomainController({
	domainId,
	actorUserId,
}: {
	domainId: string;
	actorUserId: string;
}) {
	const existing = await db.query.domain.findFirst({
		where: and(eq(domain.id, domainId), isNull(domain.deletedAt)),
		with: {
			dnsRecords: {
				where: isNull(domainDnsRecord.deletedAt),
				columns: { id: true },
			},
		},
	});
	if (!existing) {
		throw createError({
			status: 404,
			message: "Domain not found",
			why: `No domain with id ${domainId}`,
			fix: "Check the domain id and try again",
		});
	}

	const previousStatus = existing.status;

	await db
		.update(domain)
		.set({
			status: "verifying",
			userVerifiedDomain: true,
			updatedAt: new Date(),
		})
		.where(eq(domain.id, domainId));

	if (existing.dnsRecords.length > 0) {
		await db
			.update(domainDnsRecord)
			.set({ status: "verifying", verificationError: null })
			.where(eq(domainDnsRecord.domainId, domainId));
	}

	try {
		await bus.publish(BusEvent.DOMAIN_DNS_REVERIFICATION_REQUESTED, {
			domainId,
			organizationId: existing.organizationId,
			domain: existing.domain,
			triggeredAt: new Date().toISOString(),
		});
	} catch (error) {
		await db
			.update(domain)
			.set({ status: previousStatus, updatedAt: new Date() })
			.where(eq(domain.id, domainId));
		throw createError({
			status: 503,
			message: "Failed to enqueue domain verification",
			why: error instanceof Error ? error.message : String(error),
			fix: "Retry in a moment. If this keeps happening, check the worker/NATS connectivity.",
		});
	}

	await writeAdminAudit({
		actorUserId,
		action: "domain.reverify",
		resourceType: "domain",
		resourceId: domainId,
		organizationId: existing.organizationId,
		metadata: {
			previousStatus,
			domain: existing.domain,
		},
	});

	return { success: true };
}
