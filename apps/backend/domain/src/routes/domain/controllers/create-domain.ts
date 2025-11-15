import type { DomainTypes } from "@be/domain/routes/domain/domain.type";
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
		const existingDomain = await db
			.select({ id: schema.domain.id })
			.from(schema.domain)
			.where(
				and(
					eq(schema.domain.domain, domain),
					eq(schema.domain.organizationId, organizationId),
				),
			)
			.limit(1);
		if (existingDomain.length > 0) {
			logger.warn({ domain }, "Domain already exists");
			throw status(409, { message: "Domain already exists" });
		}
		// Check if DNS records already exist
		const existingRecords = await getExistingDNSRecords(domain, organizationId);

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
		if (existingRecords) {
			logger.info({ domain }, "Using existing DNS records");
			dnsData = {
				spfRecord: existingRecords.spfRecord,
				dkimRecord: existingRecords.dkimRecord,
				dmarcRecord: existingRecords.dmarcRecord,
			};
		} else {
			const generatedDNS = await generateDNSRecords(domain, serverIP, "reloop");
			dnsData = {
				spfRecord: generatedDNS.spfRecord,
				dkimRecord: generatedDNS.dkimRecord,
				dmarcRecord: generatedDNS.dmarcRecord,
			};
		}

		const newDomain = await db
			.insert(schema.domain)
			.values({
				userId: userId,
				organizationId: organizationId,
				domain: domain,
				domainType: "custom",
				status: "start-verify",
				userVerified: false,
				systemVerified: false,
				dnsConfigured: false,
				dkimSelector: "reloop",
				dmarcPolicy: "none",
				trackingDomain: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				spfRecord: dnsData.spfRecord,
				dkimRecord: dnsData.dkimRecord,
				dmarcRecord: dnsData.dmarcRecord,
			})
			.returning({
				id: schema.domain.id,
				domain: schema.domain.domain,
				organizationId: schema.domain.organizationId,
				userId: schema.domain.userId,
			});
		if (!newDomain[0]) {
			logger.error({ domain }, "Failed to create domain - no data returned");
			throw status(500, { message: "Failed to create domain" });
		}
		if (!existingRecords) {
			try {
				const generatedDNS = await generateDNSRecords(
					domain,
					serverIP,
					"reloop",
				);
				await insertDNSRecordsToDatabase(
					domain,
					organizationId,
					userId,
					generatedDNS.dnsData,
				);

				// Update the domain table with the generated DNS record values
				await db
					.update(schema.domain)
					.set({
						spfRecord: generatedDNS.spfRecord,
						dkimRecord: generatedDNS.dkimRecord,
						dmarcRecord: generatedDNS.dmarcRecord,
						updatedAt: new Date(),
					})
					.where(
						and(
							eq(schema.domain.domain, domain),
							eq(schema.domain.organizationId, organizationId),
						),
					);

				logger.info(
					{
						domain,
						spfRecord: generatedDNS.spfRecord,
						dkimRecord: generatedDNS.dkimRecord,
						dmarcRecord: generatedDNS.dmarcRecord,
					},
					"DNS records generated and stored successfully",
				);
			} catch (dnsError) {
				logger.error(
					{
						domain,
						error:
							dnsError instanceof Error ? dnsError.message : String(dnsError),
					},
					"Failed to generate DNS records and DKIM keys",
				);
			}
		}
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
			columns: {
				dkimPrivateKey: false, // Exclude private key for security
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
