import { insertDNSRecordsToDatabase } from "@be/domain/routes/dns/controllers/generate-dns-records";
import type { DomainTypes } from "@be/domain/routes/domain/domain.type";
import { generateDNSRecords } from "@be/domain/utils/dns-operations";
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
		const existingDomain = await db.query.domain.findFirst({
			where: and(
				eq(schema.domain.domain, domain),
				eq(schema.domain.organizationId, organizationId),
				isNull(schema.domain.deletedAt),
			),
		});
		if (existingDomain) throw new Error("Domain already exists");
		const dnsRecords = await generateDNSRecords(domain);
		logger.info(dnsRecords, "DNS records generated and stored successfully");
		await db.insert(schema.domain).values({
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

		await insertDNSRecordsToDatabase(
			domain,
			organizationId,
			userId,
			dnsRecords,
		);
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
