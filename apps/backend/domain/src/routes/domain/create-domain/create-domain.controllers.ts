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
import { useLogger } from "evlog/elysia";
import { DomainErrors } from "@be/domain/lib/errors";
import {
	DOMAIN_CREATE_WEBHOOK_EVENT,
	DOMAIN_UNDELETE_WEBHOOK_EVENT,
} from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";

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
	cookie,
	requestDetails,
}: {
	organizationId: string;
	userId: string;
	cookie?: string;
	requestDetails?: {
		endpoint?: string;
		method?: string;
		userAgent?: string;
		ipAddress?: string;
		statusCode?: number;
	};
} & DomainTypes.CreateDomainRequest): Promise<DomainTypes.DomainResponse> {
	const logger = useLogger();
	try {
		logger.info("Finding exsiting domain", { domain });
		const activeDomain = await db.query.domain.findFirst({
			where: and(
				eq(schema.domain.domain, domain),
				eq(schema.domain.organizationId, organizationId),
				isNull(schema.domain.deletedAt),
			),
		});
		if (activeDomain) {
			logger.info("Domain already exists", { domain });
			throw DomainErrors.domainAlreadyExists(domain);
		}

		logger.info("Finding deleted domain", { domain });
		const deletedDomain = await db.query.domain.findFirst({
			where: and(
				eq(schema.domain.domain, domain),
				eq(schema.domain.organizationId, organizationId),
			),
		});

		if (deletedDomain?.deletedAt) {
			const now = new Date();
			const domainId = deletedDomain.id;
			logger.info("Undeleting domain", { domainId });

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
			logger.info("Undeleting domain DNS records", { domainId });
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
				throw DomainErrors.failedToUndelete(domain);
			}
			logger.info("Undeleted domain", { domainId });

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

		logger.info("Generating DNS records", { domain });
		const dnsRecords = await generateAllDNSRecords(domain);
		const { dkimRecord, spfRecord, dmarcRecord, mxRecord } = dnsRecords;
		const receivingMxRecord = generateReceivingMXRecord(
			domainConfig.HOST_DOMAIN,
			getDomainHost(domain),
			getCustomReturnPathSubString(domain, customReturnPath || "inbound"),
		);
		const domainId = `domain_${createId()}`;
		logger.info("Creating domain", { domainId });
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
		logger.info("Creating DNS records", { dnsRecordIds });
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
		logger.info("Fetching domain with DNS records", { domainId });
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
			throw DomainErrors.databaseError("Failed to fetch domain with DNS records after creation");
		}
		logger.info("Domain created successfully", { domainWithDnsRecords });

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
		logger.error("Error creating domain", { domain, error });
		throw error;
	}
}
