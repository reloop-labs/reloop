import { domainConfig } from "@be/domain/domain.config";
import type { DomainTypes } from "@be/domain/types/domain.type";
import {
	generateAllDNSRecords,
	generateReceivingMXRecord,
	getCustomReturnPathSubString,
	getDomainHost,
} from "@be/domain/utils";
import { createLog } from "@be/domain/utils/logger";
import { createId } from "@paralleldrive/cuid2";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import {
	DOMAIN_CREATE_WEBHOOK_EVENT,
	DOMAIN_UNDELETE_WEBHOOK_EVENT,
} from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function createDomainController({
	organizationId,
	userId,
	domain,
	customReturnPath,
	clickTracking,
	openTracking,
	tls,
	sendingEmail,
	receivingEmail,
	logger,
	cookie,
	requestDetails,
}: {
	organizationId: string;
	userId: string;
	logger: Logger;
	cookie?: string;
	requestDetails?: {
		endpoint?: string;
		method?: string;
		userAgent?: string;
		ipAddress?: string;
		statusCode?: number;
	};
} & DomainTypes.CreateDomainRequest): Promise<DomainTypes.DomainResponse> {
	try {
		logger.info({ domain }, "Finding exsiting domain");
		const activeDomain = await db.query.domain.findFirst({
			where: and(
				eq(schema.domain.domain, domain),
				eq(schema.domain.organizationId, organizationId),
				isNull(schema.domain.deletedAt),
			),
		});
		if (activeDomain) {
			logger.info({ domain }, "Domain already exists");
			throw new Error("Domain already exists");
		}

		logger.info({ domain }, "Finding deleted domain");
		const deletedDomain = await db.query.domain.findFirst({
			where: and(
				eq(schema.domain.domain, domain),
				eq(schema.domain.organizationId, organizationId),
			),
		});

		if (deletedDomain?.deletedAt) {
			const now = new Date();
			const domainId = deletedDomain.id;
			logger.info({ domainId }, "Undeleting domain");

			await db
				.update(schema.domain)
				.set({
					deletedAt: null,
					updatedAt: now,
					createdAt: now,
					status: "start-verify",
					customReturnPath,
					clickTracking,
					openTracking,
					tls,
					sendingEmail,
					receivingEmail,
				})
				.where(eq(schema.domain.id, domainId));
			logger.info({ domainId }, "Undeleting domain DNS records");
			await db
				.update(schema.domainDnsRecord)
				.set({
					deletedAt: null,
					updatedAt: now,
				})
				.where(eq(schema.domainDnsRecord.domainId, domainId));
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
			logger.info({ domainId }, "Undeleted domain");

			await createLog({
				event: DOMAIN_UNDELETE_WEBHOOK_EVENT.id,
				cookie,
				metadata: { domain, domainId },
				requestDetails: { ...(requestDetails || {}), statusCode: 201 },
			});

			return {
				...undeletedDomain,
				object: "domain" as const,
				event: DOMAIN_UNDELETE_WEBHOOK_EVENT.id,
			};
		}

		logger.info({ domain }, "Generating DNS records");
		const dnsRecords = await generateAllDNSRecords(domain);
		const { dkimRecord, spfRecord, dmarcRecord, mxRecord } = dnsRecords;
		const receivingMxRecord = generateReceivingMXRecord(
			domainConfig.HOST_DOMAIN,
			getDomainHost(domain),
			getCustomReturnPathSubString(domain, customReturnPath || "inbound"),
		);
		const domainId = `domain_${createId()}`;
		logger.info({ domainId }, "Creating domain");
		await db.insert(schema.domain).values({
			id: domainId,
			userId: userId,
			organizationId: organizationId,
			domain: domain,
			domainType: "custom",
			status: "start-verify",
			userVerified: false,
			systemVerified: false,
			customReturnPath,
			clickTracking,
			openTracking,
			tls,
			sendingEmail,
			receivingEmail,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		const dnsRecordIds = {
			domainId,
			organizationId,
			userId,
			domain,
		};
		logger.info({ dnsRecordIds }, "Creating DNS records");
		const recordsToInsert = [
			{
				...dnsRecordIds,
				recordType: dkimRecord.type,
				name: dkimRecord.name,
				fqdn: dkimRecord.fqdn,
				value: dkimRecord.value,
				priority: dkimRecord.priority,
				privateKey: dkimRecord.privateKey,
				recordTypeName: "DKIM" as const,
			},
			{
				...dnsRecordIds,
				recordType: spfRecord.type,
				name: spfRecord.name,
				fqdn: spfRecord.fqdn,
				value: spfRecord.value,
				recordTypeName: "SPF" as const,
			},
			{
				...dnsRecordIds,
				recordType: dmarcRecord.type,
				name: dmarcRecord.name,
				fqdn: dmarcRecord.fqdn,
				value: dmarcRecord.value,
				recordTypeName: "DMARC" as const,
			},
			{
				...dnsRecordIds,
				recordType: mxRecord.type,
				name: mxRecord.name,
				fqdn: mxRecord.fqdn,
				value: mxRecord.value,
				recordTypeName: "MX" as const,
				priority: mxRecord.priority,
			},
		];

		const hasDistinctReceivingMxRecord =
			receivingMxRecord.name !== mxRecord.name ||
			receivingMxRecord.value !== mxRecord.value ||
			receivingMxRecord.priority !== mxRecord.priority;

		if (hasDistinctReceivingMxRecord) {
			recordsToInsert.push({
				...dnsRecordIds,
				recordType: receivingMxRecord.type,
				name: receivingMxRecord.name,
				fqdn: receivingMxRecord.fqdn,
				value: receivingMxRecord.value,
				recordTypeName: "MX" as const,
				priority: receivingMxRecord.priority,
			});
		}
		await db.insert(schema.domainDnsRecord).values(recordsToInsert);
		logger.info({ domainId }, "Fetching domain with DNS records");
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
		logger.info({ domainWithDnsRecords }, "Domain created successfully");

		await createLog({
			event: DOMAIN_CREATE_WEBHOOK_EVENT.id,
			cookie,
			metadata: { domain, domainId },
			requestDetails: { ...(requestDetails || {}), statusCode: 201 },
		});

		return {
			...domainWithDnsRecords,
			object: "domain" as const,
			event: DOMAIN_CREATE_WEBHOOK_EVENT.id,
		};
	} catch (error) {
		logger.error({ domain, error }, "Error creating domain");

		if (error instanceof Error && error.message.includes("already exists")) {
			throw status(409, { message: "Domain already exists" });
		}
		throw error;
	}
}
