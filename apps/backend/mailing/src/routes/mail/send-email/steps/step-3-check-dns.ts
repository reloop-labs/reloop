import { db } from "@reloop/db/client";
import {
	domain,
	domainDnsRecord,
	type dnsRecordTypeNameEnum,
} from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq, inArray } from "drizzle-orm";

/**
 * Step 3: Check the DNS health (SPF, DKIM, DMARC) of the domain.
 */
export async function checkDnsHealth_step3({
	domainId,
	organizationId,
	logger,
}: {
	domainId: string;
	organizationId: string;
	logger: Logger;
}) {
	const domainData = await db.query.domain.findFirst({
		where: and(
			eq(domain.id, domainId),
			eq(domain.organizationId, organizationId),
		),
		columns: {
			id: true,
			domain: true,
			systemVerified: true,
			status: true,
			lastVerifiedAt: true,
		},
	});

	if (!domainData) {
		throw new Error("Domain not found during DNS health check");
	}

	const STALE_THRESHOLD_HOURS = 6;
	const lastVerified = domainData.lastVerifiedAt;
	const isRecent = lastVerified
		? Date.now() - new Date(lastVerified).getTime() <
			STALE_THRESHOLD_HOURS * 60 * 60 * 1000
		: false;

	if (domainData.systemVerified && domainData.status === "active" && isRecent) {
		return { isHealthy: true, missingRecords: [] };
	}

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
		dnsRecords.filter((r) => r.status === "active").map((r) => r.recordTypeName),
	);

	const missingRecords = requiredRecordTypes.filter(
		(type) =>
			!activeRecords.has(type as (typeof dnsRecordTypeNameEnum.enumValues)[number]),
	);

	const isHealthy = missingRecords.length === 0;
	if (!isHealthy) {
		logger.warn({ domainId, missingRecords }, "Domain DNS health check failed");
	}

	return { isHealthy, missingRecords };
}
