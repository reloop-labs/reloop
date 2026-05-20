import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import { type dnsRecordTypeNameEnum, domainDnsRecord } from "@reloop/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { log } from "evlog";

type DomainRow = {
	id: string;
	domain: string;
	systemVerified: boolean | null;
	status: string;
	lastVerifiedAt: Date | null;
};

export async function checkDnsHealth_step3({
	domainId,
	organizationId,
	domainData,
}: {
	domainId: string;
	organizationId: string;
	domainData: DomainRow;
}) {
	const STALE_THRESHOLD_HOURS = 6;
	const lastVerified = domainData.lastVerifiedAt;
	const isRecent = lastVerified
		? Date.now() - new Date(lastVerified).getTime() <
			STALE_THRESHOLD_HOURS * 60 * 60 * 1000
		: false;

	if (domainData.systemVerified && domainData.status === "active" && isRecent) {
		return { isHealthy: true, missingRecords: [] };
	}

	// Cache is stale or domain is not fully verified — fire a reverification event
	// so a background worker can re-check DNS records for the whole domain.
	await bus
		.publish(BusEvent.DOMAIN_DNS_REVERIFICATION_REQUESTED, {
			domainId,
			organizationId,
			domain: domainData.domain,
			triggeredAt: new Date().toISOString(),
		})
		.catch((err) => {
			log.warn({
				...{
					domainId,
					error: err instanceof Error ? err.message : String(err),
					message: "Failed to publish DNS reverification event",
				},
			});
		});

	const requiredRecordTypes = ["SPF", "DKIM", "DMARC"];
	const dnsRecords = await db
		.select({
			recordTypeName: domainDnsRecord.recordTypeName,
			status: domainDnsRecord.status,
		})
		.from(domainDnsRecord)
		.where(
			and(
				eq(domainDnsRecord.domainId, domainId),
				eq(domainDnsRecord.organizationId, organizationId),
				inArray(
					domainDnsRecord.recordTypeName,
					requiredRecordTypes as (typeof dnsRecordTypeNameEnum.enumValues)[number][],
				),
			),
		)
		.limit(10);

	const activeRecords = new Set(
		dnsRecords
			.filter((r) => r.status === "active")
			.map((r) => r.recordTypeName),
	);

	const missingRecords = requiredRecordTypes.filter(
		(type) =>
			!activeRecords.has(
				type as (typeof dnsRecordTypeNameEnum.enumValues)[number],
			),
	);

	const isHealthy = missingRecords.length === 0;
	if (!isHealthy) {
		log.warn({
			...{ domainId, missingRecords },
			message: "Domain DNS health check failed",
		});
	}

	return { isHealthy, missingRecords };
}
