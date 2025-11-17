import type { DomainTypes } from "@be/domain/types/domain.type";
import { generateAllDNSRecords } from "@be/domain/utils";
import { createId } from "@paralleldrive/cuid2";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function createDomain(params: {
	organizationId: string;
	userId: string;
	domain: string;
}): Promise<DomainTypes.DomainResponse> {
	const { organizationId, userId, domain } = params;
	try {
		const activeDomain = await db.query.domain.findFirst({
			where: and(
				eq(schema.domain.domain, domain),
				eq(schema.domain.organizationId, organizationId),
				isNull(schema.domain.deletedAt),
			),
		});
		if (activeDomain) throw new Error("Domain already exists");

		const deletedDomain = await db.query.domain.findFirst({
			where: and(
				eq(schema.domain.domain, domain),
				eq(schema.domain.organizationId, organizationId),
			),
		});

		// If domain exists and is soft-deleted, undelete it
		if (deletedDomain?.deletedAt) {
			const now = new Date();
			const domainId = deletedDomain.id;

			await db
				.update(schema.domain)
				.set({
					deletedAt: null,
					updatedAt: now,
					createdAt: now,
					status: "start-verify",
				})
				.where(eq(schema.domain.id, domainId));

			await db
				.update(schema.domainDnsRecord)
				.set({
					deletedAt: null,
					updatedAt: now,
				})
				.where(eq(schema.domainDnsRecord.domainId, domainId));

			// 3. Refetch the undeleted domain with DNS records (Option 2: refetch approach)
			const undeletedDomain = await db.query.domain.findFirst({
				where: and(
					eq(schema.domain.domain, domain),
					eq(schema.domain.organizationId, organizationId),
					isNull(schema.domain.deletedAt),
				),
				with: {
					dnsRecords: {
						where: isNull(schema.domainDnsRecord.deletedAt),
					},
				},
			});

			if (!undeletedDomain) {
				throw new Error("Failed to undelete domain");
			}

			logger.info({ domain }, "Domain undeleted successfully");
			return undeletedDomain;
		}

		const dnsRecords = await generateAllDNSRecords(domain);
		const { dkimRecord, spfRecord, dmarcRecord, mxRecord } = dnsRecords;
		logger.info(dnsRecords, "DNS records generated and stored successfully");
		const domainId = `domain_${createId()}`;
		await db.insert(schema.domain).values({
			id: domainId,
			userId: userId,
			organizationId: organizationId,
			domain: domain,
			domainType: "custom",
			status: "start-verify",
			userVerified: false,
			systemVerified: false,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		const dnsRecordIds = {
			domainId,
			organizationId,
			userId,
			domain,
		};
		await db.insert(schema.domainDnsRecord).values([
			{
				...dnsRecordIds,
				recordType: dkimRecord.type,
				name: dkimRecord.name,
				value: dkimRecord.value,
				ttl: dkimRecord.ttl,
				priority: dkimRecord.priority,
				privateKey: dkimRecord.privateKey,
			},
			{
				...dnsRecordIds,
				recordType: spfRecord.type,
				name: spfRecord.name,
				value: spfRecord.value,
				ttl: spfRecord.ttl,
			},
			{
				...dnsRecordIds,
				recordType: dmarcRecord.type,
				name: dmarcRecord.name,
				value: dmarcRecord.value,
				ttl: dmarcRecord.ttl,
			},
			{
				...dnsRecordIds,
				recordType: mxRecord.type,
				name: mxRecord.name,
				value: mxRecord.value,
				ttl: mxRecord.ttl,
			},
		]);
		const domainWithDnsRecords = await db.query.domain.findFirst({
			where: and(
				eq(schema.domain.domain, domain),
				eq(schema.domain.organizationId, organizationId),
				isNull(schema.domain.deletedAt),
			),
			with: {
				dnsRecords: {
					where: isNull(schema.domainDnsRecord.deletedAt),
				},
			},
		});
		if (!domainWithDnsRecords) {
			throw new Error("Failed to fetch domain with DNS records after creation");
		}
		logger.info(
			domainWithDnsRecords,
			"Domain with DNS records fetched successfully",
		);
		return domainWithDnsRecords;
	} catch (error) {
		logger.error(
			{
				domain,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error creating domain",
		);
		if (error instanceof Error && error.message.includes("already exists")) {
			throw status(409, { message: "Domain already exists" });
		}
		throw error;
	}
}

export async function createDomainHandler(params: {
	organizationId: string;
	userId: string;
	domain: string;
}): Promise<DomainTypes.DomainResponse> {
	const { organizationId, userId, domain } = params;
	logger.info(params, "Creating domain");
	const domainDetails = await createDomain({
		organizationId,
		userId,
		domain,
	});
	logger.info(domainDetails, "Domain created successfully");
	return domainDetails;
}
